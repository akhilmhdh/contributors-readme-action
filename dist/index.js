require('./sourcemap-register.js');module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 564:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/core
var core = __webpack_require__(396);
// EXTERNAL MODULE: ./node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/github
var github = __webpack_require__(716);
// CONCATENATED MODULE: ./src/octokit.js
/**
 * Shard octokit client
 */


// get repo token
const token = process.env['GITHUB_TOKEN'];

const octokit = github.getOctokit(token);

/* harmony default export */ const src_octokit = (octokit);

// CONCATENATED MODULE: ./src/utils/templateParser.js
/**
 * @typedef {Object} parsedData
 * @property {string} url - avatar url
 * @property {string} name - full name of the github user profile, can be null
 */

/**
 * given an input string it will search for all the img tags inside contributors list. readme
 * used for using past data for more speed
 * parse these \<img src=github_url alt=github_user_name>github_full_name\</img>
 * into  array of object of three keys each
 * @param {string} inputTemplate : multiline string
 * @returns {{username:parsedData}[]}
 */
const templateParser = inputTemplate => {
    // regex to parse into an array of three each with url userid and name
    // ntg to match will result in null
    let parsedKeys = inputTemplate.match(/src="([\s\S]*?)"|alt="([\s\S]*?)"|<b>([\s\S]*?)<\/b>/gm);
    if (!parsedKeys) return {};

    let data = {};

    for (let i = 0; i < parsedKeys.length; i = i + 3) {
        let url = parsedKeys[i].substring(5, parsedKeys[i].length - 1);
        let userid = parsedKeys[i + 1].substring(5, parsedKeys[i + 1].length - 1);
        let name = parsedKeys[i + 2].substring(3, parsedKeys[i + 2].length - 4);
        data[userid] = { url, name };
    }

    return data;
};

/* harmony default export */ const utils_templateParser = (templateParser);

// CONCATENATED MODULE: ./src/utils/capitalize.js
const capitalCaseUtil = str => {
    return str.charAt(0).toUpperCase() + str.substring(1);
};

/* harmony default export */ const capitalize = (str => {
    return str ? str.split(' ').map(capitalCaseUtil).join(' ') : '';
});

// CONCATENATED MODULE: ./src/utils/stripDuplicates.js
/**
 * function to clean an array of objects with duplicates
 * @param {Array} - arr - array of objects
 * @param {string} - key - key to compare
 */
/* harmony default export */ const stripDuplicates = ((arr = [], key) => {
    // if either array or key is null
    if (!arr || !key) return [];
    const unqiue = {};
    const uniqueArray = [];
    for (let index = 0; index < arr.length; index++) {
        const value = arr[index];
        if (!unqiue[value[key]]) {
            unqiue[value[key]] = true;
            uniqueArray.push(value);
        }
    }
    return uniqueArray;
});

// CONCATENATED MODULE: ./src/utils/templateBuilder.js






const getTemplate = (userID, imageSize, name, avatarUrl) => {
    return `
    <td align="center">
        <a href="https://github.com/${userID}">
            <img src="${avatarUrl}" width="${imageSize};" alt="${userID}"/>
            <br />
            <sub><b>${name ? capitalize(name) : userID}</b></sub>
        </a>
    </td>`;
};

/**
 * function to generate userinfo either from prev readme data or using fetch
 * @param {string} login : login id of github
 * @param {string} avatarUrl : url of the github user
 * @param {object} prevContributors : prev contributors list to fetch it like a cache instead of calling
 * @param {object} octokit : octokit client
 */
const getUserInfo = async (login, avatarUrl, prevContributors) => {
    if (prevContributors[login] && prevContributors[login].url) {
        return { name: prevContributors[login].name, url: avatarUrl };
    } else {
        try {
            const user_details = await src_octokit.users.getByUsername({ username: login });
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
            const { login, avatarUrl, type } = contributors[(row - 1) * columns + column - 1];

            if (type !== 'bot') {
                const { name, url } = await getUserInfo(login, avatarUrl, prevContributors);
                contributors_content += getTemplate(login, imageSize, name, url);
            } else {
                contributors_content += getTemplate(login, imageSize, login, avatarUrl);
            }
        }
        contributors_content += '</tr>\n';
    }

    contributors_content += `</table>\n<!-- readme:${type}-end -->`;

    return contributors_content;
};

/* harmony default export */ const utils_templateBuilder = (templateBuilder);

// CONCATENATED MODULE: ./src/core.js


/**
 * build a new array by joining given arrays
 * @param {Array} values - priority based order
 * @param {Array} prevContributors - contributors list of previous readme
 * @param {Array} contributors - current contributors
 * @param {Array} collaborators - current colloborators
 * @param {Array} bots - current bots
 * @returns {Array} prdered list
 */
const joinArray = (values, prevContributors, contributors, collaborators, bots) => {
    let joinedArray = [];

    values.forEach(category => {
        category = category.trim().toLowerCase();

        switch (category) {
            case 'contributors':
                joinedArray = joinedArray.concat(contributors);
                break;
            case 'collaborators':
                joinedArray = joinedArray.concat(collaborators);
                break;
            case 'bots':
                joinedArray = joinedArray.concat(bots);
                break;
            default:
                prevContributors[category]
                    ? joinedArray.push({
                          login: category,
                          avatarUrl: prevContributors[category].url,
                          name: prevContributors[category].name
                      })
                    : joinedArray.push({ login: category });
                break;
        }
    });

    return joinedArray;
};

const buildContent = async (templateContent, contributors, collaborators, bots, content) => {
    /**
     * regex expression to parse the options passed inside the readme tags
     * eg: <!-- readme:contributors,bots -start --!> anything inside this<!-- readme:contributors,bots -end --!>
     * using the regex we get two groups return as
     *  type: contributors,bots
     *      use: to get the options passed
     *  content: anything that was inside the tag
     *      use: to reuse the html created inside the tah
     */
    // get prev contributors in the readme
    let prevReadmeContributorsTemplate = templateContent.match(
        /<!--\s*readme:(?<type>[\s\S]*?)-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:[\s\S]*?-end\s*-->/
    );
    const prevContributors = utils_templateParser(prevReadmeContributorsTemplate.groups.content);
    const types = prevReadmeContributorsTemplate.groups.type.split(',');
    const contributorsPool = joinArray(types, prevContributors, contributors, collaborators, bots);

    let contributors_content = await utils_templateBuilder(
        contributorsPool,
        prevContributors,
        prevReadmeContributorsTemplate.groups.type
    );

    /**
     * Build back the new template
     * replace it with the old one
     */
    const re = new RegExp(
        `<!--\\s*readme:\\s*${prevReadmeContributorsTemplate.groups.type}\\s*-start\\s*-->([\\s\\S]*?)<!--\\s*readme:\\s*${prevReadmeContributorsTemplate.groups.type}\\s*-end\\s*-->`
    );

    const postprocess_content = content.replace(re, contributors_content);
    return postprocess_content;
};

/* harmony default export */ const src_core = (buildContent);

// CONCATENATED MODULE: ./src/query/getSponsersList.gql
/* harmony default export */ const getSponsersList = (`
query($owner: String!) {
    user(login: "freakboy3742") {
        name
        sponsorshipsAsMaintainer(first: 100) {
            nodes {
                sponsorEntity {
                    ... on User {
                        name
                        login
                        avatarUrl
                    }
                }
            }
        }
    }
}
`);

// CONCATENATED MODULE: ./src/index.js







async function run() {
    try {
        if (github.context.payload.action) {
            if (github.context.payload.action !== 'closed') return;
        }

        // get various inputs applied in action.yml
        const path = core.getInput('readme_path').trim();
        const affiliation = core.getInput('collaborators').trim();
        const message = core.getInput('commit_message').trim();
        const name = core.getInput('committer_username').trim();
        const email = core.getInput('committer_email').trim();

        // get repo token
        const token = process.env['GITHUB_TOKEN'];

        if (!token) {
            throw new Error('Token not found');
        }

        const nwo = process.env['GITHUB_REPOSITORY'] || '/';
        const [owner, repo] = nwo.split('/');

        // get the readme of the repo
        const readme = await src_octokit.repos.getContent({ owner, repo, path });

        if (readme.headers.status === '404') {
            console.log('readme not added');
            return;
        }

        // get all contributors of the repo max:500
        const contributorsList = await src_octokit.repos.listContributors({ owner, repo });
        const collaboratorsList = await src_octokit.repos.listCollaborators({
            owner,
            repo,
            affiliation
        });
        const sponsersList = await src_octokit.graphql(getSponsersList, { owner });

        // get data of contributors
        // collaborators
        // bots
        const contributors = contributorsList.data.filter(el => el.type !== 'Bot');
        const contributorsBots = contributorsList.data
            .filter(el => el.type === 'Bot')
            .map(({ login, avatar_url }) => ({
                login: login,
                avatarUrl: avatar_url,
                name: login,
                type: 'bot'
            }));
        const collaborators = collaboratorsList.data.filter(el => el.type !== 'Bot');
        const collaboratorsBots = contributorsList.data
            .filter(el => el.type === 'Bot')
            .map(({ login, avatar_url }) => ({
                login: login,
                avatarUrl: avatar_url,
                name: login,
                type: 'bot'
            }));
        const sponsers = sponsersList.user.sponsorshipsAsMaintainer.nodes.map(
            ({ sponsorEntity: { name, login, avatarUrl } }) => ({
                name,
                login,
                avatarUrl
            })
        );
        console.log(sponsers);
        const bots = [...contributorsBots, ...collaboratorsBots];
        // parse the base64 readme
        let content = Buffer.from(readme.data.content, 'base64').toString('ascii');
        const prevContent = content;

        /**
         * regex expresstion to get all the special readme tags
         * eg: <!-- readme:contributors -start --!> anything inside this<!-- readme:contributors -end --!>
         * gets these matched and the content inside of these tags to an array
         */
        // get all tag comments with the given format
        const getAllReadmeComments = content.match(
            /<!--\s*readme:\s*[a-zA-Z0-9,-]*\s*-start\s*-->[\s\S]*?<!--\s*readme:\s*[a-zA-Z0-9,-]*\s*-end\s*-->/gm
        );

        // return action if no tags were found
        if (!getAllReadmeComments) {
            console.log('No contrib comments were attached');
            return;
        }

        // based on tags update the content
        for (let match = 0; match < getAllReadmeComments.length; match++) {
            content = await src_core(
                getAllReadmeComments[match],
                contributors,
                collaborators,
                bots,
                content
            );
        }

        const base64String = Buffer.from(content).toString('base64');

        if (prevContent !== content) {
            await src_octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                message,
                content: base64String,
                path,
                sha: readme.data.sha,
                committer: {
                    name,
                    email
                }
            });
            console.log('Updated contribution section of readme');
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();


/***/ }),

/***/ 396:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 716:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(564);
/******/ })()
;
//# sourceMappingURL=index.js.map