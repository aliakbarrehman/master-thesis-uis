//Checking the crypto module
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

//Encrypting text
function encrypt(text: string, key: string, iv:string) {
   let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return encrypted.toString('hex');
}

// Decrypting text
function decrypt(text: string, key: string, iv:string) {
   let encryptedText = Buffer.from(text, 'hex');
   let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}

export { encrypt, decrypt };