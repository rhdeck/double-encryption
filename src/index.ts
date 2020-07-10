import {
  encrypt,
  decryptToText,
  decryptToBuffer,
  encryptFile,
  decryptFile,
  makeRandomKeyBuffer,
} from "@raydeck/stream-crypto";
class Manager {
  protected encryptionKey?: string;
  protected clientKey?: string;
  protected encryptedKey?: string;
  constructor(clientKey: string, encryptedKey: string) {
    this.clientKey = clientKey;
    this.encryptedKey = encryptedKey;
  }
  toObj(): { clientKey: string; encryptedKey: string } {
    return {
      clientKey: this.clientKey,
      encryptedKey: this.encryptedKey,
    };
  }
  toString() {
    return JSON.stringify(this.toObj());
  }
  async encryptText(text: string) {
    const key = await this.getEncryptionKey();
    return await encrypt(text, key);
  }
  async decryptText(data: any) {
    const key = await this.getEncryptionKey();
    return await decryptToText(data, key);
  }
  async encryptImage(b: Buffer) {
    const key = await this.getEncryptionKey();
    return await encrypt(b, key);
  }
  async decryptImage(b: Buffer) {
    const key = await this.getEncryptionKey();
    return await decryptToBuffer(b, key);
  }
  async encryptFile(source: string, dest: string) {
    const key = await this.getEncryptionKey();
    return await encryptFile(source, dest, key);
  }
  async decryptFile(source: string, dest: string) {
    const key = await this.getEncryptionKey();
    return await decryptFile(source, dest, key);
  }
  async getEncryptionKey() {
    if (!this.encryptionKey) {
      const { clientKey, encryptedKey } = this.toObj();
      if (!clientKey || !encryptedKey) throw "No key stored";
      const clientKeyBuffer = Buffer.from(clientKey, "base64");
      const encryptedKeyBuffer = Buffer.from(encryptedKey, "base64");
      const encryptionKey = await decryptToBuffer(
        encryptedKeyBuffer,
        clientKeyBuffer
      );
      this.encryptionKey = encryptionKey.toString("base64");
    }
    return this.encryptionKey;
  }
  async setKey(newKey: string | Buffer): Promise<void> {
    if (!newKey) throw "requires a an argument";
    if (typeof newKey === "string") newKey = Buffer.from(newKey);
    const encryptionKey = await this.getEncryptionKey();
    if (!encryptionKey) throw "there is no stored key";
    //Need to re-encrypt
    const newEncryptedKey = await encrypt(encryptionKey, newKey);
    const newEncryptedKey64 = newEncryptedKey.toString("base64");
    const newKey64 = newKey.toString("base64");
    this.clientKey = newKey64;
    this.encryptedKey = newEncryptedKey64;
  }
  static async create(length: number = 32): Promise<Manager> {
    const toEncrypt: Buffer = await makeRandomKeyBuffer(length);
    const clientKey: Buffer = await makeRandomKeyBuffer(length);
    const encryptedKey: Buffer = await encrypt(toEncrypt, clientKey);
    return new Manager(
      clientKey.toString("base64"),
      encryptedKey.toString("base64")
    );
  }
}

export default Manager;
