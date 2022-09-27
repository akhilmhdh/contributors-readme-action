import { stripDuplicates } from './stripDuplicates';

describe('stripDuplicate Function', () => {
    it('Remove duplicate objects based on a key from an array', () => {
        const toBeStrippedArray = [{ name: 'hello' }, { name: 'hello' }, { name: 'world' }];
        const stripDuplicatedArray = stripDuplicates(toBeStrippedArray, 'name');
        expect(stripDuplicatedArray.length).toBe(2);
    });

    it('stripDuplicate function with empty array', () => {
        const emptyArray: Array<{ name: string }> = [];
        const strippedEmptyArray = stripDuplicates(emptyArray, 'name');
        expect(strippedEmptyArray.length).toBe(0);
    });
});
