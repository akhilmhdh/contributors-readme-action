const core = require("@actions/core");

const templateParser = require("./utils/templateParser");
const templateBuilder = require("./utils/templateBuilder");

function joinArray(values, prevContributors, contributors, collaborators) {
    let joinedArray = [];

    values.forEach((category) => {
        category = category.trim();

        switch (category) {
            case "contributors":
                joinedArray = joinedArray.concat(contributors);
                break;
            case "collaborators":
                joinedArray = joinedArray.concat(collaborators);
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
    content,
    octokit
) {
    // get various inputs applied in action.yml
    const imageSize = core.getInput("imageSize").trim();
    const columns = Number(core.getInput("columnsPerRow").trim());

    // get prev contributors in the readme
    let prevReadmeContributorsTemplate = templateContent.match(
        /<!--\s*readme:(?<type>[\s\S]*?)-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:[\s\S]*?-end\s*-->/
    );
    const prevContributors = templateParser.parser(prevReadmeContributorsTemplate.groups.content);
    const types = prevReadmeContributorsTemplate.groups.type.split(",");
    const contributorsPool = joinArray(types, prevContributors, contributors, collaborators);

    let contributors_content = await templateBuilder.parser(
        contributorsPool,
        prevContributors,
        prevReadmeContributorsTemplate.groups.type,
        columns,
        imageSize,
        octokit
    );

    const re = new RegExp(
        `<!--\\s*readme:\\s*${prevReadmeContributorsTemplate.groups.type}\\s*-start\\s*-->([\\s\\S]*?)<!--\\s*readme:\\s*${prevReadmeContributorsTemplate.groups.type}\\s*-end\\s*-->`
    );

    const postprocess_content = content.replace(re, contributors_content);
    return postprocess_content;
};
