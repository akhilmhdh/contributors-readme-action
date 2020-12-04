import templateParser from './utils/templateParser';
import templateBuilder from './utils/templateBuilder';
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
    const prevContributors = templateParser(prevReadmeContributorsTemplate.groups.content);
    const types = prevReadmeContributorsTemplate.groups.type.split(',');
    const contributorsPool = joinArray(types, prevContributors, contributors, collaborators, bots);

    let contributors_content = await templateBuilder(
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

export default buildContent;
