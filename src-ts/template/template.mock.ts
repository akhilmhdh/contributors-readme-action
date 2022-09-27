export const userMockList: TAccounts = {
    bots: [],
    contributors: [{ avatarURL: 'lorem', name: 'ipsum', type: 'person', userName: 'dolor' }],
    collaborators: [],
    sponsors: []
};

export const customMockUsers: Record<string, TEntity> = {
    x: {
        avatarURL: 'lorem',
        name: 'x',
        type: 'person',
        userName: 'x'
    }
};

export const mockTableTemplate = `
<table>
\t<tr>
    <td align="center">
        <a href="https://github.com/dolor">
            <img src="lorem" width="100;" alt="dolor"/>
            <br />
            <sub><b>Ipsum</b></sub>
        </a>
    </td>
\t</tr>
</table>
`;

export const mockTableTemplateWithCustomUser = `
<table>
\t<tr>
    <td align="center">
        <a href="https://github.com/dolor">
            <img src="lorem" width="100;" alt="dolor"/>
            <br />
            <sub><b>Ipsum</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/x">
            <img src="lorem" width="100;" alt="x"/>
            <br />
            <sub><b>X</b></sub>
        </a>
    </td>
\t</tr>
</table>
`;
