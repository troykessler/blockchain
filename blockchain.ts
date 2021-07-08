import * as crypto from 'crypto'
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export class Wallet {
  public blockchain: Blockchain;

  private keypair: EC.KeyPair;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;

    this.keypair = ec.genKeyPair();

    console.log('--- WALLET CREATED ---')
    console.log('Public Key: ' + this.keypair.getPublic('hex'));
    console.log('Private Key: ' + this.keypair.getPrivate('hex'));
  }

  get adress() {
    return this.keypair.getPublic('hex');
  }

  createTransaction(to: string, amount: number) {
    const transaction = new Transaction(this.keypair.getPublic('hex'), to, amount);
    transaction.signTransaction(this.keypair.sign(transaction.calculateHash()));
    this.blockchain.createTransaction(transaction);
  }
}

export class Transaction {
  public fromAdress: string | null;
  public toAdress: string;
  public amount: number;
  public signature: any;

  constructor(fromAdress: string | null, toAdress: string, amount: number) {
    this.fromAdress = fromAdress;
    this.toAdress = toAdress;
    this.amount = amount;
  }

  calculateHash() {
    const transactionString = JSON.stringify(this.fromAdress) + JSON.stringify(this.toAdress) + JSON.stringify(this.amount);
    return crypto.createHash('sha256').update(transactionString).digest('base64');
  }

  signTransaction(signature: any) {
    this.signature = signature;
  }

  verifyTransaction(): boolean {
    if (!this.fromAdress || !this.signature) {
      return true;
    }
    const key = ec.keyFromPublic(this.fromAdress, 'hex');
    return key.verify(this.calculateHash(), this.signature); 
  }
}

class Block {
  public prevHash: string | null = null;
  public timestamp: number;
  public transactions: Transaction[];
  public nonce: number = 0;
  public hash: string;

  constructor(transactions: Transaction[]) {
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const blockString = JSON.stringify(this.prevHash) + JSON.stringify(this.timestamp) + JSON.stringify(this.transactions) + JSON.stringify(this.nonce);
    return crypto.createHash('sha256').update(blockString).digest('base64');
  }

  mine(difficulty: number) {
    console.log('mining block...')

    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log('Block mined: ' + this.hash);
  }
}

export class Blockchain {

  public chain: Block[];
  private difficulty: number;
  public pendingTransactions: Transaction[] = [];
  private miningReward: number;

  constructor() {
    this.chain = [new Block([])];
    this.difficulty = 3;
    this.miningReward = 100;
  }

  get lastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(minerAdress: string) {
    if (this.pendingTransactions.every((tx: Transaction) => tx.verifyTransaction())) {
      const block = new Block([...this.pendingTransactions, new Transaction(null, minerAdress, this.miningReward)]);
      block.prevHash = this.lastBlock.hash;
      block.mine(this.difficulty);
  
      this.chain.push(block)
      this.pendingTransactions = [];
    }
  }

  createTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
  }

  balanceOfAdress(adress: string) {
    let balance = 0;

    this.chain.forEach((block: Block) => {
      block.transactions?.forEach((transaction: Transaction) => {
        if (adress === transaction.fromAdress) {
          balance -= transaction.amount;
        }

        if (adress === transaction.toAdress) {
          balance += transaction.amount;
        }
      })
    })

    return balance;
  }

  get isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.prevHash !== prevBlock.hash) {
        return false;
      }

      return currentBlock.transactions.every((tx: Transaction) => tx.verifyTransaction())
    }

    return true;
  }

}
