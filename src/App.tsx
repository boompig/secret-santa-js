import React, {useState} from 'react';
import logo from './logo.svg';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

interface IFormProps {
    ciphertext: string;
    decryptionKey: string;
}

async function decryptText(ciphertext: string, key: string): Promise<string> {
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

/**
 * Decrypt
 * https://kats.coffee/secret-santa/2022?name=gsErz8jb8l0grTI8q1H2pVqf2GBrRaX2MDLOkpSDEELWXJDOu7x6pcmLrnxWIcOG&key=t%2BuRVjG4jgRv5lwKJ39l9A%3D%3D
 */
function DecryptionForm(props: IFormProps) {
    const [ciphertext, setCiphertext] = useState(props.ciphertext);
    const [decryptionKey, setDecryptionKey] = useState(props.decryptionKey);
    const [output, setOutput] = useState('');

    const handleChange = (e: React.SyntheticEvent) => {
        const val = (e.target as any).value;
        if ((e.target as any).name === 'ciphertext') {
            setCiphertext(val);
        } else {
            setDecryptionKey(val);
        }
    };
    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const out = await decryptText(ciphertext, decryptionKey);
        setOutput(out);
        return false;
    }

    return (<div className='container'>
        <h1>Secret Santa Decryption Form</h1>
        <form id="secret-santa-decryption-form" onSubmit={handleSubmit}>
            <div>
                <label htmlFor='ciphertext'>Encrypted Name</label>
                <input type='text' name='ciphertext' required={true} className='form-control'
                        placeholder="encrypted name"
                        value={ciphertext}
                        onChange={handleChange} />
            </div>

            <div>
                <label htmlFor='key'>Decryption Key</label>
                <input type='text' name='key' required={true} className='form-control'
                        placeholder="decryption key"
                        value={decryptionKey}
                        onChange={handleChange} />
            </div>
            <div className="mt-2">
                <button type='submit' className="btn btn-primary form-control">Decrypt</button>
            </div>

            { output ?
                <div className="mt-2">Person's Name: { output }</div> :
                null }
        </form>
    </div>);
}

function App() {
    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');
    const key = url.searchParams.get('key');
    if (name && key) {
        return <DecryptionForm ciphertext={name} decryptionKey={key} />;
    }
    return (
        <div className="App">
            Under Construction
        </div>
    );
}

export default App;
