import stripDuplicates from './stripDuplicates';
import octokit from '../octokit';

import { getBooleanInput, getInput } from '@actions/core';
import { htmlEncoding } from './htmlEncoding';

export const getTemplate = (userID, imageSize, name, avatarUrl) => {
    return `
            <td align="center">
                <a href="https://github.com/${userID}">
                    <img src="${avatarUrl}" width="${imageSize};" alt="${userID}"/>
                    <br />
                    <sub><b>${name ? name : userID}</b></sub>
                </a>
            </td>
`;
};

/**
 * function to generate userinfo either from prev readme data or using fetch
 * @param {string} login : login id of github
 * @param {string} avatarUrl : url of the github user
 * @param {object} prevContributors : prev contributors list to fetch it like a cache instead of calling
 * @param {boolean} useUsername : to use githubid instead of full name
 */
export const getUserInfo = async (login, avatarUrl, prevContributors, useUserName) => {
    const isUserDetailsAvailable = Boolean(prevContributors[login] || (useUserName && avatarUrl));

    if (!isUserDetailsAvailable) {
        try {
            const {
                data: { name, avatar_url }
            } = await octokit.rest.users.getByUsername({ username: login });
            // Use login (== username) when useUserName is true, otherwise try to use name. 
            // Unless name is null, then fallback to login.
            const finalName = (useUserName) ? login: (name) ? htmlEncoding(name) : login
            return { name: finalName, url: avatar_url };
        } catch (error) {
            console.log(`Oops...given github id ${login} is invalid :(`);
            return { name: login, url: '' };
        }
    }

    // Use login (== username) when useUserName is true, otherwise try to use name.
    // If name is null, then fallback to login.
    const finalName = (useUserName) ? login : (prevContributors[login] && prevContributors[login].name) ?
        htmlEncoding(prevContributors[login].name) : login
    return {
        name: finalName,
        url: avatarUrl || prevContributors[login].url
    };
};

/**
 * core function to generate readme template
 * @param {object} contributors - contributors object
 * @param {object} prevContributors - previous contributors list stored in readme
 * @param {string} type - type like bot, contributors, collab
 * @param {object} octokit - github octokit client
 */
const templateBuilder = async (contributors, prevContributors, type) => {
    // get various inputs applied in action.yml
    const imageSize = getInput('image_size').trim();
    const useUsername = getBooleanInput('use_username');
    const columns = Number(getInput('columns_per_row').trim());

    let contributors_content = `<!-- readme:${type}-start -->\n<table>\n\t<tbody>\n`;

    contributors = stripDuplicates(contributors, 'login');

    const rows = Math.ceil(contributors.length / columns);

    for (let row = 1; row <= rows; row++) {
        contributors_content += '\t\t<tr>';
        for (
            let column = 1;
            column <= columns && (row - 1) * columns + column - 1 < contributors.length;
            column++
        ) {
            const { login, avatar_url, type } = contributors[(row - 1) * columns + column - 1];

            if (type !== 'bot') {
                const { name, url } = await getUserInfo(
                    login,
                    avatar_url,
                    prevContributors,
                    useUsername
                );
                contributors_content += getTemplate(
                    login,
                    imageSize,
                    name,
                    url
                );
            } else {
                contributors_content += getTemplate(login, imageSize, login, avatar_url);
            }
        }
        contributors_content += '\t\t</tr>\n';
    }

    contributors_content += `\t<tbody>\n</table>\n<!-- readme:${type}-end -->`;

    return contributors_content;
};

export default templateBuilder;
