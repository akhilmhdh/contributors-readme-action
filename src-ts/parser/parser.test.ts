import { parser } from './parser';
import { fileContent, fileContentParsed, fileContentWithTemplate } from './parser.mock';

describe('Parser Test', () => {
    it('Standard parsed file content', () => {
        const data = parser(fileContent);
        expect(data.content.length).toBe(fileContentParsed.content.length);
        expect(data).toStrictEqual(fileContentParsed);
    });

    it('Should ignore old action template lines', () => {
        const data = parser(fileContentWithTemplate);
        expect(data.content.length).toBe(fileContentParsed.content.length);
        expect(data).toStrictEqual(fileContentParsed);
    });
});
