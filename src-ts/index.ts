import { getBooleanInput, getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

async function run(): Promise<void> {
    try {
        // get various inputs applied in action.yml
        const path = getInput('readme_path').trim();
        const affiliation = getInput('collaborators').trim();
        const message = getInput('commit_message').trim();
        const name = getInput('committer_username').trim();
        const email = getInput('committer_email').trim();
        const prTitle = getInput('pr_title_on_protected').trim();
        const auto_detect_branch_protection = getBooleanInput('auto_detect_branch_protection');

        const ref = context.ref;
        const branch = context.ref.split('/').pop();
        if (!branch) {
            throw new Error('Branch not found');
        }

        // get repo token
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('Token not found');
        }

        // get octokit client for api communication
        const octokit = getOctokit(token);

        const nwo = process.env.GITHUB_REPOSITORY ?? '/';
        const [owner, repo] = nwo.split('/');

        const branchDetails = await octokit.rest.repos.getBranch({ owner, repo, branch });
        const isProtected = branchDetails.data.protected && auto_detect_branch_protection;

        const userInfo = await octokit.rest.users.getByUsername({ username: owner });
        const isOrg = userInfo.data.type === 'Organization';

        // get the readme of the repo
        const readme = await octokit.rest.repos.getContent({ owner, repo, path, ref });
        if (readme.headers.status === '404') {
            throw new Error('readme not added');
        }
    } catch (error) {
        setFailed((error as Error).message);
    }
}

void run();
