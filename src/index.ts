import {
  encrypt,
  decryptToString,
  decryptToBuffer,
  encryptFile,
  decryptFile,
  makeRandomKeyBuffer,
  encryptToString,
  makeRandomKeyString,
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
    if (!this.clientKey || !this.encryptedKey) throw new Error("No key stored");
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
    return await encryptToString(text, key);
  }
  async decryptText(data: string) {
    const key = await this.getEncryptionKey();
    return await decryptToString(data, key);
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
      this.encryptionKey = await decryptToString(encryptedKey, clientKey);
    }
    return this.encryptionKey;
  }
  async setKey(BufferOrBase64: string | Buffer): Promise<void> {
    const newKey =
      typeof BufferOrBase64 === "string"
        ? Buffer.from(BufferOrBase64, "base64")
        : BufferOrBase64;
    const encryptionKey = await this.getEncryptionKey();
    if (!encryptionKey) throw "there is no stored key";
    const newEncryptedKey = await encryptToString(encryptionKey, newKey);
    this.clientKey = newKey.toString("base64");
    this.encryptedKey = newEncryptedKey;
  }
  static async create(length: number = 32): Promise<Manager> {
    const toEncrypt = await makeRandomKeyBuffer(length);
    const clientKey = await makeRandomKeyString(length);
    const encryptedKey = await encryptToString(toEncrypt, clientKey);
    return new Manager(clientKey, encryptedKey);
  }
}

export default Manager;
