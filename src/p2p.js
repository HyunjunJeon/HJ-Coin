/*
  WebSocket은 HTTP 와 달리
  Connection이 유지됌. 그래서 속도가 더 빠르고 Resource 낭비가 적음
  페이지를 다시 보내고 요청하는 등의 과정을 거칠 필요가 없음
  => 서버와 Real-Time Connection 인거임
*/

// socket은 peer 와 peer 사이의 대화 통로
const WebSocket = require('ws');

const sockets = [];

const getSockets = () => sockets;

// HTTP, P2P 서버는 같은 '포트'에 존재 가능 => Protocol이 다르니까
const StartP2PServer = server => {
  const wsServer = new WebSocket.Server({server});
  wsServer.on("Connection", ws => { 
    //console.log(`Hello ${ws}`);
    initSocketConnection(ws);
  });
  console.log("HJ Coin P2P Server is Running~~!!");
};

const initSocketConnection = socket => {
  sockets.push(socket);
  socket.on("message", (data) => {
    console.log(data);
  });
  setTimeout(() => socket.send("weblcome")
  ,5000);
};

// peer 와 peer 간 연결
const connectToPeers = newPeer => {
  const ws = new WebSockets(newPeer);
  ws.on("open the connection", () => {
    initSocketConnection(ws);
  });
};

const initError = ws => {
  const closeSocketConnection = ws => {
    ws.close();
    sockets.splice(sockets.indexOf(ws), 1);
  }
  ws.on("close",()=>{
    closeSocketConnection(ws);
  });
  ws.on("error",()=>{
    closeSocketConnection(ws);
  });
};


module.exports = {
  StartP2PServer,
  connectToPeers
};