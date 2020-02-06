import { randomBytes } from "crypto";
import { Encoder, Decoder } from "stream-crypto";
import { promisify } from "util";
class Manager {
  constructor(clientKey, encryptedKey) {
    this.clientKey = clientKey;
    this.encryptedKey = encryptedKey;
  }
  async encryptText(text) {
    const key = await this.getEncryptionKey();
    return await Encoder.encrypt(text, key);
  }
  async decryptText(text) {
    const key = await this.getEncryptionKey();
    return await Decoder.decryptText(text, key);
  }
  async encryptImage(b) {
    const key = await this.getEncryptionKey();
    return await Encoder.encrypt(b, key);
  }
  async decryptImage(b) {
    const key = await this.getEncryptionKey();
    return await Decoder.decryptBuffer(b, key);
  }
  async getEncryptionKey() {
    if (this.encryptionKey) return this.encryptionKey;
    const { clientKey, encryptedKey } = this.properties;
    if (!clientKey || !encryptedKey) return null;
    const clientKeyBuffer = Buffer.from(clientKey, "base64");
    const encryptedKeyBuffer = Buffer.from(encryptedKey, "base64");
    const encryptionKey = await Decoder.decryptBuffer(
      encryptedKeyBuffer,
      clientKeyBuffer
    );
    return (this.encryptionKey = encryptionKey);
  }
  async setKey(newKey) {
    if (typeof newKey === "undefined") {
      const buf = await promisify(randomBytes)(32);
      if (buf) newKey = buf;
      else throw "Could not create default key";
    } else if (typeof newKey == "string")
      newKey = Buffer.from(newKey, "base64");
    const encryptionKey = await this.getEncryptionKey();
    if (!encryptionKey) {
      const newEncryptionKey = await promisify(randomBytes)(32);
      const newEncryptedKey = await Encoder.encrypt(newEncryptionKey, newKey);
      const newEncryptionKey64 = newEncryptedKey.toString("base64");
      const newKey64 = newKey.toString("base64");
      return {
        clientKey: newKey64,
        encryptedKey: newEncryptionKey64
      };
    } else {
      //Need to re-encrypt
      const newEncryptedKey = await Decoder.encryptBuffer(
        encryptionKey,
        newKey
      );
      const newEncryptionKey64 = newEncryptedKey.toString("base64");
      const newKey64 = newKey.toString("base64");
      return {
        clientKey: newKey64,
        encryptedKey: newEncryptionKey64
      };
    }
  }
}
export default Manager;
