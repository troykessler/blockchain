"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = exports.Transaction = exports.Wallet = void 0;
var crypto = __importStar(require("crypto"));
var elliptic_1 = require("elliptic");
var ec = new elliptic_1.ec('secp256k1');
var Wallet = /** @class */ (function () {
    function Wallet(blockchain) {
        this.blockchain = blockchain;
        this.keypair = ec.genKeyPair();
        console.log('--- WALLET CREATED ---');
        console.log('Public Key: ' + this.keypair.getPublic('hex'));
        console.log('Private Key: ' + this.keypair.getPrivate('hex'));
    }
    Object.defineProperty(Wallet.prototype, "adress", {
        get: function () {
            return this.keypair.getPublic('hex');
        },
        enumerable: false,
        configurable: true
    });
    Wallet.prototype.createTransaction = function (to, amount) {
        var transaction = new Transaction(this.keypair.getPublic('hex'), to, amount);
        transaction.signTransaction(this.keypair.sign(transaction.calculateHash()));
        this.blockchain.createTransaction(transaction);
    };
    return Wallet;
}());
exports.Wallet = Wallet;
var Transaction = /** @class */ (function () {
    function Transaction(fromAdress, toAdress, amount) {
        this.fromAdress = fromAdress;
        this.toAdress = toAdress;
        this.amount = amount;
    }
    Transaction.prototype.calculateHash = function () {
        var transactionString = JSON.stringify(this.fromAdress) + JSON.stringify(this.toAdress) + JSON.stringify(this.amount);
        return crypto.createHash('sha256').update(transactionString).digest('base64');
    };
    Transaction.prototype.signTransaction = function (signature) {
        this.signature = signature;
    };
    Transaction.prototype.verifyTransaction = function () {
        if (!this.fromAdress || !this.signature) {
            return true;
        }
        var key = ec.keyFromPublic(this.fromAdress, 'hex');
        return key.verify(this.calculateHash(), this.signature);
    };
    return Transaction;
}());
exports.Transaction = Transaction;
var Block = /** @class */ (function () {
    function Block(transactions) {
        this.prevHash = null;
        this.nonce = 0;
        this.timestamp = Date.now();
        this.transactions = transactions;
        this.hash = this.calculateHash();
    }
    Block.prototype.calculateHash = function () {
        var blockString = JSON.stringify(this.prevHash) + JSON.stringify(this.timestamp) + JSON.stringify(this.transactions) + JSON.stringify(this.nonce);
        return crypto.createHash('sha256').update(blockString).digest('base64');
    };
    Block.prototype.mine = function (difficulty) {
        console.log('mining block...');
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined: ' + this.hash);
    };
    return Block;
}());
var Blockchain = /** @class */ (function () {
    function Blockchain() {
        this.pendingTransactions = [];
        this.chain = [new Block([])];
        this.difficulty = 3;
        this.miningReward = 100;
    }
    Object.defineProperty(Blockchain.prototype, "lastBlock", {
        get: function () {
            return this.chain[this.chain.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Blockchain.prototype.minePendingTransactions = function (minerAdress) {
        if (this.pendingTransactions.every(function (tx) { return tx.verifyTransaction(); })) {
            var block = new Block(__spreadArray(__spreadArray([], this.pendingTransactions), [new Transaction(null, minerAdress, this.miningReward)]));
            block.prevHash = this.lastBlock.hash;
            block.mine(this.difficulty);
            this.chain.push(block);
            this.pendingTransactions = [];
        }
    };
    Blockchain.prototype.createTransaction = function (transaction) {
        this.pendingTransactions.push(transaction);
    };
    Blockchain.prototype.balanceOfAdress = function (adress) {
        var balance = 0;
        this.chain.forEach(function (block) {
            var _a;
            (_a = block.transactions) === null || _a === void 0 ? void 0 : _a.forEach(function (transaction) {
                if (adress === transaction.fromAdress) {
                    balance -= transaction.amount;
                }
                if (adress === transaction.toAdress) {
                    balance += transaction.amount;
                }
            });
        });
        return balance;
    };
    Object.defineProperty(Blockchain.prototype, "isChainValid", {
        get: function () {
            for (var i = 1; i < this.chain.length; i++) {
                var currentBlock = this.chain[i];
                var prevBlock = this.chain[i - 1];
                if (currentBlock.hash !== currentBlock.calculateHash()) {
                    return false;
                }
                if (currentBlock.prevHash !== prevBlock.hash) {
                    return false;
                }
                return currentBlock.transactions.every(function (tx) { return tx.verifyTransaction(); });
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    return Blockchain;
}());
exports.Blockchain = Blockchain;
