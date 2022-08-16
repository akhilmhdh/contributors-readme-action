import readme from '../testDummyData/readme';
import readmejsx from '../testDummyData/readme-jsx-compatible';
import templateParser from './templateParser';

describe('templateParser Function', () => {
    const parsedData = templateParser(readme);

    test('should parse the readme with two objects inside array', () => {
        expect(Object.keys(parsedData).length).toBe(2);
    });

    test('should have object with key url and name', () => {
        expect(Object.prototype.hasOwnProperty.call(parsedData, 'octocat'));
        expect(Object.prototype.hasOwnProperty.call(parsedData.octocat, 'url'));
        expect(Object.prototype.hasOwnProperty.call(parsedData.octocat, 'name'));
    });
});

describe('templateParser Function MDX style comment parse', () => {
    const parsedData = templateParser(readmejsx);

    test('should parse the readme with two objects inside array', () => {
        expect(Object.keys(parsedData).length).toBe(2);
    });

    test('should have object with key url and name', () => {
        expect(Object.prototype.hasOwnProperty.call(parsedData, 'octocat'));
        expect(Object.prototype.hasOwnProperty.call(parsedData.octocat, 'url'));
        expect(Object.prototype.hasOwnProperty.call(parsedData.octocat, 'name'));
    });
});
