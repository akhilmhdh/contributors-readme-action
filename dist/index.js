require('./sourcemap-register.js');module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 191:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const templateParser = __webpack_require__(169);
const templateBuilder = __webpack_require__(172);

/**
 * build a new array by joining given arrays
 * @param {Array} values - priority based order
 * @param {Array} prevContributors - contributors list of previous readme
 * @param {Array} contributors - current contributors
 * @param {Array} collaborators - current colloborators
 * @param {Array} bots - current bots
 * @returns {Array} prdered list
 */
function joinArray(values, prevContributors, contributors, collaborators, bots) {
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
                          avatar_url: prevContributors[category].url,
                          name: prevContributors[category].name
                      })
                    : joinedArray.push({ login: category });
                break;
        }
    });

    return joinedArray;
}

exports.buildContent = async function (
    templateContent,
    contributors,
    collaborators,
    bots,
    content,
    octokit
) {
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
    const prevContributors = templateParser.parser(prevReadmeContributorsTemplate.groups.content);
    const types = prevReadmeContributorsTemplate.groups.type.split(',');
    const contributorsPool = joinArray(types, prevContributors, contributors, collaborators, bots);

    let contributors_content = await templateBuilder.parser(
        contributorsPool,
        prevContributors,
        prevReadmeContributorsTemplate.groups.type,
        octokit
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


/***/ }),

/***/ 932:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(396);
const github = __webpack_require__(716);

const readMeCore = __webpack_require__(191);

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

        // octakit library to access various functions
        const octokit = github.getOctokit(token);
        const nwo = process.env['GITHUB_REPOSITORY'] || '/';
        const [owner, repo] = nwo.split('/');

        // get the readme of the repo
        const readme = await octokit.repos.getContent({ owner, repo, path });

        if (readme.headers.status === '404') {
            console.log('readme not added');
            return;
        }

        // get all contributors of the repo max:500
        const contributors_list = await octokit.repos.listContributors({ owner, repo });
        const collaborators_list = await octokit.repos.listCollaborators({
            owner,
            repo,
            affiliation
        });

        // get data of contributors
        // collaborators
        // bots
        const contributors = contributors_list.data.filter(el => el.type !== 'Bot');
        const contributorsBots = contributors_list.data
            .filter(el => el.type === 'Bot')
            .map(({ login, avatar_url }) => ({
                login: login,
                avatar_url,
                name: login,
                type: 'bot'
            }));
        const collaborators = collaborators_list.data.filter(el => el.type !== 'Bot');
        const collaboratorsBots = contributors_list.data
            .filter(el => el.type === 'Bot')
            .map(({ login, avatar_url }) => ({
                login: login,
                avatar_url,
                name: login,
                type: 'bot'
            }));
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
            content = await readMeCore.buildContent(
                getAllReadmeComments[match],
                contributors,
                collaborators,
                bots,
                content,
                octokit
            );
        }

        const base64String = Buffer.from(content).toString('base64');

        if (prevContent !== content) {
            await octokit.repos.createOrUpdateFileContents({
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

/***/ 61:
/***/ ((__unused_webpack_module, exports) => {

function capitalCaseUtil(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

exports.toCapitalCase = function (str) {
    return str ? str.split(' ').map(capitalCaseUtil).join(' ') : '';
};


/***/ }),

/***/ 597:
/***/ ((__unused_webpack_module, exports) => {

// function to clean an array of objects duplicates
exports.clean = function (arr, key) {
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
};


/***/ }),

/***/ 172:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const capitalize = __webpack_require__(61);
const stripDuplicates = __webpack_require__(597);

const core = __webpack_require__(396);

function getTemplate(userID, imageSize, name, avatar_url) {
    return `
    <td align="center">
        <a href="https://github.com/${userID}">
            <img src="${avatar_url}" width="${imageSize};" alt="${userID}"/>
            <br />
            <sub><b>${name ? capitalize.toCapitalCase(name) : userID}</b></sub>
        </a>
    </td>`;
}

// to get the full name of a user
async function getData(login, avatar_url, prevContributors, octokit) {
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
}

// to build the table layout
// takes prev data to avoid unneccessary call
exports.parser = async function (contributors, prevContributors, type, octokit) {
    // get various inputs applied in action.yml
    const imageSize = core.getInput('image_size').trim();
    const columns = Number(core.getInput('columns_per_row').trim());

    let contributors_content = `<!-- readme:${type}-start --> \n<table>\n`;

    contributors = stripDuplicates.clean(contributors, 'login');

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
                const { name, url } = await getData(login, avatar_url, prevContributors, octokit);
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


/***/ }),

/***/ 169:
/***/ ((__unused_webpack_module, exports) => {

// to convert given html template to an object
// to reuse the old data for efficiency

exports.parser = function (str) {
    // regex to parse into an array of three each with url userid and name
    // ntg to match will result in null
    let parsedKeys = str.match(/src="([\s\S]*?)"|alt="([\s\S]*?)"|<b>([\s\S]*?)<\/b>/gm);
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
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(932);
/******/ })()
;
//# sourceMappingURL=index.js.map