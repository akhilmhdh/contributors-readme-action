import capitalize from './capitalize';
import stripDuplicates from './stripDuplicates';
import octokit from '../octokit';

import * as core from '@actions/core';

export const getTemplate = (userID, imageSize, name, avatar_url) => {
    return `
    <td align="center">
        <a href="https://github.com/${userID}">
            <img src="${avatar_url}" width="${imageSize};" alt="${userID}"/>
            <br />
            <sub><b>${name ? capitalize(name) : userID}</b></sub>
        </a>
    </td>`;
};

/**
 * function to generate userinfo either from prev readme data or using fetch
 * @param {string} login : login id of github
 * @param {string} avatar_url : url of the github user
 * @param {object} prevContributors : prev contributors list to fetch it like a cache instead of calling
 * @param {object} octokit : octokit client
 */
export const getUserInfo = async (login, avatar_url, prevContributors) => {
    if (prevContributors[login] && prevContributors[login].url) {
        return { name: prevContributors[login].name, url: avatar_url };
    } else {
        try {
            const user_details = await octokit.users.getByUsername({ username: login });
            return { name: user_details.data.name, url: user_details.data.avatar_url };
        } catch (error) {
            console.log(`Oops...given github id ${login} is invalid :(`);
            return { name: login, url: '' };
        }
    }
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
    const imageSize = core.getInput('image_size').trim();
    const columns = Number(core.getInput('columns_per_row').trim());

    let contributors_content = `<!-- readme:${type}-start --> \n<table>\n`;

    contributors = stripDuplicates(contributors, 'login');

    const rows = Math.ceil(contributors.length / columns);

    for (let row = 1; row <= rows; row++) {
        contributors_content += '<tr>';
        for (
            let column = 1;
            column <= columns && (row - 1) * columns + column - 1 < contributors.length;
            column++
        ) {
            const { login, avatar_url, type } = contributors[(row - 1) * columns + column - 1];

            if (type !== 'bot') {
                const { name, url } = await getUserInfo(login, avatar_url, prevContributors);
                contributors_content += getTemplate(login, imageSize, name, url);
            } else {
                contributors_content += getTemplate(login, imageSize, login, avatar_url);
            }
        }
        contributors_content += '</tr>\n';
    }

    contributors_content += `</table>\n<!-- readme:${type}-end -->`;

    return contributors_content;
};

export default templateBuilder;
