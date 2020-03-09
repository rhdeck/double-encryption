'use strict';

var crypto = require('crypto');
var streamCrypto = require('@raydeck/stream-crypto');
var util = require('util');

class Manager {
  constructor(clientKey, encryptedKey) {
    this.clientKey = clientKey;
    this.encryptedKey = encryptedKey;
  }

  toObj() {
    return {
      clientKey: this.clientKey,
      encryptedKey: this.encryptedKey
    };
  }

  toString() {
    return JSON.stringify(thid.toObj());
  }

  async encryptText(text) {
    const key = await this.getEncryptionKey();
    return await streamCrypto.Encoder.encrypt(text, key);
  }

  async decryptText(buffer) {
    const key = await this.getEncryptionKey();
    return await streamCrypto.Decoder.decryptText(buffer, key);
  }

  async encryptImage(b) {
    const key = await this.getEncryptionKey();
    return await streamCrypto.Encoder.encrypt(b, key);
  }

  async decryptImage(b) {
    const key = await this.getEncryptionKey();
    return await streamCrypto.Decoder.decryptBuffer(b, key);
  }

  async getEncryptionKey() {
    if (this.encryptionKey) return this.encryptionKey;
    const {
      clientKey,
      encryptedKey
    } = this.toObj();
    if (!clientKey || !encryptedKey) throw "No key stored";
    const clientKeyBuffer = Buffer.from(clientKey, "base64");
    const encryptedKeyBuffer = Buffer.from(encryptedKey, "base64");
    const encryptionKey = await streamCrypto.Decoder.decryptBuffer(encryptedKeyBuffer, clientKeyBuffer);
    return this.encryptionKey = encryptionKey;
  }

  async setKey(newKey) {
    if (!newKey) throw "requires a an argument";
    if (typeof newKey == "string") newKey = Buffer.from(newKey, "base64");
    const encryptionKey = await this.getEncryptionKey();
    if (!encryptionKey) throw "there is no stored key"; //Need to re-encrypt

    const newEncryptedKey = await streamCrypto.Decoder.encryptBuffer(encryptionKey, newKey);
    const newEncryptedKey64 = newEncryptedKey.toString("base64");
    const newKey64 = newKey.toString("base64");
    this.clientKey = newKey64;
    this.encryptedKey = newEncryptedKey64;
  }

}

Manager.create = async (length = 32) => {
  const toEncrypt = await makeRandomKeyBuffer(length);
  const clientKey = await makeRandomKeyBuffer(length);
  const encryptedKey = await streamCrypto.Encoder.encrypt(toEncrypt, clientKey);
  return new Manager(clientKey, encryptedKey);
};

Manager.makeRandomKey = makeRandomKey;
Manager.makeRandomKeyBuffer = makeRandomKeyBuffer;

async function makeRandomKeyBuffer(length = 32) {
  return util.promisify(crypto.randomBytes)(length);
}

async function makeRandomKey(length = 32) {
  const buf = await makeRandomKeyBuffer(length);
  return buf.toString("base64");
}

module.exports = Manager;
//# sourceMappingURL=index.cjs.js.map
