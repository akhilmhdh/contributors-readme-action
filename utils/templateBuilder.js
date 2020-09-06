
const capitalize = require("./capitalize");


function getTemplate(userID,imageSize,name,avatar_url){
    return `
    <td align="center">
        <a href="https://github.com/${userID}">
            <img src="${avatar_url}" width="${imageSize};" alt="${userID}"/>
            <br />
            <sub><b>${capitalize.toCapitalCase(name)}</b></sub>
        </a>
    </td>`
}

// to get the full name of a user
function getName(login,prevContributors,octokit){
    if(prevContributors.login){
        return prevContributors.login.name;
    } else {
        const user_details = await octokit.users.getByUsername({username:login});
        return user_details.data.name;
    }
}

// to build the table layout
// takes prev data to avoid unneccessary call
exports.parser = function (contributors,prevContributors,columns,imageSize,octokit) {
    let contributors_content = "<!-- readme:contributors-start --> \n<table>\n";
    
    const rows = Math.ceil(contributors.length / columns);

    for (let row = 1; row <= rows; row++) {
        contributors_content += "<tr>";
        for (
            let column = 1;
            column <= columns && (row - 1) * columns + column - 1 < contributors.length;
            column++
        ) {
            const {login,avatar_url} = contributors[(row - 1) * columns + column - 1];

            const name = getName(login,prevContributors,octokit)

            if (name) {
                contributors_content += getTemplate(login,imageSize,name,avatar_url)
            }
        }
        contributors_content += "</tr>\n";
    }

    contributors_content += "</table>\n<!-- readme:contributors-end -->\n";

    return contributors_content
}