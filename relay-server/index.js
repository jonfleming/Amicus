import { RealtimeRelay } from './lib/relay.js';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error(
    `Environment variable "OPENAI_API_KEY" is required.\n` +
      `Please set it in your .env file.`
  );
  process.exit(1);
}

const WS_PORT = parseInt(process.env.PORT) || 8081;
const API_PORT = parseInt(process.env.API_PORT) || 8082;

const relay = new RealtimeRelay(OPENAI_API_KEY);
relay.wsListen(WS_PORT);
relay.apiListen(API_PORT);
