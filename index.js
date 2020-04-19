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
        const readme_details= await octokit.request(`GET /repos/${owner}/${repo}/readme`,{
            headers: {
                authorization: `token ${myToken}`,
              },
        })
        //readme.data has the readme value

        console.log("readme: ",readme.data)
        console.log("readme details: ",JSON.stringify(readme_details))
        
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();