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
        let pos;

        for(let i=0;i<preprocess_content.length;i++){
            if (preprocess_content[i].includes("Contributors List")){
                pos=i;
                break;
            }
        }

        const contributors_content = contributors_list.data.reduce(function(acc,el){
            const image=`[${el.login}](${el.avatar_url}&s=100)`
            return acc+image
        })

        const template =`Contributors List\n ${contributors_content}`

        preprocess_content[pos]=template

        const postprocess_content= preprocess_content.join("# ")

        console.log("readme: ",postprocess_content)
        // console.log("readme details: ",readme.data.sha)
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();