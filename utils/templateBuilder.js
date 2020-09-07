const capitalize = require("./capitalize");
const stripDuplicates = require("./stripDuplicates");
function getTemplate(userID, imageSize, name, avatar_url) {
    return `
    <td align="center">
        <a href="https://github.com/${userID}">
            <img src="${avatar_url}" width="${imageSize};" alt="${userID}"/>
            <br />
            <sub><b>${capitalize.toCapitalCase(name)}</b></sub>
        </a>
    </td>`;
}

// to get the full name of a user
async function getData(login, avatar_url, prevContributors, octokit) {
    if (prevContributors[login] && prevContributors[login].url) {
        return { name: prevContributors[login].name, url: prevContributors[login].url };
    } else {
        const user_details = await octokit.users.getByUsername({ username: login });
        return { name: user_details.data.name, url: user_details.data.avatar_url };
    }
}

// to build the table layout
// takes prev data to avoid unneccessary call
exports.parser = async function (
    contributors,
    prevContributors,
    type,
    columns,
    imageSize,
    octokit
) {
    console.log("hit parser");
    let contributors_content = `<!-- readme:${type}-start --> \n<table>\n`;

    contributors = stripDuplicates.clean(contributors, "login");

    const rows = Math.ceil(contributors.length / columns);

    for (let row = 1; row <= rows; row++) {
        contributors_content += "<tr>";
        for (
            let column = 1;
            column <= columns && (row - 1) * columns + column - 1 < contributors.length;
            column++
        ) {
            const { login, avatar_url } = contributors[(row - 1) * columns + column - 1];
            console.log(login, avatar_url);
            const { name, url } = await getData(login, avatar_url, prevContributors, octokit);
            console.log(login, avatar_url);
            contributors_content += getTemplate(login, imageSize, name, url);
        }
        contributors_content += "</tr>\n";
    }

    contributors_content += `</table>\n<!-- readme:${type}-end -->`;

    return contributors_content;
};
