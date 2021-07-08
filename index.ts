import { Blockchain, Wallet } from "./blockchain";

const blockchain = new Blockchain();

const alice = new Wallet(blockchain);
const bob = new Wallet(blockchain);

const miner = new Wallet(blockchain);

alice.createTransaction(bob.adress, 70);
bob.createTransaction(alice.adress, 50);

console.log()
console.log(`${alice.adress} - ${blockchain.balanceOfAdress(alice.adress)}`)
console.log(`${bob.adress} - ${blockchain.balanceOfAdress(bob.adress)}`)
console.log(`${miner.adress} - ${blockchain.balanceOfAdress(miner.adress)}`)
console.log()

blockchain.minePendingTransactions(miner.adress);

console.log()
console.log(`${alice.adress} - ${blockchain.balanceOfAdress(alice.adress)}`)
console.log(`${bob.adress} - ${blockchain.balanceOfAdress(bob.adress)}`)
console.log(`${miner.adress} - ${blockchain.balanceOfAdress(miner.adress)}`)
console.log()

miner.createTransaction(alice.adress, 30);
bob.createTransaction(alice.adress, 60);

blockchain.minePendingTransactions(miner.adress);

console.log()
console.log(`${alice.adress} - ${blockchain.balanceOfAdress(alice.adress)}`)
console.log(`${bob.adress} - ${blockchain.balanceOfAdress(bob.adress)}`)
console.log(`${miner.adress} - ${blockchain.balanceOfAdress(miner.adress)}`)
console.log()

console.log()
console.log('Blockchain valid: ' + blockchain.isChainValid)
console.log(JSON.stringify(blockchain.chain, null, 2))
console.log()

console.log('tampering chain...')
blockchain.chain[1].transactions[0].amount = 200;
console.log('Blockchain valid: ' + blockchain.isChainValid)
