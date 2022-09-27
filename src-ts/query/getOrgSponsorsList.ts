export default /* GraphQL */ `
    query ($owner: String!) {
        sponsors: organization(login: $owner) {
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