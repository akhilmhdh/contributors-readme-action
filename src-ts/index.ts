import { getBooleanInput, getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { nanoid } from 'nanoid';

import { getCustomUsers, getKeywordsAccounts } from './account';
import { parser } from './parser';
import { templateGenerator } from './template';

async function run(): Promise<void> {
    try {
        // get various inputs applied in action.yml
        const path = getInput('readme_path').trim();
        const affiliation = getInput('collaborators').trim() as 'all' | 'outside' | 'direct';
        const message = getInput('commit_message').trim();
        const name = getInput('committer_username').trim();
        const email = getInput('committer_email').trim();
        const prTitle = getInput('pr_title_on_protected').trim();
        const autoDetectBranchProtection = getBooleanInput('auto_detect_branch_protection');

        const { ref } = context;
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
        const isProtected = branchDetails.data.protected && autoDetectBranchProtection;

        const userInfo = await octokit.rest.users.getByUsername({ username: owner });
        const isOrg = userInfo.data.type === 'Organization';

        // get the readme of the repo
        const rawContentRes = await octokit.rest.repos.getContent({ owner, repo, path, ref });
        if (rawContentRes.headers.status !== '200') {
            throw new Error('readme not added');
        }

        if (Array.isArray(rawContentRes.data) || rawContentRes.data?.type !== 'file') {
            throw new Error('readme file is invalid');
        }

        const rawContentBase64 = (rawContentRes?.data as any)?.content as string;
        const rawContent = Buffer.from(rawContentBase64, 'base64').toString('utf8');

        const { content, uniqueKeywords } = parser(rawContent);

        const userList = await getKeywordsAccounts(octokit, {
            owner,
            repo,
            affiliation,
            isOrg
        });
        const customUserData = await getCustomUsers(octokit, uniqueKeywords);

        const newContentParsed = content.map(c => {
            if (c.isLine) return c.line;
            return `<!-- cra:start ${c.type.join(',')} -->\n
${templateGenerator(c.type, userList, customUserData)}`;
        });

        const newContent = newContentParsed.join('\n');

        const newContentBase64 = Buffer.from(newContent, 'utf8').toString('base64');
        const committer = email && name ? { email, name } : undefined;

        if (newContentBase64 !== rawContentBase64) {
            if (isProtected) {
                const uniqueId = nanoid(10);
                const branchNameForPR = `contributors-readme-action-${uniqueId}`;

                await octokit.rest.git.createRef({
                    owner,
                    repo,
                    ref: `refs/heads/${branchNameForPR}`,
                    sha: context.sha
                });

                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    message,
                    content: newContentBase64,
                    path,
                    sha: rawContentRes.data.sha,
                    branch: branchNameForPR,
                    committer
                });

                const prDetails = await octokit.rest.pulls.create({
                    owner,
                    repo,
                    base: branch,
                    head: branchNameForPR,
                    title: prTitle
                });
                setOutput('pr_id', prDetails.data.number);
            } else {
                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    message,
                    path,
                    branch,
                    content: newContentBase64,
                    sha: rawContentRes.data.sha,
                    committer
                });
            }

            // eslint-disable-next-line no-console
            console.log('Updated contribution section of readme');
        }
    } catch (error) {
        setFailed((error as Error).message);
    }
}

void run();
