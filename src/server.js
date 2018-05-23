const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  Blockchain = require("./initblock"),
  P2P = require("./p2p");

const {getBlockChain, createNewBlock} = Blockchain;
const {StartP2PServer, connectToPeers} = P2P;

// 실행 시 export HTTP_PORT=4000 같은걸 넣어줄 수 있도록
const PORT = process.env.HTTP_PORT || 3000;

const app = express();

// ***Middle Ware***
app.use(bodyParser.json());
app.use(morgan("combined"));

// ***Routing*** ,,, VSC - Rest Client

  // 블록 보여주기
app.get("/blocks", (req,res) => { 
  res.send(getBlockChain());
});

  // 블록 채굴
app.post("/blocks", (req,res) => { 
  const {body : {data} } = req;
  const newBlock = createNewBlock(data);
  res.send(newBlock);
});

  // Connect Peers Each Other
app.post("/peers", (req,res)=>{
  const {body : {peer} } = req;
  connectToPeers(peer);
  res.send();
});

// ***Server Running***
  // HTTP Server
const server = app.listen(PORT, 
  () => console.log(`HJ Coin HTTP Server Running On ${PORT}`)
);
  // P2P Server (need WebServer)
StartP2PServer(server);