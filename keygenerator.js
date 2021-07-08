"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elliptic_1 = require("elliptic");
var ec = new elliptic_1.ec('secp256k1');
var key = ec.genKeyPair();
var publicKey = key.getPublic('hex');
var privateKey = key.getPrivate('hex');
console.log(publicKey);
console.log(privateKey);
