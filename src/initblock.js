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

const getBlockChain = () => blockchain;

const createHash = (index, previousHash, timestamp, data) => // data를 string 처리해버림 -> 추후 검증때 문제가 생길 수 있으므로
    CryptoJS.SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();

const createNewBlock = data => {
    const previousBlock = getLastBlock();
    const newBlockIndex = previousBlock + 1;
    const newTimeStamp = getTimeStamp();
    const newHash = createHash(newBlockIndex, previousBlock.hash, newTimeStamp, data);
    const newBlock = new Block(newBlockIndex, previousBlock.hash, newTimeStamp, data);
    return newBlock;
}

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

// Validation - 다른사람도 블록을 추가할 수 있으므로 Validation이 필수적

const isNewBlockValid = (candidateBlock, latestBlock) => {
    if(!isNewStructrueValid(candidateBlock)){
        console.log("The candidate block is not valid")
        return false;
    }
    else if(latestBlock.index + 1 !== candidateBlock.index){
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
}

const isNewStructrueValid = block => {
    return (
        typeof block.index === "number" &&
        typeof block.hash === "string" &&
        typeof block.previousHash === "string" &&
        typeof block.timestamp === "number" &&
        typeof block.data === "string"
    );
}

const isChainValid = (candidateChain) => {
    const isGenesisValid = block => JSON.stringify(block) === JSON.stringify(genesisBlock);
    if(!isGenesisValid(candidateChain[0])){ // 후보 체인의 genesisBlock 검증
        console.log("The candidate Chain's genesisBlock is not the smae as our genesis Block");
        return false;
    }
    for(let i = 1; i < candidateChain.length; i++){ // genesis block은 이전 해쉬가 없으므로 검증에서 제외
        if(!isNewBlockValid(candidateChain[i],candidateChain[i-1])){
            return false;
        }
    }
    return true;
}

const replaceChain = candidateChain => {
    if(isChainValid(candidateChain) && candidateChain.length > getBlockChain().lenth){
        blockchain = candidateChain;
        return true;
    } else {
        return false;
    }
}

const addBlockToChain = candidateBlock => {
    if(isNewBlockValid(candidateBlock,getLastBlock())){
        getBlockChain().push(candidateBlock);
        return true;
    } else{
        return false;
    }
}