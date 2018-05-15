const CryptoJS = require('crypto-js');

// 1. 블록의 구성
class Block{
    /* Hash - 암호회된 아웃풋을 내기 위해서
     해쉬는 input이 바뀌면 '아웃풋'도 무조건 바뀜
     다음 블록은 이전 블록의 Hash를 가져다가 사용
    */
    constructor(index, hash, previousHash, timestamp, data){
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}

// 2. 모든 블록체인의 '첫번째' 블록
const genesisBlock = new Block(
    0,
    "F53CF2C1210D6C37569107D5591BA2B76A9DF4AC54D0EE273EDFBFEA9ABA2D62", // SHA256 웹사이트에 입력하여 받은 값 사용
    null,
    1526201337153, // new Date().getTime() -> 처음 만들던 시점의 값을 이용함
    "This is the Genesis Block"
);

let blockchain = [genesisBlock];

// 정보 제공용 함수
const getLastBlock = () => blockchain[blockchain.length -1];
const getTimeStamp = () => new Date().getTime() / 1000;
const getBlockChain = () => blockchain;
const createHash = (index, previousHash, timestamp, data) =>  // data를 string 처리 -> Validaton 때문
   CryptoJS.SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

// 3. 새로운 블록을 만드는 함수     
const createNewBlock = data => {
    const previousBlock = getLastBlock(); // 직전 블록 정보 가져옴
    const newBlockIndex = previousBlock.index + 1; // 직전 블록의 index
    const newTimeStamp = getTimeStamp(); 
    const newHash = createHash(newBlockIndex, previousBlock.hash, newTimeStamp, data);
    const newBlock = new Block(newBlockIndex, newHash, previousBlock.hash, newTimeStamp, data);
    addBlockToChain(newBlock);
    return newBlock;
}

// 4. Validation1 - Block Structure
const isNewStructrueValid = block => {
    return ( // 타입검증을 통해 하나라도 틀리면 false
        typeof block.index === "number" &&
        typeof block.hash === "string" &&
        typeof block.previousHash === "string" &&
        typeof block.timestamp === "number" &&
        typeof block.data === "string"
    );
}

// 5. Validation2 - Block Content
const isNewBlockValid = (candidateBlock, latestBlock) => { // 후보블록 : 추가하고 싶은 블록 & 가장 최근 추가된 블록
    if(!isNewStructrueValid(candidateBlock)){ // Block Structure 검증
        console.log("The candidate block is not valid")
        return false;
    }else if(latestBlock.index + 1 !== candidateBlock.index){ // 최근 추가된 블록의 인덱스 + 1 = 후보블록 인덱스
        console.log("The candidate Block doesn't have a valid index");
        return false;
    }else if (latestBlock.hash !== candidateBlock.previousHash){ // 최근 추가된 블록의 Hash = 후보블록에 기록된 이전 hash
        console.log("The previousHash of the candidate block is not the hash of the latest block");
        return false;
    }else if(getBlockHash(candidateBlock) !== candidateBlock.hash){ // 후보블록 내용으로 새로 만든 Hash = 후보 블록 원래 보관중인 hash
        console.log("The hash of this block is invalid");
        return false;
    }
    return true;
}

// 6. Validation3 - Chain Structure -> Chain을 Replace 해야하기 때문에, 더 긴 블록체인을 사용해야 할 것이므로
const isChainValid = (candidateChain) => {
    const isGenesisValid = block => JSON.stringify(block) === JSON.stringify(genesisBlock);
    if(!isGenesisValid(candidateChain[0])){ // 후보 체인의 genesisBlock 검증 -> 두개의 블록체인이 같은 초기 블록으로부터 시작하는가
        console.log("The candidate Chain's genesisBlock is not the smae as our genesis Block");
        return false;
    }
    for(let i = 1; i < candidateChain.length; i++){ // i = 1 -> genesisBlock은 previousHash 없으므로 검증에서 제외
        if(!isNewBlockValid(candidateChain[i], candidateChain[i-1])){
            return false;
        }
    }
    return true;
}

// 7. 블록체인이 유효하다면 교체
const replaceChain = candidateChain => {
    if(isChainValid(candidateChain) && candidateChain.length > getBlockChain().lenth){ // 현재 체인길이 < 후보체인 길이
        blockchain = candidateChain;
        return true;
    } else{
        return false;
    }
}

// 7-1. 체인에 새로운 블록을 추가하기
const addBlockToChain = candidateBlock => {
    if(isNewBlockValid(candidateBlock, getLastBlock())){
        getBlockChain().push(candidateBlock);
        return true;
    } else{
        return false;
    }
}

module.exports = {
    getBlockChain,createNewBlock
}