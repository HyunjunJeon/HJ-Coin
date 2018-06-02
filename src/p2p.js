/*
  WebSocket은 HTTP 와 달리
  Connection이 유지됌. 그래서 속도가 더 빠르고 Resource 낭비가 적음
  페이지를 다시 보내고 요청하는 등의 과정을 거칠 필요가 없음
  => 서버와 Real-Time Connection 인거임
*/

// socket은 peer 와 peer 사이의 대화 통로
const WebSocket = require('ws'),
  Blockchain = require('./initblock');

const { getLastBlock, isBlockStructrueValid, addBlockToChain, replaceChain } = Blockchain;

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

const responseLatest = () => getBlockChainResponse([getLastBlock()]);

const handleSocketMessage = ws => {
  ws.on("Message",data => {
    const message = parseData(data);
    if(message == null){
      return;
    }
    console.log(message);
    switch(message.type){
      case GET_LATEST:
        sendMessage(ws,responseLatest());
        break;
      case BLOCKCHAIN_RESPONSE:
        const receiveBlocks = message.data;
        if (receiveBlocks == null){
          break;
        }
        handleBlockchainResponse(receiveBlocks);
        break;
    }
  });
};

const handleBlockchainResponse = receiveBlocks => {
  if(receiveBlocks.length === 0){
    console.log("Receive Blocks have a lenth of 0")
    return ;
  }
  const latestBlockReceived = receiveBlocks[receiveBlocks.lenth -1];
  if(!isBlockStructrueValid(latestBlockReceived)){
    console.log("The Block Structure of the Block Receive is Not Valid");
    return;
  }
  const newestBlock = getLastBlock();
  if(latestBlockReceived.index > newestBlock.index){
    if(newestBlock.hash === latestBlockReceived.previousHash){ // 1개 블록 앞서있을 때
      addBlockToChain(latestBlockReceived);
    }else if(receiveBlocks.length === 1){ // 2개 이상의 블록을 앞서 있을 때
      // to do, get all chain, we are waay behind
    }else{
      replaceChain(receiveBlocks);
    }
  }
}

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

// HTTP, P2P 서버는 같은 '포트'에 존재 가능 => Protocol이 다르니까
const StartP2PServer = server => {
  const wsServer = new WebSocket.Server({ server });
  wsServer.on("Connection", ws => {
    //console.log(`Hello ${ws}`);
    initSocketConnection(ws);
  });
  console.log("HJ Coin P2P Server is Running~~!!");
};

module.exports = {
  StartP2PServer,
  connectToPeers
};