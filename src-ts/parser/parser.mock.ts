export const fileContent = `
# Header 1
<!-- cra:start contributors,collaborators,bots,sponsors,akhilmhdh -->
<!-- cra:end -->

## Header 2
<!-- cra:start contributors -->
<!-- cra:end -->
`;

export const fileContentWithTemplate = `
# Header 1
<!-- cra:start contributors,collaborators,bots,sponsors,akhilmhdh -->
<table>
   <thead>
   </thead>
    <tbody>
    </tbody>
</table>
<!-- cra:end -->

## Header 2
<!-- cra:start contributors -->
<!-- cra:end -->
`;

export const fileContentParsed = {
    content: [
        {
            isLine: true,
            line: '# Header 1'
        },
        {
            isLine: false,
            type: ['contributors', 'collaborators', 'bots', 'sponsors', 'akhilmhdh']
        },
        {
            isLine: true,
            line: '<!-- cra:end -->'
        },
        {
            isLine: true,
            line: ''
        },
        {
            isLine: true,
            line: '## Header 2'
        },
        {
            isLine: false,
            type: ['contributors']
        },
        {
            isLine: true,
            line: '<!-- cra:end -->'
        }
    ],
    uniqueKeywords: ['contributors', 'collaborators', 'bots', 'sponsors', 'akhilmhdh']
};
