import { capitalizeWords } from './capitalizeWords';

describe('Capitalize Words', () => {
    it('Should capitalize words', () => {
        expect(capitalizeWords('hello world')).toBe('Hello World');
    });
});
