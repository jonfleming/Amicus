import { WebSocketServer } from 'ws';
import express from 'express';
import OpenAI from 'openai';
import { RealtimeClient } from '@openai/realtime-api-beta';

export class RealtimeRelay {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sockets = new WeakMap();
    this.wss = null;
    this.expressApp = express();
    this.setupExpressRoutes();
  }

  setupExpressRoutes() {
    const client = new OpenAI(this.apiKey);

    // Add CORS middleware
    this.expressApp.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', '*');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    this.expressApp.use(express.json()) // for parsing application/json
    this.expressApp.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

    // New endpoint for message classification
    this.expressApp.post('/v1/classify', async (req, res) => {
      try {
        const userMessage = req.body.message;
        if (!userMessage) {
          return res.status(400).json({ error: 'Message is required' });
        }

        const response = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a classifier that determines if a message is a question or a statement. Respond with only 'question' or 'statement'."
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          model: "gpt-3.5-turbo",
          temperature: 0,
          max_tokens: 1
        });

        const classification = response.choices[0].message.content.toLowerCase();
        res.json({ 
          message: userMessage,
          classification: classification
        });
      } catch (error) {
        console.error('Error classifying message:', error);
        res.status(500).json({ error: 'Error classifying message' });
      }
    });

    try {
      this.expressApp.post('/v1/chat/completions', express.json(), async (req, res) => {
        console.log(req);  
        const response = await client.chat.completions.create({
          messages: req.body.messages,
          model: req.body.model,
        });
        res.json(response.data);
      });
    } catch (error) {
      console.error('Error forwarding request to OpenAI:', error);
      res.status(500).send('Error forwarding request to OpenAI');
    }

    this.expressApp.post('/', express.json(), async (req, res) => {
      console.log(req);
      res.status(200).json({ body: req.body, url: req.url });
    });

    this.expressApp.post('/*', express.json(), async (req, res) => {
      console.log(req);
      res.status(200).json({ body: req.body, url: req.url });
    });
  }

  wsListen(port) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', this.connectionHandler.bind(this));
    this.log(`Listening on ws://localhost:${port}`);
  }

  apiListen(port) {
    this.expressApp.listen(port, () => {
      this.log('Express server Listening on http://localhost:8082');
    });
  }

  async connectionHandler(ws, req) {
    if (!req.url) {
      this.log('No URL provided, closing connection.');
      ws.close();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname !== '/') {
      this.log(`Invalid pathname: "${pathname}"`);
      ws.close();
      return;
    }

    // Instantiate new client
    this.log(`Connecting with key "${this.apiKey.slice(0, 3)}..."`);
    const client = new RealtimeClient({ apiKey: this.apiKey });

    // Relay: OpenAI Realtime API Event -> Browser Event
    client.realtime.on('server.*', (event) => {
      //this.log(`Relaying "${event.type}" to Client`);
      ws.send(JSON.stringify(event));
    });
    client.realtime.on('close', () => ws.close());

    // Relay: Browser Event -> OpenAI Realtime API Event
    // We need to queue data waiting for the OpenAI connection
    const messageQueue = [];
    const messageHandler = (data) => {
      try {
        const event = JSON.parse(data);
        //this.log(`Relaying "${event.type}" to OpenAI`);
        client.realtime.send(event.type, event);
      } catch (e) {
        console.error(e.message);
        this.log(`Error parsing event from client: ${data}`);
      }
    };
    ws.on('message', (data) => {
      if (!client.isConnected()) {
        messageQueue.push(data);
      } else {
        messageHandler(data);
      }
    });
    ws.on('close', () => client.disconnect());

    // Connect to OpenAI Realtime API
    try {
      this.log(`Connecting to OpenAI...`);
      await client.connect();
    } catch (e) {
      this.log(`Error connecting to OpenAI: ${e.message}`);
      ws.close();
      return;
    }
    this.log(`Connected to OpenAI successfully!`);
    while (messageQueue.length) {
      messageHandler(messageQueue.shift());
    }
  }

  log(...args) {
    console.log(`[RealtimeRelay]`, ...args);
  }
}
