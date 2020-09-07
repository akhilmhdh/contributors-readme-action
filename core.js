const core = require("@actions/core");

const templateParser = require("./utils/templateParser");
const templateBuilder = require("./utils/templateBuilder");

exports.buildContent = async function (octokit, contributors, content) {
    // get various inputs applied in action.yml
    const imageSize = core.getInput("imageSize").trim();
    const columns = Number(core.getInput("columnsPerRow").trim());

    // get prev contributors in the readme
    var prevReadmeContributorsTemplate = content.match(
        /<!--\s*readme:contributors-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:contributors-end\s*-->/
    );
    const prevContributors = templateParser.parser(prevReadmeContributorsTemplate.groups.content);

    let contributors_content = await templateBuilder.parser(
        contributors,
        prevContributors,
        columns,
        imageSize,
        octokit
    );

    const postprocess_content = content.replace(
        /<!--\s*readme:contributors-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:contributors-end\s*-->/,
        contributors_content
    );

    return postprocess_content;
};
