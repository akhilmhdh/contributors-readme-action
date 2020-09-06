const core = require("@actions/core");
const github = require("@actions/github");

const capitalize = require("./utils/capitalize");

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

        // contributors template build
        const contributors = contributors_list.data.filter((el) => el.type !== "Bot");

        const rows = Math.ceil(contributors.length / columns);

        let contributors_content = "<!-- readme:contributors-start --> \n<table>\n";

        for (let row = 1; row <= rows; row++) {
            contributors_content += "<tr>";
            for (
                let column = 1;
                column <= columns && (row - 1) * columns + column - 1 < contributors.length;
                column++
            ) {
                const el = contributors[(row - 1) * columns + column - 1];

                const user_details = await octokit.request(`GET /users/${el.login}`);

                if (user_details.data.name) {
                    contributors_content += `
                <td align="center">
                    <a href="https://github.com/${el.login}">
                        <img src="${el.avatar_url}" width="${imageSize};" alt="${el.login}"/>
                        <br />
                        <sub><b>${capitalize.toCapitalCase(user_details.data.name)}</b></sub>
                    </a>
                </td>`;
                }
            }
            contributors_content += "</tr>\n";
        }

        contributors_content += "</table>\n<!-- readme:contributors-end -->\n";

        const postprocess_content = content.replace(
            /<!--\s*readme:contributors-start\s*-->(?<content>[\s\S]*?)<!--\s*readme:contributors-end\s*-->/,
            contributors_content
        );

        const base64String = Buffer.from(postprocess_content).toString("base64");

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
