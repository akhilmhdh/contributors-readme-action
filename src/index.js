import { nanoid } from 'nanoid';
import { getInput, setOutput, setFailed, getBooleanInput } from '@actions/core';
import { context } from '@actions/github';
import octokit from './octokit';

import buildContributorsList from './core';
import getSponsorListQuery from './query/getSponsorsList.gql';
import getOrgSponsorListQuery from './query/getOrgSponsorsList.gql';

async function run() {
    try {
        if (context.payload.action) {
            if (context.payload.action !== 'closed') return;
        }

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

        // get repo token
        const token = process.env['GITHUB_TOKEN'];

        if (!token) {
            throw new Error('Token not found');
        }

        const nwo = process.env['GITHUB_REPOSITORY'] || '/';
        const [owner, repo] = nwo.split('/');
        const branchDetails = await octokit.rest.repos.getBranch({ owner, repo, branch });
        const isProtected = branchDetails.data.protected && auto_detect_branch_protection;

        const userInfo = await octokit.rest.users.getByUsername({ username: owner });
        const isOrg = userInfo.data.type === 'Organization';
        // get the readme of the repo
        const readme = await octokit.rest.repos.getContent({ owner, repo, path, ref });
        if (readme.headers.status === '404') {
            console.log('readme not added');
            return;
        }

        // get all contributors of the repo max:500
        const contributorsList = await octokit.paginate(octokit.rest.repos.listContributors, {
            owner,
            repo
        });

        const collaboratorsList = await octokit.paginate(octokit.rest.repos.listCollaborators, {
            owner,
            repo,
            affiliation
        });

        /**
         * check whether the owner repo is user or not
         * if yes -> sponserlist of user
         * if no -> org sponserlist
         */
        const sponsorsList = await octokit.graphql(
            isOrg ? getOrgSponsorListQuery : getSponsorListQuery,
            { owner }
        );

        // get data of contributors
        // collaborators
        // bots
        const contributors = contributorsList.filter(
            el => el.type !== 'Bot' && !el.login.includes('actions-user')
        );
        const contributorsBots = contributorsList
            .filter(el => el.type === 'Bot' || el.login.includes('actions-user'))
            .map(({ login, avatar_url }) => ({
                login: login,
                avatar_url,
                name: login,
                type: 'bot'
            }));
        const collaborators = collaboratorsList.filter(
            el => el.type !== 'Bot' && !el.login.includes('actions-user')
        );

        const collaboratorsBots = contributorsList
            .filter(el => el.type === 'Bot' || el.login.includes('actions-user'))
            .map(({ login, avatar_url }) => ({
                login: login,
                avatar_url,
                name: login,
                type: 'bot'
            }));

        const sponsors = sponsorsList[
            isOrg ? 'organization' : 'user'
        ].sponsorshipsAsMaintainer.nodes
            .filter(el => Boolean(el))
            .map(({ sponsorEntity: { name, login, avatarUrl } }) => ({
                name,
                login,
                avatar_url: avatarUrl
            }));

        const bots = [...contributorsBots, ...collaboratorsBots];
        // parse the base64 readme
        let content = Buffer.from(readme.data.content, 'base64').toString('utf8');
        const prevContent = content;

        /**
         * regex expresstion to get all the special readme tags
         * eg: <!-- readme:contributors -start --!> anything inside this<!-- readme:contributors -end --!>
         * gets these matched and the content inside of these tags to an array
         */
        // get all tag comments with the given format
        const getAllReadmeComments = content.match(
            /\[\/\/]:\s#\s\(\s*readme:\s*[a-zA-Z0-9,]*\s*-start\s*\)[\\/\]:\s#\s\\(\s*readme:\s*[a-zA-Z0-9,]*\s*-end\s*\)/gm
        );

        // return action if no tags were found
        if (!getAllReadmeComments) {
            console.log('No contrib comments were attached');
            return;
        }

        // based on tags update the content
        for (let match = 0; match < getAllReadmeComments.length; match++) {
            content = await buildContributorsList(
                getAllReadmeComments[match],
                contributors,
                collaborators,
                bots,
                sponsors,
                content
            );
        }

        const base64String = Buffer.from(content, 'utf8').toString('base64');
        const committer = email && name ? { email, name } : undefined;

        if (prevContent !== content) {
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
                    content: base64String,
                    path,
                    sha: readme.data.sha,
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
                    content: base64String,
                    sha: readme.data.sha,
                    committer
                });
            }
            console.log('Updated contribution section of readme');
        }
    } catch (error) {
        setFailed(error.message);
    }
}

run();
