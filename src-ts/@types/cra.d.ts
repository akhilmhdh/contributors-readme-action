type TEntity = {
    avatarURL: string;
    name: string;
    userName: string;
    type: 'bot' | 'person';
};

type TAccounts = {
    contributors: TEntity[];
    collaborators: TEntity[];
    bots: TEntity[];
    sponsors: TEntity[];
};
