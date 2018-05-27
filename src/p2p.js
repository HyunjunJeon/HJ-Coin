/*
  WebSocket은 HTTP 와 달리
  Connection이 유지됌. 그래서 속도가 더 빠르고 Resource 낭비가 적음
  페이지를 다시 보내고 요청하는 등의 과정을 거칠 필요가 없음
  => 서버와 Real-Time Connection 인거임
*/

// socket은 peer 와 peer 사이의 대화 통로
const WebSocket = require('ws'),
  Blockchain = require('./initblock');

const { getLastBlock } = Blockchain;

const sockets = [];

// Message Types 
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RESPONSE = "BLOCKCHAIN_RESPONSE";

// Message Creator ( like Redux )
const getLastest = () => { 
  return{
    type: GET_LATEST,
    data: null,
  };
};

const getAll = () => {
  return {
    type: GET_ALL,
    data: null,
  };
};

const getBlockChainResponse = data => {
  return {
    type: BLOCKCHAIN_RESPONSE,
    data: data,
  };
}

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

const initSocketConnection = ws => {
  sockets.push(socket);
  handleSocketMessage(ws);
  handleSocketError(ws);
  sendMessage(ws,getLastest());
};

const parseData = data => {
  try{
    return JSON.parse(data);
  }catch(e){
    console.log(e);
    return null;
  }
};

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const handleSocketMessage = ws => {
  ws.on("Message",data => {
    const message = parseData(data);
    if(message == null){
      return;
    }
    console.log(message);
    switch(message.type){
      case GET_LATEST:
        sendMessage(ws,getLastBlock());
        break;
    }
  });
};

const handleSocketError = ws => {
  const closeSocketConnection = ws => {
    ws.close();
    sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on("close",() => closeSocketConnection(ws));
  ws.on("error",() => closeSocketConnection(ws));
};

// peer 와 peer 간 연결
const connectToPeers = newPeer => {
  const ws = new WebSockets(newPeer);
  ws.on("open the connection", () => {
    initSocketConnection(ws);
  });
};

module.exports = {
  StartP2PServer,
  connectToPeers
};