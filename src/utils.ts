/**
 * Secret santa utility functions
 */

import _ from 'underscore';


const MAX_NUM_FAILURES = 3;


/**
 * Verify the given arrangement makes sense
 */
export function checkArrangement(names: string[], arrangement: {[key: string]: string}): boolean {
    // arrangement must have the same number of givers as `names` (no extra keys)
    if (Object.keys(arrangement).length !== names.length) {
        console.error('assignment is not the same length as names');
        return false;
    }

    // every name must correspond to a receiver
    const remainingReceivers = new Set(names);
    if (remainingReceivers.size !== names.length) {
        // names may not contain duplicates
        console.error('names may not contain duplicates');
        return false;
    }

    // all names must be givers
    for (let giver of names) {
        if (giver in arrangement) {
            let r = arrangement[giver];
            if (!remainingReceivers.delete(r)) {
                // must exist
                console.error('receiver must exist in arrangement');
                return false;
            }
        } else {
            // must exist
            console.error('giver must exist in arrangement');
            return false;
        }
    }

    if (remainingReceivers.size !== 0) {
        return false;
    }

    // no giver may give to themselves
    for (let [giver, receiver] of Object.entries(arrangement)) {
        if (giver === receiver) {
            console.error('may not assign a person to themselves');
            return false;
        }
    }

    return true;
}

/**
 * This function works according to the same principle as a manual implementation of secret santa
 * Namely there is a hat of receiver names which is shuffled.
 * The givers are iterated through and each person draws a name from the hat, (drawing until they no longer have themselves)
 * If the last person draws themselves then it's a bust and you have to do the whole thing over again (this function does not handle failures only throws an error)
 */
export function secretSantaHat(names: string[]): {[key: string]: string} {
    const arrangement = {} as {[key: string]: string};
    const receivers = _.shuffle(names);

    for (let i = 0; i < names.length; i++) {
        const giver = names[i];
        // pick a name from the hat
        let j = 0;
        let receiver = receivers[j];

        if (receivers.length > 1) {
            // pick a different name from the hat
            while (giver === receiver) {
                j++;
                receiver = receivers[j];
            }
        }

        if (receiver === giver) {
            throw new Error('domain wipeout');
        }
        // remove the name from the hat
        receivers.splice(j, 1);
        arrangement[giver] = receiver;
    }

    return arrangement;
}


export function randomSecretSantaSearch(names: string[]): {[key: string]: string} {
    const arrangement = {};
    const receivers = _.shuffle(names);
    const outArrangement = secretSantaSearch(names, receivers, arrangement);
    if (!checkArrangement(names, outArrangement)) {
        console.error(names);
        console.error(outArrangement);
        throw new Error(`failed arrangement check`);
    }
    return outArrangement;
}


/**
 * Deterministic search. Finds arrangement if it exists.
 * However there is no randomness - entirely reliant on randomization of inputs.
 * To make the arrangement random, randomize `receivers`
 * Note that there is no need to randomize `givers` (I don't think)
 */
export function secretSantaSearch(givers: string[], receivers: string[], arrangement?: {[key: string]: string}): {[key: string]: string} {
    if (!arrangement) {
        // arrangement may be missing during initial recursion call
        arrangement = {} as {[key: string]: string};
    }
    if (givers.length === 0) {
        // base case - we have recursed through all givers
        // the input arrangement works
        return arrangement;
    }
    console.assert(givers.length === receivers.length, `givers and receivers must be the same length, got ${givers.length} and ${receivers.length}`);

    const newGivers = [...givers];
    const giver = newGivers.pop();
    if (!giver) {
        throw new Error('giver array is empty');
    }

    // make an arrangement
    for (let i = 0; i < receivers.length; i++) {
        let receiver = receivers[i];
        if (giver === receiver) {
            continue;
        }
        try {
            const newReceivers = [...receivers];
            newReceivers.splice(i, 1);
            arrangement[giver] = receiver;
            const outArr = secretSantaSearch(newGivers, newReceivers, arrangement);
            return outArr;
        } catch (err) {
            // giver -> receiver doesn't work
            // continue looking for a receiver
        }
    }
    throw new Error(`domain wipeout - no receiver found for giver ${giver}`);
}

/**
 * Use a simple search technique based on the idea of drawing from a hat
 */
export function createArrangement(names: string[]): {[key: string]: string} {
    let arrangement = {} as {[key: string]: string};
    let isOk = false;
    let numFailures = 0;

    while (!isOk && numFailures < MAX_NUM_FAILURES) {
        try {
            arrangement = secretSantaHat(names);
            isOk = checkArrangement(names, arrangement);
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
