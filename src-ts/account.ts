/* eslint-disable import/no-extraneous-dependencies */
import { GitHub } from '@actions/github/lib/utils';
import { Sponsor } from '@octokit/graphql-schema';
import getSponsorListQuery from './query/getSponsorsList';
import getOrgSponsorListQuery from './query/getOrgSponsorsList';

type GetAccountsDTO = {
    owner: string;
    repo: string;
    affiliation?: 'all' | 'outside' | 'direct';
    isOrg?: boolean;
};

type Octokit = InstanceType<typeof GitHub>;

export const getKeywordsAccounts = async (
    octokit: Octokit,
    dto: GetAccountsDTO
): Promise<TAccounts> => {
    const { owner, repo, affiliation, isOrg } = dto;
    // get all contributors of the repo max:500
    const contributorsList = await octokit.paginate(octokit.rest.repos.listContributors, {
        owner,
        repo
    });
    console.log(JSON.stringify(contributorsList, null, 4));

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

    const contributors = contributorsList
        .filter(el => el.type !== 'Bot' && !el?.login?.includes('actions-user'))
        .map(({ avatar_url: avatarURL = '', login = '', name = '' }) => ({
            avatarURL,
            name,
            type: 'person' as const,
            userName: login
        }));

    const contributorsBots = contributorsList
        .filter(el => el.type === 'Bot' || el?.login?.includes('actions-user'))
        .map(({ login = '', avatar_url: avatarURL = '' }) => ({
            avatarURL,
            name: login,
            userName: login,
            type: 'bot' as const
        }));

    const collaborators = collaboratorsList
        .filter(el => el.type !== 'Bot' && !el.login.includes('actions-user'))
        .map(({ avatar_url: avatarURL = '', login = '', name = '' }) => ({
            avatarURL,
            name,
            type: 'person' as const,
            userName: login
        })) as TEntity[];

    const collaboratorsBots = contributorsList
        .filter(el => el.type === 'Bot' || el?.login?.includes('actions-user'))
        .map(({ login = '', avatar_url: avatarURL = '' }) => ({
            avatarURL,
            name: login,
            userName: login,
            type: 'bot' as const
        }));

    const sponsors = (sponsorsList?.sponsors?.sponsorshipsAsMaintainer?.nodes ?? [])
        .map(el => {
            if (!el) return null;
            if (!el.sponsorEntity) return null;

            const { name, login, avatarUrl: avatarURL } = el.sponsorEntity;
            return {
                name,
                userName: login,
                avatarURL,
                type: 'person'
            };
        })
        .filter(el => Boolean(el)) as TEntity[];

    const bots = [...contributorsBots, ...collaboratorsBots];

    return {
        contributors,
        collaborators,
        sponsors,
        bots
    };
};

export const getCustomUsers = async (
    octokit: Octokit,
    keywords: string[]
): Promise<Record<string, TEntity>> => {
    const userInfo: Record<string, TEntity> = {};

    const customUserNames = keywords.filter(
        el => el !== 'contributors' && el !== 'bots' && el !== 'collaborators' && el !== 'sponsors'
    );

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    customUserNames.forEach(async userName => {
        const {
            data: { name, avatar_url: avatarURL, type }
        } = await octokit.rest.users.getByUsername({ username: userName });

        userInfo[userName] = {
            name: name ?? 'unknown',
            avatarURL,
            type: type === 'bot' ? 'bot' : 'person',
            userName
        };
    });

    return userInfo;
};
