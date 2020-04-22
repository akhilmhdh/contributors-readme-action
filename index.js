const core = require('@actions/core');
const github = require('@actions/github');

const capitalize = require("./capitalize");

async function run(){
    try{
        if(github.context.payload.action){
            if(github.content.payload.action !=="closed") return
        }

        const imageSize= core.getInput('imageSize');
        const columns = Number(core.getInput('columnsPerRow'))
    
        const token = process.env['GITHUB_TOKEN']

        if (!token){
            throw "Token not found"
        }

        const octokit = new github.GitHub(token);
        const nwo = process.env['GITHUB_REPOSITORY'] || '/'
        const [owner, repo] = nwo.split('/')
        
        const readme= await octokit.request(`GET /repos/${owner}/${repo}/readme`,{
            headers: {
                authorization: `token ${token}`,
              },
        })

        if(readme.headers.status==="404"){
            console.log("readme not added");
            return;
        }

        const contributors_list = await octokit.request(`GET /repos/${owner}/${repo}/contributors`,{
            headers: {
                authorization: `token ${token}`,
              },
        })
        

        const content = Buffer.from(readme.data.content,'base64').toString('ascii')

        
        let  preprocess_content= content.split("## ")
        let pos=null;
        
        for(let i=0;i<preprocess_content.length;i++){
            console.log(`${i}`,preprocess_content[i].split("\n"))
        }

        // for(let i=0;i<preprocess_content.length;i++){
        //     if (preprocess_content[i].split("\n")[0].includes("Contributors")){
        //         pos=i;
        //         break;
        //     }
        // }


        // const contributors = contributors_list.data;
        
        // const rows =Math.ceil( contributors.length / columns)
        
        // let contributors_content="<table>\n"

        // for(let row=1;row<=rows;row++){
        //     contributors_content+="<tr>"
        //     for(let column=1;column<=columns,row+column-1<=contributors.length;column++){
        //         const el = contributors[row+column-2]
                
        //         const user_details = await octokit.request(`GET /users/${el.login}`)

        //         if(user_details.data.name){
        //             contributors_content+=`
        //         <td align="center">
        //             <a href="https://github.com/${el.login}">
        //                 <img src="${el.avatar_url}" width="${imageSize};" alt="${el.login}"/>
        //                 <br />
        //                 <sub><b>${capitalize.toCapitalCase(user_details.data.name)}</b></sub>
        //             </a>
        //         </td>\n`
        //         }
        //     }
        //     contributors_content+="</tr>\n"
        // }

        // contributors_content+="</table>\n"
        
        // const template =`Contributors ✨\n${contributors_content}\n`

        // if(pos){
        //     preprocess_content[pos]=preprocess_content[pos].split("#")
        //     preprocess_content[pos][0]=template
        //     preprocess_content[pos]=preprocess_content[pos].join("#")
        // }
        // else{
        //     preprocess_content.push(template)
        // }

        // const postprocess_content= preprocess_content.join("## ")

        // const base64String = Buffer.from(postprocess_content).toString('base64')

        // const updateReadme = await octokit.request(`PUT /repos/${owner}/${repo}/contents/README.md`,{
        //     headers: {
        //         authorization: `token ${token}`,
        //       },
        //       "message": "contrib-auto-update",
        //     "content": base64String,
        //     "sha": readme.data.sha
        // })
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();
