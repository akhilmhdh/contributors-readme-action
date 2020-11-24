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

export default templateParser;
