'use strict';

var crypto = require('crypto');
var streamCrypto = require('stream-crypto');
var util = require('util');

class Manager {
  constructor(clientKey, encryptedKey) {
    this.clientKey = clientKey;
    this.encryptedKey = encryptedKey;
  }

  async encryptText(text) {
    const key = await this.getEncryptionKey();
    return await streamCrypto.Encoder.encrypt(text, key);
  }

  async decryptText(text) {
    const key = await this.getEncryptionKey();
    return await streamCrypto.Decoder.decryptText(text, key);
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
    } = this.properties;
    if (!clientKey || !encryptedKey) return null;
    const clientKeyBuffer = Buffer.from(clientKey, "base64");
    const encryptedKeyBuffer = Buffer.from(encryptedKey, "base64");
    const encryptionKey = await streamCrypto.Decoder.decryptBuffer(encryptedKeyBuffer, clientKeyBuffer);
    return this.encryptionKey = encryptionKey;
  }

  async setKey(newKey) {
    if (typeof newKey === "undefined") {
      const buf = await util.promisify(crypto.randomBytes)(32);
      if (buf) newKey = buf;else throw "Could not create default key";
    } else if (typeof newKey == "string") newKey = Buffer.from(newKey, "base64");

    const encryptionKey = await this.getEncryptionKey();

    if (!encryptionKey) {
      const newEncryptionKey = await util.promisify(crypto.randomBytes)(32);
      const newEncryptedKey = await streamCrypto.Encoder.encrypt(newEncryptionKey, newKey);
      const newEncryptionKey64 = newEncryptedKey.toString("base64");
      const newKey64 = newKey.toString("base64");
      return {
        clientKey: newKey64,
        encryptedKey: newEncryptionKey64
      };
    } else {
      //Need to re-encrypt
      const newEncryptedKey = await streamCrypto.Decoder.encryptBuffer(encryptionKey, newKey);
      const newEncryptionKey64 = newEncryptedKey.toString("base64");
      const newKey64 = newKey.toString("base64");
      return {
        clientKey: newKey64,
        encryptedKey: newEncryptionKey64
      };
    }
  }

}

module.exports = Manager;
//# sourceMappingURL=index.cjs.js.map
