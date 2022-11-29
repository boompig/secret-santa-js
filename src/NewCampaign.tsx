import React, {useState, useEffect} from 'react';
import * as _ from 'underscore';
import { encryptText, IEncOut, base64ToBuf, bufToBase64 } from './utils';

const MAX_NUM_FAILURES = 3;


function checkArrangement(arrangement: {[key: string]: string}): boolean {
    for (let [giver, receiver] of Object.entries(arrangement)) {
        if (giver === receiver) {
            return false;
        }
    }
    return true;
}

function secretSantaHat(names: string[]): {[key: string]: string} {
    const arrangement = {} as {[key: string]: string};
    const receivers = _.shuffle(names);

    for (let i = 0; i < names.length; i++) {
        const giver = names[i];
        let j = 0;

        if (receivers.length > 1) {
            for (j = 0; j < receivers.length; j++) {
                let receiver = receivers[j];
                if (giver !== receiver) {
                    break;
                }
            }
        }

        let receiver = receivers[j];
        if (receiver === giver) {
            throw new Error('domain wipeout');
        }
        // remove the element from receivers
        receivers.splice(j, 1);
        arrangement[giver] = receiver;
    }

    return arrangement;
}

/**
 * Use a simple search technique based on the idea of drawing from a hat
 */
function createArrangement(names: string[]): {[key: string]: string} {
    let arrangement = {} as {[key: string]: string};
    let isOk = false;
    let numFailures = 0;

    while (!isOk && numFailures < MAX_NUM_FAILURES) {
        try {
            arrangement = secretSantaHat(names);
            isOk = checkArrangement(arrangement);
        } catch (err) {
            isOk = false;
        }
        if (!isOk) {
            numFailures++;
        }
    }

    if (numFailures >= MAX_NUM_FAILURES) {
        throw new Error('exceeded max # failures');
    }

    return arrangement;
}

export function NewCampaign() {
    const [name, setName] = useState('');
    const [names, setNames] = useState([] as string[]);
    const [isInit, setInit] = useState(false);
    const [hasArrangement, setHasArrangement] = useState(false);
    const [arrangement, setArrangement] = useState({} as {[key: string]: string});
    // const [email, setEmail] = useState('');
    // const [includeEmail, setIncludeEmail] = useState(false);
    const [hasEncArrangement, setHasEncArrangement] = useState(false);
    const [encArrangement, setEncArrangement] = useState({} as {[key: string]: IEncOut});

    const handleNameChange = (e: React.SyntheticEvent) => {
        const val = (e.target as any).value;
        setName(val);
    };

    // const handleEmailChange = (e: React.SyntheticEvent) => {
    //     const val = (e.target as any).value;
    //     setEmail(val);
    // };

    const handleAddName = (e: React.SyntheticEvent) => {
        e.preventDefault();
        const newNames = [...names, name];
        setNames(newNames);
        setName('');
        // once the names are changed, save them in localStorage
        window.localStorage.setItem('names', JSON.stringify(newNames));
        console.log('saved names');

        return false;
    };

    const handleDeleteName = (i: number) => {
        const newNames = [...names];
        newNames.splice(i, 1);
        setNames(newNames);
        window.localStorage.setItem('names', JSON.stringify(newNames));
        console.log('saved names');
    };

    const handleCreateArrangement = () => {
        setHasArrangement(true);
        const myArrangement = createArrangement(names);
        setArrangement(myArrangement);
        console.log('arrangement created');
    };

    const handleCreateEncArrangement = async () => {
        const myArrangement = createArrangement(names);
        const givers = Object.keys(myArrangement);
        const myEncArrangement = {} as {[key: string]: IEncOut};
        for (let i = 0; i < givers.length; i++) {
            let giver = givers[i];
            // console.log(giver);
            let receiver = myArrangement[giver];
            // console.log(receiver);
            const out = await encryptText(receiver)
            // console.log(out);
            myEncArrangement[giver] = out;
        }
        console.log('created a new encrypted arrangement');
        setEncArrangement(myEncArrangement);
        setHasEncArrangement(true);
    };

    // const handleChangeSettings = (e: React.SyntheticEvent) => {
    //     const name = (e.target as any).name;
    //     if (name === 'include_email') {
    //         const val = (e.target as any).checked;
    //         console.log(val);
    //         setIncludeEmail(val);
    //     }
    // };

    /**
     * Check for saved names in localStorage
     */
    useEffect(() => {
        if (names.length === 0 && !isInit) {
            console.log('init called');
            const savedNamesItem = window.localStorage.getItem('names');
            if (savedNamesItem) {
                const savedNames = JSON.parse(savedNamesItem) as string[];
                setNames(savedNames);
            } else {
                console.log('no saved names');
            }
        }
        setInit(true);
    }, [names, isInit]);

    const namesElems = names.map((name: string, i: number) => {
        return <div className="name flex" key={i}>
            <span>{ name }</span>
            <button type='button' className='btn btn-danger delete-btn btn-sm'
                onClick={() => handleDeleteName(i)}>&#215;</button>
        </div>
    });
    const arrElems = Object.entries(arrangement).map(([giver, receiver]) => {
        return <div>{ giver } &#8594; { receiver }</div>
    });

    const encArrElems = Object.entries(encArrangement).map(([giver, encReceiver]) => {
        const url = new URL(window.location.href);

        // concatenate CT and IV
        const ivBuf = base64ToBuf(encReceiver.iv);
        const ctBuf = base64ToBuf(encReceiver.ciphertext);
        const fullBuf = new Uint8Array(ivBuf.length + ctBuf.length);
        fullBuf.set(ivBuf);
        fullBuf.set(ctBuf, ivBuf.length);
        const fullBuf64 = bufToBase64(fullBuf);

        url.searchParams.set('name', fullBuf64);
        url.searchParams.set('key', encReceiver.key);

        return (<div key={giver}>
            <span>{ giver } &#8594;&nbsp;</span>
            <a href={url.toString()}>link</a>
        </div>);
    });

    return (<div className='container'>
        <h1>Create a New Secret Santa Campaign</h1>

        <section>
            <form onSubmit={handleAddName}>
                <div>
                    <label htmlFor='name'>Name</label>
                    <input type="text" name="name" className="form-control"
                        placeholder='name'
                        value={name}
                        onChange={handleNameChange} />
                </div>
                {/* { includeEmail ?
                    <div className="mt-2">
                        <label htmlFor="email">Email</label>
                        <input type="email" name='email' className='form-control'
                            placeholder='email'
                            value={email}
                            onChange={handleEmailChange} />
                    </div> : null
                } */}
                <div className="mt-2">
                    <button type="submit" className="form-control btn btn-success">Add</button>
                </div>
            </form>
        </section>

        <section className='mt-4' id="names-section">
            <h2>Names</h2>

            { names.length ?
                namesElems :
                <p>no names yet</p> }

            <div className='mt-2 flex btn-container'>
                <button type='button' className='btn btn-success'
                    onClick={handleCreateArrangement}>Create Random Drawing</button>
                <button type='button' className='btn btn-success'
                    onClick={handleCreateEncArrangement}>Create Random Encrypted Drawing</button>
            </div>
        </section>

        { hasArrangement ?
            <section className='mt-4'>
                <h2>Secret Santa Assignment</h2>
                { arrElems }
            </section> :
            null }

        { hasEncArrangement ?
            <section className='mt-4'>
                <h2>Secret Santa Encrypted Assignment</h2>
                { encArrElems }
            </section> :
            null }

        {/* <section id="settings-section" className="mt-4">
            <h2>Settings</h2>

            <form>
                <div className="form-check">
                    <input type="checkbox" name="include_email" className="form-check-input"
                        onChange={handleChangeSettings} />
                    <label htmlFor='include_email' className="form-check-label">Include e-mail</label>
                </div>
            </form>
        </section> */}
    </div>);
}

export default NewCampaign;