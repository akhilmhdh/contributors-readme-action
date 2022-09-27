export default /* GraphQL */ `
    query ($owner: String!) {
        sponsors: user(login: $owner) {
            name
            sponsorshipsAsMaintainer(first: 100) {
                nodes {
                    sponsorEntity {
                        ... on User {
                            name
                            login
                            avatarUrl
                        }
                        ... on Organization {
                            name
                            login
                            avatarUrl
                        }
                    }
                }
            }
        }
    }
`;
