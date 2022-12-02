/**
 * Cryptographic utility functions
 */

export async function decryptText(ciphertext: string, key: string): Promise<string> {
    if (key === "") {
        throw new Error("invalid key");
    }
    const binaryKey = Uint8Array.from(atob(key), c => c.charCodeAt(0));

    // for 128-bit key
    const keySizeBytes = 16;
    if (binaryKey.length !== keySizeBytes) {
        throw new Error("key is not of the correct length (read " + binaryKey.length + " bytes)");
    }
    // read iv and ciphertext from base64 encoded ciphertext
    const fullBinaryCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = fullBinaryCiphertext.slice(0, 16);
    const ct = fullBinaryCiphertext.slice(16);
    const myKey = await crypto.subtle.importKey('raw', binaryKey, 'AES-CBC', false, ['decrypt']);
    const msgBuf = await crypto.subtle.decrypt({
        name: 'AES-CBC',
        iv: iv
    }, myKey, ct);
    const out = new TextDecoder().decode(msgBuf);
    return out;
}


export function base64ToBuf(msg: string): Uint8Array {
    return Uint8Array.from(atob(msg), c => c.charCodeAt(0));
}

function stringToBuf(msg: string): Uint8Array {
    const out = new TextEncoder().encode(msg);
    return out;
}

export function bufToBase64(bytes: Uint8Array): string {
    var binary = '';
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

export interface IEncOut {
    key: string;
    ciphertext: string;
    iv: string;
}

export async function encryptText(plaintext: string): Promise<IEncOut> {
    if(!plaintext) {
        throw new Error('plaintext not specified');
    }
    const ptBuf = stringToBuf(plaintext);

    const key = (await crypto.subtle.generateKey({
        name: 'AES-CBC',
        length: 128,
     }, true, ['encrypt'])) as CryptoKey;
    const iv = (await crypto.getRandomValues(new Uint8Array(16)))
    const ctBuf = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: iv,
        },
        key,
        ptBuf,
    );

    const out = arrayBufferToBase64(ctBuf);
    const keyRaw = await crypto.subtle.exportKey('raw', key);
    const keyS = arrayBufferToBase64(keyRaw);
    const ivS = bufToBase64(iv);
    return {
        ciphertext: out,
        key: keyS,
        iv: ivS,
    };
}