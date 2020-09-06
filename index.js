const core = require("@actions/core");
const github = require("@actions/github");

const capitalize = require("./utils/capitalize");
const templateParser = require("./utils/templateParser");
const templateBuilder = require("./utils/templateBuilder");

async function run() {
    try {
        if (github.context.payload.action) {
            if (github.context.payload.action !== "closed") return;
        }

        // get various inputs applied in action.yml
        const imageSize = core.getInput("imageSize").trim();
        const columns = Number(core.getInput("columnsPerRow").trim());
        // const header = core.getInput('header').trim();

        // get repo token
        const token = process.env["GITHUB_TOKEN"];

        if (!token) {
            throw new Error("Token not found");
        }

        // octakit library to access various functions
        const octokit = github.getOctokit(token);
        const nwo = process.env["GITHUB_REPOSITORY"] || "/";
        const [owner, repo] = nwo.split("/");

        // get the readme of the repo
        const readme = await octokit.repos.getReadme({ owner, repo });

        if (readme.headers.status === "404") {
            console.log("readme not added");
            return;
        }

        // get all contributors of the repo max:500
        const contributors_list = await octokit.repos.listContributors({ owner, repo });

        // parse the base6 readme
        const content = Buffer.from(readme.data.content, "base64").toString("ascii");

        // get prev contributors in the readme
        var prevReadmeContributorsTemplate = content.match(
            /<!--\s*readme:contributors-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:contributors-end\s*-->/
        );
        const prevContributors = templateParser.parser(
            prevReadmeContributorsTemplate.groups.content
        );

        // contributors template build
        const contributors = contributors_list.data.filter((el) => el.type !== "Bot");

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

        const base64String = Buffer.from(postprocess_content).toString("base64");
        console.log(postprocess_content, content);

        if (postprocess_content != content) {
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                message: "contrib-auto-update",
                content: base64String,
                path: "README.md",
                sha: readme.data.sha,
            });
            console.log("Updated contribution section of readme");
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
