const core = require('@actions/core');
const github = require('@actions/github');

async function run(){
    try{
        const myToken = core.getInput('myToken');

        if (!myToken){
            throw "Token not found"
        }
        const octokit = new github.GitHub(myToken);
        const nwo = process.env['GITHUB_REPOSITORY'] || '/'
        const [owner, repo] = nwo.split('/')
        
        const readme= await octokit.request(`GET /repos/${owner}/${repo}/readme`,{
            headers: {
                authorization: `token ${myToken}`,
              },
        })

        const contributors_list = await octokit.request(`GET /repos/${owner}/${repo}/contributors`,{
            headers: {
                authorization: `token ${myToken}`,
              },
        })
        //readme.data has the readme value

        const buff = Buffer.from(readme.data.content,'base64')
        const content = buff.toString('utf-8')
        
        let  preprocess_content= content.split("# ")
        preprocess_content = preprocess_content.filter(function(el){return el.includes("Contributors List")})
        const contributors_list = preprocess_content[0].split("\n")[1]
        console.log("readme: ",content)
        console.log("contributors api: ",contributors_list)
        // console.log("readme details: ",readme.data.sha)
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();