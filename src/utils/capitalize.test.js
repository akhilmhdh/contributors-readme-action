import capitalize from './capitalize';

test('Should capitalize words', () => {
    expect(capitalize('hello world')).toBe('Hello World');
});

test("Should return '' on null or undefined", () => {
    expect(capitalize(null)).toBe('');
});
