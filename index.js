const core = require("@actions/core");
const github = require("@actions/github");

const readMeCore = require("./core");

async function run() {
    try {
        if (github.context.payload.action) {
            if (github.context.payload.action !== "closed") return;
        }

        // get various inputs applied in action.yml
        const path = core.getInput("readme_path").trim();

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
        const readme = await octokit.repos.getContent({ owner, repo, path });

        if (readme.headers.status === "404") {
            console.log("readme not added");
            return;
        }

        // get all contributors of the repo max:500
        const contributors_list = await octokit.repos.listContributors({ owner, repo });
        const collabrators_list = await octokit.repos.listCollaborators({
            owner,
            repo,
            affiliation: "direct",
        });
        // contributors template build
        const contributors = contributors_list.data.filter((el) => el.type !== "Bot");
        const collabrators = collabrators_list.data;

        // parse the base6 readme
        let content = Buffer.from(readme.data.content, "base64").toString("ascii");
        const prevContent = content;
        const getAllReadmeComments = content.match(
            /<!--\s*readme:\s*[a-zA-Z0-9,-]*\s*-start\s*-->[\s\S]*?<!--\s*readme:\s*[a-zA-Z0-9,-]*\s*-end\s*-->/gm
        );

        if (!getAllReadmeComments) {
            console.log("No contrib comments were attached");
            return;
        }

        for (let match = 0; match < getAllReadmeComments.length; match++) {
            content = await readMeCore.buildContent(
                getAllReadmeComments[match],
                contributors,
                collabrators,
                content,
                octokit
            );
        }

        const base64String = Buffer.from(content).toString("base64");

        if (prevContent !== content) {
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                message: "contrib-auto-update",
                content: base64String,
                path,
                sha: readme.data.sha,
            });
            console.log("Updated contribution section of readme");
        }
    } catch (error) {
        console.log(error);
        core.setFailed(error.message);
    }
}

run();
