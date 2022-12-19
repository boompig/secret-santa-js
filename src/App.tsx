import React, {useState} from 'react';
import { NewCampaign } from './NewPublicDrawing';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LandingPage from './LandingPage';
import { GroupPage } from './GroupPage';
import ExistingGroupPage from './ExistingGroupPage';

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

interface INavbarProps {
    activeViewKey: string;
    setView(key: string): void;
}

interface INavItem {
    key: string;
    friendlyName: string;
}

export const Navbar = (props: INavbarProps) => {
    const handleClickNav = (e: React.SyntheticEvent, navItem: INavItem) => {
        e.preventDefault();
        console.log('setting view to key ' + navItem.key);
        window.location.hash = navItem.key;
        props.setView(navItem.key);
    };

    /**
     * Map from human-friendly
     */
    const navItemNames = [
        {
            // the way that this view is referred throughout the application
            // this will also be the hash in the URL
            key: 'home',
            // this is the way this item is displayed in the navbar
            friendlyName: 'Home',
        },
        {
            key: 'new-drawing',
            friendlyName: 'New Drawing'
        },
        {
            key: 'new-group',
            friendlyName: 'New Group'
        },
        {
            key: 'existing-group',
            friendlyName: 'Existing Group',
        }
    ] as INavItem[];

    const navItems = navItemNames.map((item: INavItem) => {
        let cls ='nav-link';
        if (item.key === props.activeViewKey) {
            cls += ' active';
        }
        return <li className='nav-item' key={item.key}>
            <a href='#' className={cls} onClick={(e) => handleClickNav(e, item)}>{ item.friendlyName }</a>
        </li>;
    });

    return (<nav className='navbar navbar-expand-lg navbar-light bg-light'>
        <div className="container-fluid">
            <a href="#" className="navbar-brand">Secret Santa</a>
            <button className="navbar-toggler" type='button' data-bs-toggle='collapse' data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav">
                    {navItems}
                </ul>
            </div>
        </div>
    </nav>);
};

/**
 * This wraps the rest of the app
 */
export const App = () => {
    // figure out what the current hash is
    const defaultView = (window.location.hash && window.location.hash.length > 1) ?
        window.location.hash.substring(1) : 'home'
    console.debug(`default view set to ${defaultView}`);
    const [activeViewKey, setView] = useState(defaultView);

    // const url = new URL(window.location.href);
    // const name = url.searchParams.get('name');
    // const key = url.searchParams.get('key');
    // if (name && key) {
    //     return <DecryptionForm ciphertext={name} decryptionKey={key} />;
    // }
    // return <NewCampaign />;

    const handleSelectLandingOption = (optionName: string) => {
        // TODO user choice is irrelevant
        if (optionName === 'new-drawing') {
            window.location.hash = '#new-drawing';
            setView('new-drawing');
        } else if (optionName === 'new-secret-drawing') {
            window.location.hash = '#new-secret-drawing';
            setView('new-group');
        } else if (optionName === 'new-group') {
            window.location.hash = '#new-group';
            setView('new-group');
        } else {
            throw new Error('invalid option: ' + optionName);
        }
    };

    let viewElem;

    switch (activeViewKey) {
        case 'home':
            viewElem = <LandingPage selectOption={handleSelectLandingOption}/>;
            break;
        case 'new-drawing':
            viewElem = <NewCampaign />;
            break;
        case 'new-group':
            viewElem= <GroupPage />;
            break;
        case 'existing-group':
            viewElem = <ExistingGroupPage />;
            break;
        default:
            viewElem = (<div className="container">
                <div className='alert alert-danger'>not implemented</div>
            </div>);
            break;
    }

    return (<div id='wrapper'>
        <header>
            <Navbar
                activeViewKey={activeViewKey}
                setView={setView} />
        </header>
        <main>
            { viewElem }
        </main>
        <footer>Built by Daniel Kats</footer>
    </div>);
};

export default App;
