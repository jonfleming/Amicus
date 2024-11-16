# Amicus - Augmented Memory Inference

Tech Stack
  Typescript
  openai
  react
  react-three

``` javascript
C:\Projects\Amicus\node_modules\@mediapipe\tasks-vision>copy vision_bundle.mjs.map vision_bundle_mjs.js.map
```

### To Do

* Use viseme.js to get the viseme for each delta
* Use duration.js to get the duration of each delta
  * Update viseme with duration data
* Push viseme to a queue
  * When audio starts, start processing the viseme queue
  * Set morph target for viseme
* Transition to next viseme after duration

Add OpenAI API to relay-server on port 8082 to handle chat completion for GraphRAG

