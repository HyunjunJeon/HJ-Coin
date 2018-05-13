const CryptoJS = require('crypto-js');

class Block{
    // Hash - 랜덤 아웃풋을 내기 위해 (암호화)
    constructor(index, hash, previousHash, timestamp, data){
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}

// 첫번째 블록은 직접 만들어주어야 함
const genesisBlock = new Block(
    0,
    "F53CF2C1210D6C37569107D5591BA2B76A9DF4AC54D0EE273EDFBFEA9ABA2D62",
    null,
    1526201337153,
    "This is the Genesis Block"
);

let blockchain = [genesisBlock];

const getLastBlock = () => blockchain[blockchain.length -1];

const getTimeStamp = () => new Date().getTime() / 1000;

const createHash = (index, previousHash, timestamp, data) => CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

const createNewBlock = data => {
    const previousBlock = getLastBlock();
    const newBlockIndex = previousBlock + 1;
    const newTimeStamp = getTimeStamp();
    const newHash = createHash(newBlockIndex, previousBlock.hash, newTimeStamp, data);
    const newBlock = new Block(newBlockIndex, previousBlock.hash, newTimeStamp, data);
    return newBlock;
};

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

// Validation - 다른사람도 블록을 추가할 수 있으므로 검증이 필수적

const isNewBlockValid = (candidateBlock, latestBlock) => {
    if(latestBlock.index + 1 !== candidateBlock.index){
        console.log("The candidate Block doesn't have a valid index");
        return false;
    }else if (latestBlock.hash !== candidateBlock.previousHash){
        console.log("The previousHash of the candidate block is not the hash of the latest block");
        return false;
    }else if(getBlockHash(candidateBlock) !== candidateBlock.hash){
        console.log("The hash of this block is invalid");
        return false;
    }
    return true;
};