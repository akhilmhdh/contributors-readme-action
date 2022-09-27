import { templateGenerator } from './template';
import {
    customMockUsers,
    mockTableTemplate,
    mockTableTemplateWithCustomUser,
    userMockList
} from './template.mock';

describe('Template Generator', () => {
    it('Testing template', () => {
        const keywords = ['contributors', 'collaborators'];
        const template = templateGenerator(keywords, userMockList, customMockUsers);
        expect(template.replace(/\s/g, '')).toBe(mockTableTemplate.replace(/\s/g, ''));
    });

    it('Testing template with custom user', () => {
        const keywords = ['contributors', 'collaborators', 'x'];
        const template = templateGenerator(keywords, userMockList, customMockUsers);
        expect(template.replace(/\s/g, '')).toBe(
            mockTableTemplateWithCustomUser.replace(/\s/g, '')
        );
    });
});
