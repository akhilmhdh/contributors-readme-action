import { GitHub } from '@actions/github/lib/utils';
import { Sponsor } from '@octokit/graphql-schema';
import getSponsorListQuery from './query/getSponsorsList.gql';
import getOrgSponsorListQuery from './query/getOrgSponsorsList.gql';

type GetAccountsDTO = {
    owner: string;
    repo: string;
    affiliation?: 'all' | 'outside' | 'direct';
    isOrg?: boolean;
};

export type TEntity = {
    avatarURL: string;
    name: string;
    userName: string;
    type: 'bot' | 'person';
};

export const getAccounts = async (octokit: InstanceType<typeof GitHub>, dto: GetAccountsDTO) => {
    const { owner, repo, affiliation, isOrg } = dto;
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
    const sponsorsList = await octokit.graphql<{ sponsors: Sponsor }>(
        isOrg ? getOrgSponsorListQuery : getSponsorListQuery,
        { owner }
    );

    const contributors = contributorsList.filter(
        el => el.type !== 'Bot' && !el?.login?.includes('actions-user')
    );

    const contributorsBots = contributorsList
        .filter(el => el.type === 'Bot' || el?.login?.includes('actions-user'))
        .map(({ login, avatar_url: avatarURL }) => ({
            avatarURL,
            name: login,
            type: 'bot'
        }));

    const collaborators = collaboratorsList.filter(
        el => el.type !== 'Bot' && !el.login.includes('actions-user')
    );

    const collaboratorsBots = contributorsList
        .filter(el => el.type === 'Bot' || el?.login?.includes('actions-user'))
        .map(({ login, avatar_url: avatarURL }) => ({
            avatarURL,
            name: login,
            type: 'bot'
        }));

    const sponsors = (sponsorsList?.sponsors?.sponsorshipsAsMaintainer?.nodes ?? [])
        .map(el => {
            if (!el) return null;
            if (!el.sponsorEntity) return null;
            const { name, login, avatarUrl: avatarURL } = el.sponsorEntity;
            return {
                name,
                login,
                avatarURL
            };
        })
        .filter(el => Boolean(el));

    const bots = [...contributorsBots, ...collaboratorsBots];
};
