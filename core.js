const core = require("@actions/core");

const templateParser = require("./utils/templateParser");
const templateBuilder = require("./utils/templateBuilder");

// joinArray - join various arrays
// array will be joined based on priority
function joinArray(values, prevContributors, contributors, collaborators, bots) {
    let joinedArray = [];

    values.forEach((category) => {
        category = category.trim().toLowerCase();

        switch (category) {
            case "contributors":
                joinedArray = joinedArray.concat(contributors);
                break;
            case "collaborators":
                joinedArray = joinedArray.concat(collaborators);
                break;
            case "bots":
                joinedArray = joinedArray.concat(bots);
                break;
            default:
                prevContributors[category]
                    ? joinedArray.push({
                          login: category,
                          avatar_url: prevContributors[category].url,
                          name: prevContributors[category].name,
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
    // get prev contributors in the readme
    let prevReadmeContributorsTemplate = templateContent.match(
        /<!--\s*readme:(?<type>[\s\S]*?)-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:[\s\S]*?-end\s*-->/
    );
    const prevContributors = templateParser.parser(prevReadmeContributorsTemplate.groups.content);
    const types = prevReadmeContributorsTemplate.groups.type.split(",");
    const contributorsPool = joinArray(types, prevContributors, contributors, collaborators, bots);

    let contributors_content = await templateBuilder.parser(
        contributorsPool,
        prevContributors,
        prevReadmeContributorsTemplate.groups.type,
        octokit
    );

    const re = new RegExp(
        `<!--\\s*readme:\\s*${prevReadmeContributorsTemplate.groups.type}\\s*-start\\s*-->([\\s\\S]*?)<!--\\s*readme:\\s*${prevReadmeContributorsTemplate.groups.type}\\s*-end\\s*-->`
    );

    const postprocess_content = content.replace(re, contributors_content);
    return postprocess_content;
};
