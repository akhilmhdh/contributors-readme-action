import stripDuplicates from './stripDuplicates';

test('Remove duplicate objects based on a key from an array', () => {
    const toBeStrippedArray = [{ name: 'hello' }, { name: 'hello' }, { name: 'world' }];
    const stripDuplicatedArray = stripDuplicates(toBeStrippedArray, 'name');
    expect(stripDuplicatedArray.length).toBe(2);
});

test('stripDuplicate function with empty array', () => {
    const emptyArray = [];
    const strippedEmptyArray = stripDuplicates(emptyArray, 'name');
    expect(strippedEmptyArray.length).toBe(0);
});

test('stripDuplicate function with null', () => {
    const strippedArray = stripDuplicates(null, 'name');
    expect(strippedArray.length).toBe(0);
});
