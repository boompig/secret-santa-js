import { checkArrangement, secretSantaSearch } from './utils';

test('test create arrangement', () => {
    const givers = ['Alice', 'Bob'];
    const receivers = [...givers];
    const arrangement = secretSantaSearch(givers, receivers);
    expect(checkArrangement(givers, arrangement)).toBe(true);
});