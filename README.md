# my-websocket-js

Proof-of-concept for using websockets with node.js and client-side Javascript

## What Is This?

Demonstrates how a "monitor" page can recieve messages from a "client" page for a given channel - where that "channel" is defined by an `id` query parameter. The "monitor" page can also recieve messages from a POST request, where a query parameters of `id` define the "channel ID" and a "value" body parameter defines the value of the "message" being sent. 


