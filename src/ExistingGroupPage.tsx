import React, { useEffect, useState } from 'react';
import {GroupPage} from './GroupPage';
import './existing-group-page.css';

export function GroupSearchForm() {
    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        throw new Error('not implemented');
    };

    return <form onSubmit={handleSubmit}>
        <p>Enter the name of your group to find it</p>
        <div className="mb-2">
            <label htmlFor="group_name">group name</label>
            <input type="text" name="group_name" className='form-control' placeholder='your group name'/>
        </div>
        <div className="mb-2">
            <button type="submit" className='btn btn-primary form-control'>Search</button>
        </div>
    </form>
}

interface ISearchResultsProps {
    // read-only
    searchResults: string[];
    selectGroup(groupName: string): void;
}

export function SearchResults(props: ISearchResultsProps) {
    const handleClick = (e: React.SyntheticEvent, groupName: string) => {
        e.preventDefault();
        props.selectGroup(groupName);
    };

    return <div>
        <h2>Your Groups</h2>
        <ul>

            { props.searchResults.map((groupName) => {
                return <li key={groupName}>
                    <a href='#' onClick={(e) => handleClick(e, groupName)}>{ groupName }</a>
                </li>
            })}
        </ul>
    </div>
}

export function ExistingGroupPage() {
    const [searchResults, setSearchResults] = useState([] as string[]);
    const [isLocalGroupsLoaded, setLocalGroupsLoaded] = useState(false);
    const [selectedGroupName, selectGroupName] = useState(null as string | null);

    useEffect(() => {
        if (!isLocalGroupsLoaded) {
            console.debug('Loading groups saved in local storage...');
            const item = window.localStorage.getItem('groupPeople');
            if (item) {
                console.log(item);
                const savedGroups = [] as string[];
                const j = JSON.parse(item);
                for(const groupName of Object.keys(j)) {
                    savedGroups.push(groupName);
                }
                console.debug(`Loaded ${savedGroups.length} groups from local storage`);
                setSearchResults([...searchResults, ...savedGroups]);
            }
        }
        setLocalGroupsLoaded(true);
    }, [isLocalGroupsLoaded]);

    const handleSelectGroup = (groupName: string) => {
        selectGroupName(groupName);
    };

    return <div className='existing-group-page container'>
        { selectedGroupName ?
            <GroupPage /> :
            <>
            <h2>Existing Group</h2>

            <section>
                <GroupSearchForm />
            </section>

            <section className='search-results'>
                <SearchResults searchResults={searchResults} selectGroup={handleSelectGroup}/>
            </section>
        </> }
    </div>;
}

export default ExistingGroupPage;