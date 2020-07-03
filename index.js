const core = require('@actions/core');
const github = require('@actions/github');

const capitalize = require("./capitalize");

async function run(){
    try{
        if(github.context.payload.action){
            if(github.context.payload.action !=="closed") return
        }

        // get various inputs applied in action.yml
        const imageSize = core.getInput('imageSize').trim();
        const columns = Number(core.getInput('columnsPerRow').trim());
        const header = core.getInput('header').trim();

        // get repo token
        const token = process.env['GITHUB_TOKEN']

        if (!token){
            throw "Token not found"
        }

        // octakit library to access various functions
        const octokit = new github.GitHub(token);
        const nwo = process.env['GITHUB_REPOSITORY'] || '/'
        const [owner, repo] = nwo.split('/')
        
        // get the readme of the repo
        const readme= await octokit.request(`GET /repos/${owner}/${repo}/readme`,{
            headers: {
                authorization: `token ${token}`,
              },
        })

        if(readme.headers.status==="404"){
            console.log("readme not added");
            return;
        }

        // get all contributors of the repo max:500
        const contributors_list = await octokit.request(`GET /repos/${owner}/${repo}/contributors`,{
            headers: {
                authorization: `token ${token}`,
              },
        })
        
        // parse the base6 readme 
        const content = Buffer.from(readme.data.content,'base64').toString('ascii');

        // split to various sections
        let  preprocess_content= content.split(/(["\n"]#+)/)
        let pos=null;

        // regex object
        const re = new RegExp(`${header}["\n"]|${header} :sparkles:`);

        // find the location of contributors list
        for(let i=0;i<preprocess_content.length;i++){
            if (preprocess_content[i].match(re)){
                pos=i;
                break;
            }
        }

        // contributors template build
        const contributors = contributors_list.data;
        
        const rows =Math.ceil( contributors.length / columns);
        
        let contributors_content="<table>\n"

        for(let row=1;row<=rows;row++){
            contributors_content+="<tr>"
            for(let column=1;column<=columns,row+column-1<=contributors.length;column++){
                const el = contributors[row+column-2]
                
                const user_details = await octokit.request(`GET /users/${el.login}`)

                if(user_details.data.name){
                    contributors_content+=`
                <td align="center">
                    <a href="https://github.com/${el.login}">
                        <img src="${el.avatar_url}" width="${imageSize};" alt="${el.login}"/>
                        <br />
                        <sub><b>${capitalize.toCapitalCase(user_details.data.name)}</b></sub>
                    </a>
                </td>`
                }
            }
            contributors_content+="</tr>\n"
        }

        contributors_content+="</table>\n"
        
        const template =` ${header} :sparkles:\n${contributors_content}\n`;

        if(pos){
            preprocess_content[pos]=template
        }
        else{
            preprocess_content.push(`##${template}`);
        }

        const postprocess_content= preprocess_content.join("");

        const base64String = Buffer.from(postprocess_content).toString('base64');

        if(postprocess_content!=content){
            const updateReadme = await octokit.request(`PUT /repos/${owner}/${repo}/contents/README.md`,{
                headers: {
                    authorization: `token ${token}`,
                  },
                  "message": "contrib-auto-update",
                "content": base64String,
                "sha": readme.data.sha
            })
            console.log("Updated contribution section of readme");
        }
        
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();
