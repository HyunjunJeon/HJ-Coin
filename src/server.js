const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  Blockchain = require("./initblock"),
  P2P = require("./p2p");

const {getBlockChain, createNewBlock} = Blockchain;
const {StartP2PServer} = P2P;

const PORT = process.env.HTTP_PORT || 3000;

const app = express();

// Middle Ware
app.use(bodyParser.json());
app.use(morgan("combined"));

// Routing
// VSC - Rest Client
app.get("/blocks", (req,res) => { // 블록 보여주기
  res.send(getBlockChain());
});

app.post("/blocks", (req,res) => { // 블록 채굴
  const {body:{data}} = req;
  const newBlock = createNewBlock(data);
  res.send(newBlock);
});


// Server Running
  // HTTP Server
const server = app.listen(PORT, 
  () => console.log(`HJ Coin HTTP Server Running On ${PORT}`)
);
  // P2P Server
StartP2PServer(server);