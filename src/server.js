const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  Blockchain = require("./initblock");

const {getBlockChain, createNewBlock} = Blockchain;

const PORT = 3000;

const app = express();

// Middle Ware
app.use(bodyParser.json());
app.use(morgan("combined"));

// Routing
app.get("/blocks", (req,res) => { // 블록 보여주기
  res.send(getBlockChain());
});

app.post("/blocks", (req,res) => { // 블록 채굴
  const {body:{data}} = req;
  const newBlock = createNewBlock(data);
  res.send(newBlock);
});



app.listen(PORT, () => console.log(`HJ Coin Server Running On ${PORT}`));