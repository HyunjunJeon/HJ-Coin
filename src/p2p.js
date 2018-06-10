/*
  WebSocket은 HTTP 와 달리
  Connection이 유지됌. 그래서 속도가 더 빠르고 Resource 낭비가 적음
  페이지를 다시 보내고 요청하는 등의 과정을 거칠 필요가 없음
  => 서버와 Real-Time Connection 인거임
*/

// socket은 peer 와 peer 사이의 대화 통로
const WebSocket = require('ws'),
  Blockchain = require('./initblock');

const { getBlockChain, getLastBlock, isBlockStructrueValid, 
  addBlockToChain, replaceChain } = Blockchain;

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
  sockets.push(ws);
  handleSocketMessage(ws);
  handleSocketError(ws);
  sendMessage(ws,getLastest());
};

// 데이터를 가져와서 Parse 시키는데 혹시나 Error를 위한 try-catch
const parseData = data => {
  try{
    return JSON.parse(data);
  }catch(e){
    console.log(e);
    return null;
  }
};

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const sendMessageToAll = message => sockets.forEach( socket => sendMessage(ws, message));

const responseLatest = () => getBlockChainResponse([getLastBlock()]);

const responseAll = () => getBlockChainResponse(getBlockChain());

// Message를 얻었을 때 어떻게 해야하는가??
const handleSocketMessage = ws => {
  ws.on("Message", data => {
    const message = parseData(data); // 데이터를 JSON 타입으로 바꾸고
    if(message == null){
      return;
    }
    console.log(message); // Check 용 Console 출력
    switch(message.type){ // Message 타입별 기능 구분
      case GET_LATEST: // 가장 최근 블록 가져오기
        sendMessage(ws,responseLatest()); 
        break;
      case BLOCKCHAIN_RESPONSE:
        const receiveBlocks = message.data;
        if (receiveBlocks == null){
          break;
        }
        handleBlockchainResponse(receiveBlocks);
        break;
      case GET_ALL:
        sendMessage(ws, responseAll());
        break;
    }
  });
};

const handleBlockchainResponse = receiveBlocks => {
  if(receiveBlocks.length === 0){ // 받은 블록이 비어있다면
    console.log("Receive Blocks have a lenth of 0");
    return ;
  }
  const latestBlockReceived = receiveBlocks[receiveBlocks.lenth -1]; // 가장 마지막 블록을 선택
  if(!isBlockStructrueValid(latestBlockReceived)){ // 구조가 확실한지 확인
    console.log("The Block Structure of the Block Receive is Not Valid");
    return;
  }
  const newestBlock = getLastBlock();
  if(latestBlockReceived.index > newestBlock.index){
    if(newestBlock.hash === latestBlockReceived.previousHash){ // 1개 블록 앞서있을 때 ( 바로 옆에 붙어있음 )
      if(addBlockToChain(latestBlockReceived)){
        broadCastNewBlock();
      }
    }else if(receiveBlocks.length === 1){ // 2개 이상의 블록을 앞서 있을 때 ( 멀리 떨어져 있음 )
      // 전체 블록체인을 가져옴 -> 모든 Socket에게 보내달라고 함
      sendMessageToAll(getAll());
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

const broadCastNewBlock = () => sendMessageToAll(responseLatest());

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
  connectToPeers,
  broadCastNewBlock
};