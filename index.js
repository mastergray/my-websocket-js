import express from "express";
import expressWs from "express-ws";
import os from "os";

// Initalizes websocket server:
const PORT = 3001;
const app = express();
const wsInstance = expressWs(app);

// Stores single monitor connection:
let monitorConnection; 

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use("/", express.static('public'));

// Whatever is connected to this route can see all posted messages from all channels:
app.ws("/ws/monitor", (ws, req) => {

    // Shows something has connected to monitor:
    console.log("Monitor connected");

    // Closes existing monitor connection before storing new one:
    if (monitorConnection !== undefined) {
        monitorConnection.close();
    }

    // Stores monitor connection:
    monitorConnection = ws;

    // Something disconnected from monitor:
    ws.on('close', (code, reason) => {
        console.log(`Monitor disconnected`, code, reason);
    })

});

// Whatever is connected to this route can post a message from a specific channel:
app.ws('/ws/channel/:channelID', (ws, req) => {
    
    // Get chnnal ID from route:
    const {channelID} = req.params;

    // Shows something has connected to channel:
    console.log(`Channel ${channelID} connected`);

    // Relays message to "monitor" if monitor connection is set:
    ws.on('message', (message) => {
        if (monitorConnection) {
            console.log(`Message relayed by ${channelID}`)
            const json = JSON.stringify({"channel":channelID, "value":message});
            monitorConnection.send(json);
        } else {
            console.log("Message not relayed - no monitor found")
        }
    });

    // Something disconnected from this channel:
    ws.on('close', (code, reason) => {
        console.log(`Channel ${channelID} disconnected`, code, reason);
    })

});

// POST request can also relay message to "monitor" if set:
app.post("/channel/:channelID",  (req, res) => {

    const {channelID} = req.params;
    const {value} = req.body;

    if (monitorConnection) {
        console.log(`Message relayed by POST request ${channelID}`)
        const json = JSON.stringify({"channel":req.params.channelID, "value":req.body.value});
        monitorConnection.send(json);
        res.json({"success":true})
    } else {
        console.log("Message not relayed - no monitor found");
        res.send({"success":false})
    }
   
})

// Start server:
app.listen(PORT, () => {
    const ip = getLocalIPAddress();
    console.log(`Running from http://${ip}:${PORT}...`);
});

/**
 * 
 *  Support functions 
 * 
 */

// :: VOID -> STRING
// Returns IP address server is running from:
function getLocalIPAddress() {

    const networkInterfaces = os.networkInterfaces();
    const interfaceNames = Object.keys(networkInterfaces);
  
    for (const name of interfaceNames) {
      const networkInterface = networkInterfaces[name];
      for (const entry of networkInterface) {
        if (!entry.internal && entry.family === 'IPv4') {
          return entry.address;
        }
      }
    }

    return 'Unable to determine IP address';
  
}
