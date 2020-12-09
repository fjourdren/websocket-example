const express = require('express');
const socketIO = require('socket.io');
const RiveScript = require('rivescript');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

// init express to send files
const server = express()
  .use(express.static('public'))
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// init socket io server
const io = socketIO(server);


// init RiveScript
var riveScriptBot = new RiveScript();

// Load an individual RiveScript file
riveScriptBot.loadFile("./rivescript_scripts/main.rive").then(loading_done).catch(rivescript_loading_error);

// callback when rivescript is succesfuly loaded
function loading_done() {
  console.log("RiveScript has finished loading file");

  // rivescript replies must be sorted!
  riveScriptBot.sortReplies()
}

// catch if an error occur while loading rivescript file
function rivescript_loading_error(error, filename, lineno) {
  console.log("Error when loading rivescript file: " + filename + " (" + error + ")");
}


// socker io listeners
io.on('connection', (socket) => {
  console.log('Client connected');

  // on receive a message
  socket.on('user-message', (msg) => {
    console.log("Client message: " + msg)

    // get output value from rivescript
    let username = "default" // rivescript can manage multi user, here we keep it as a default
    riveScriptBot.reply(username, msg).then(function(reply) {
      console.log("Server message: " + reply);
      socket.emit('server-message', reply);
    });
    
  });
});