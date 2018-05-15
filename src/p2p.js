const WebSocket = require('ws');

const sockets = [];

const StartP2PServer = server => {
  const wsServer = new WebSocket.Server({server});
  wsServer.on("Connection", ws => {
    console.log(`Hello ${ws}`);
  });
  console.log("HJ Coin P2P Server is Running~~!!");
}

module.exports = StartP2PServer