/* eslint-disable no-plusplus */
import { stripDuplicates, capitalizeWords } from '../utils';

const buildTheUserList = (
    keywords: string[],
    userList: TAccounts,
    customUsers: Record<string, TEntity>
): TEntity[] => {
    let users: TEntity[] = [];

    // const [category_type, operator] = category.split('/'); // category is like akhilmhdh/-

    keywords.forEach(key => {
        switch (key) {
            case 'contributors':
                users = users.concat(userList.contributors);
                break;
            case 'collaborators':
                users = users.concat(userList.collaborators);
                break;
            case 'bots':
                users = users.concat(userList.bots);
                break;
            case 'sponsors':
                users = users.concat(userList.sponsors);
                break;
            default:
                users.push(customUsers[key]);
        }
    });

    return users;
};

export const getTemplate = ({ avatarURL, name, userName }: TEntity, imageSize = 100): string => `
    <td align="center">
        <a href="https://github.com/${userName}">
            <img src="${avatarURL}" width="${imageSize};" alt="${userName}"/>
            <br />
            <sub><b>${name ?? userName}</b></sub>
        </a>
    </td>`;

export const templateGenerator = (
    keywords: string[],
    userList: TAccounts,
    customUsers: Record<string, TEntity>
): string => {
    const users = stripDuplicates(buildTheUserList(keywords, userList, customUsers), 'userName');

    // const imageSize = 100;
    const columns = 7;

    const rows = Math.ceil(users.length / columns);

    let contributorsContent = '<table>\n';

    for (let row = 1; row <= rows; row++) {
        contributorsContent += '\t<tr>';

        for (
            let column = 1;
            column <= columns && (row - 1) * columns + column - 1 < users.length;
            column++
        ) {
            const user = users[(row - 1) * columns + column - 1];
            contributorsContent += getTemplate({ ...user, name: capitalizeWords(user.name) });
        }
        contributorsContent += '\n\t</tr>\n';
    }

    contributorsContent += `</table>\n`;

    return contributorsContent;
};
