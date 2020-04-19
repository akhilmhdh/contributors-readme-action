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
        //readme.data has the readme value

        const buff = new Buffer(readme.data.content,'base64')
        const content = buff.toString('utf-8')
        
        console.log("readme: ",content)
        console.log("readme details: ",readme.data.sha)
        
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();