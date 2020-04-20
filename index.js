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

        const content = Buffer.from(readme.data.content,'base64').toString('ascii')
        
        let  preprocess_content= content.split("# ")
        let pos;

        for(let i=0;i<preprocess_content.length;i++){
            if (preprocess_content[i].includes("Contributors List")){
                pos=i;
                break;
            }
        }
        let contributors_content=""

        contributors_list.data.forEach(function(el){
            const image=`[${el.login}](${el.avatar_url}&s=100)`
             contributors_content+=image
        })
        
        const github_action="[github-actions[bot]](https://avatars2.githubusercontent.com/in/15368?v=4&s=100)"

        contributors_content=contributors_content.replace(github_action,"")

        const template =`Contributors List\n${contributors_content}`

        preprocess_content[pos]=template

        const postprocess_content= preprocess_content.join("# ")

        const base64String = Buffer.from(postprocess_content).toString('base64')

        const updateReadme = await octokit.request(`PUT /repos/${owner}/${repo}/contents/README.md`,{
            headers: {
                authorization: `token ${myToken}`,
              },
              "message": "contrib-auto-update",
            "content": base64String,
            "sha": readme.data.sha
        })
         console.log("updated readme")
    }
    catch(error){
        core.setFailed(error.message)
    }
}

run();