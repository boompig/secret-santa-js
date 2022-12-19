import * as React from 'react';
import './landing-page.css';

interface ILandingPageProps {
    selectOption(name: string): void;
}

export const LandingPage = (props: ILandingPageProps) => {
    return <div className='landing-page container'>
        <h1>Secret Santa</h1>
        <p>Easily create a secret santa drawing for your group or friends or company.
            No registration necessary.</p>

        <div className='row col-3-section'>
            <div className="col">
                <p>Create a new Secret Santa drawing where you can see who is assigned to whom.</p>
                <div className="btn-container">
                    <button className='btn btn-lg btn-outline-primary'
                        onClick={() => props.selectOption('new-drawing')}>New Drawing</button>
                </div>
            </div>
            <div className="col">
                <p>Create a new group where only the giver knows their assignment. The organizer has to register everyone here.</p>
                <div className="btn-container">
                    <button className='btn btn-lg btn-outline-primary'
                        onClick={() => props.selectOption('new-secret-drawing')}>New Secret Drawing</button>
                </div>
            </div>
            <div className="col">
                <p>Create a new group. This allows people to opt-in to register. This takes the burden off the organizer.</p>
                <div className="btn-container">
                    <button className='btn btn-lg btn-outline-primary'
                        onClick={() => props.selectOption('new-group')}>New Group</button>
                </div>
            </div>
        </div>
    </div>;
};

export default LandingPage;