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
                Accept: "application/vnd.github.VERSION.raw+json"
              },
        })
        console.log(`readme: ${JSON.stringify((readme))}`);
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();