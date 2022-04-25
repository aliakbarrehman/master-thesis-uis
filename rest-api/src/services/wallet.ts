import { Wallet, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';

const buildWallet = async (path: string): Promise<Wallet> => {
    let wallet: Wallet;
    if (!path) {
        console.log('Cannot instantiate wallet with empty path');
        return null;
    }
    wallet = await Wallets.newFileSystemWallet(path);
    console.log('Built a file system wallet');
    return wallet;
};

const putIdentity = async(wallet: Wallet, identityName: string, msp: string, certPath: string, keyPath: string): Promise<Boolean> => {
    const cert = fs.readFileSync(certPath).toString();
    const key = fs.readFileSync(keyPath).toString();

    const identity = {
        credentials: {
            certificate: cert,
            privateKey: key,
        },
        mspId: msp,
        type: 'X.509',
    };
    await wallet.put(identityName, identity);
    return true;
}

export {
    buildWallet,
    putIdentity
}