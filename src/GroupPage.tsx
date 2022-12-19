import React, { useState, useEffect } from 'react';

import './group-page.css';

const ADJECTIVES = [
    'erotic',
    'sensual',
    'lascivious',
    'arousing'
];

const NOUNS = [
    'bear',
    'sheep',
    'beard',
    'cougar',
];

function generateNewGroupName(): string {
    const i = Math.floor(Math.random() * ADJECTIVES.length);
    const j = Math.floor(Math.random() * NOUNS.length);
    return `${ADJECTIVES[i]} ${NOUNS[j]}`;
}

function getGroupName(): string | null {
    const u = new URL(window.location.href);
    return u.searchParams.get('groupName');
}

interface IPerson {
    name: string;
    email: string;
}

interface IAddPersonFormProps {
    /**
     * This is meant to be read-only
     */
    people: IPerson[];
    onAdd(person: IPerson): void;
}

export function AddPersonForm(props: IAddPersonFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState(null as string | null);

    // event handlers
    const handleChangeFormInput = (e: React.SyntheticEvent) => {
        const elem = e.target as HTMLInputElement;
        if (elem.name === 'name') {
            setName(elem.value);
        } else if (elem.name === 'email') {
            setEmail(elem.value);
        }
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        const newPerson = {
            name: name,
            email: email,
        } as IPerson;

        // can we add this person?
        let canAdd = true;
        let errMsg = '';
        for (const person of props.people) {
            if (person.email === newPerson.email) {
                canAdd = false;
                errMsg = `Person with email ${person.email} has already been added`;
                break;
            }
        }

        if (canAdd) {
            // blank out the fields
            setName('');
            setEmail('');
            // then go to dispatcher
            props.onAdd(newPerson);
        } else {
            setErrorMsg(errMsg);
        }

        return false;
    };

    return <form className='add-person-form' onSubmit={handleSubmit}>
        <p className='mb-2'>Add people to the secret santa group</p>

        {errorMsg ?
            <div className='alert alert-danger mb-2'>
                {errorMsg}
            </div> : null}
        <div className='mb-2'>
            <label htmlFor="name">name</label>
            <input type="text" name="name" placeholder='name' className='form-control'
                required={true} autoComplete='off'
                onChange={handleChangeFormInput}
                value={name}/>
        </div>
        <div className='mb-2'>
            <label htmlFor="email">email</label>
            <input type="email" name="email" placeholder='email' className='form-control'
                required={true} autoComplete='off'
                onChange={handleChangeFormInput}
                value={email}/>
        </div>
        <div className="mb-2">
            <button className='btn btn-primary form-control' type='submit'>Add Person</button>
        </div>
    </form>
}

interface IPeopleTableProps {
    people: IPerson[];
}

export function PeopleTable(props: IPeopleTableProps) {
    const peopleRows = props.people.map((person: IPerson) => {
        return <tr key={person.email}>
            <td>{ person.name }</td>
            <td>{ person.email }</td>
            <td>remove</td>
        </tr>;
    });
    return <table className='table table-striped'>
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            { peopleRows }
        </tbody>
    </table>;
}

interface ICreateGroupFormProps {
    onCreate(name: string): void;
}

export function CreateGroupForm (props: ICreateGroupFormProps) {
    const [name, setName] = useState('');
    const handleChangeName = (e: React.SyntheticEvent) => {
        setName((e.target as HTMLInputElement).value);
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        props.onCreate(name);
    };
    return <section>
        <h2>Create a Group Name</h2>
        <p>This will uniquely identify your group so you can find it later. You will also be able to share this group with your friends.</p>
        <form onSubmit={handleSubmit}>
            <div className="mb-2">
                <label htmlFor="group_name">Group Name</label>
                <input type="text" name="group_name" placeholder='your unique group name' required={true}
                    className='form-control' onChange={handleChangeName} />
            </div>
            <div className="mb-2">
                <button type='submit' className='btn btn-primary form-control'>Create</button>
            </div>
        </form>
    </section>;
}

export const GroupPage = () => {
    const [groupName, setGroupName] = useState(null as string | null);
    const [people, setPeople] = useState([] as IPerson[]);
    /**
     * True iff we have tried loading people from localStorage (regardless of whether we succeeded)
     */
    const [isPeopleLoaded, setPeopleLoaded] = useState(false);
    const [isGroupNameLoaded, setGroupNameLoaded] = useState(false);

    const handleCreateGroup = (groupName: string) => {
        // save it
        window.localStorage.setItem('groupName', groupName);
        // update state
        setGroupName(groupName);
    };

    const handleAddPerson = (newPerson: IPerson) => {
        if (!groupName) {
            throw new Error('group name must be set');
        }
        const newPeople = [...people, newPerson];

        // save the new array to localStorage
        const item = window.localStorage.getItem('groupPeople');
        let groupPeople = {} as any;
        if (item) {
            groupPeople = JSON.parse(item);
        }
        groupPeople[groupName] = newPeople;
        console.log(groupPeople);
        window.localStorage.setItem('groupPeople', JSON.stringify(groupPeople));
        // then update state
        setPeople(newPeople);
    };

    const createAndSend = () => {
        throw new Error('not implemented');
    };

    useEffect(() => {
        if(!isGroupNameLoaded) {
            console.debug('Loading group name from local storage...');
            const savedGroupName = window.localStorage.getItem('groupName');
            if (savedGroupName) {
                setGroupName(savedGroupName);
                console.debug(`Loaded group name from local storage: ${savedGroupName}`);
            }
            setGroupNameLoaded(true);
        }
    }, [isGroupNameLoaded]);

    useEffect(() => {
        if (!isPeopleLoaded && groupName) {
            console.debug(`Loading people from local storage for group ${groupName}...`);
            const item = window.localStorage.getItem('groupPeople');
            if (item) {
                const j = JSON.parse(item);
                // should be a map from groupName -> array of people
                const savedPeople = j[groupName] || [];
                if (savedPeople) {
                    console.debug(`Found saved people for group ${groupName}`);
                    console.log(savedPeople);
                    setPeople(savedPeople as IPerson[]);
                }
            }
            setPeopleLoaded(true);
        }
    }, [isPeopleLoaded, groupName]);

    return <div className="group-page container">
        { !groupName ?
            <section>
                <CreateGroupForm onCreate={handleCreateGroup} />
            </section> :
            <div>
                <h2>Group Name: {groupName}</h2>

                <section>
                    <AddPersonForm people={people} onAdd={handleAddPerson} />
                </section>

                {people.length > 0 ?
                    <section>
                        <PeopleTable people={people} />
                    </section> :
                    null}

                <button type="button" className='btn btn-primary btn-lg'
                    disabled={people.length === 0}
                    onClick={createAndSend}>Create Assignment & Send Emails</button>
            </div>}
    </div>;
};

export default GroupPage;
