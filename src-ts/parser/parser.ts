/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export type TKeyword = 'contributor' | 'collaborators' | 'sponsors' | 'bots' | string;

type TParserLine = {
    isLine: true;
    line: string;
};

export type TParserKeyword = {
    isLine: false;
    type: TKeyword[];
};

export type TParser = {
    content: Array<TParserLine | TParserKeyword>;
    uniqueKeywords: TKeyword[];
};

const COMMENT_SIGNATURE_START = 'cra:start';
const COMMENT_SIGNATURE_END = 'cra:end';

export const parser = (fileContent: string): TParser => {
    const uniqueKeywords: Record<TKeyword, boolean> = {};
    let oldTemplateLine = false;

    const content: TParser['content'] = fileContent
        .trim()
        .split('\n')
        .flatMap(line => {
            if (isComment(line)) {
                if (line.includes(COMMENT_SIGNATURE_START)) {
                    const keywords = getKeywords(line);
                    // spot unique keywords
                    keywords.forEach(word => (uniqueKeywords[word] = true));
                    // set flag to indicate its action run content
                    oldTemplateLine = true;
                    return { isLine: false, type: keywords };
                }
                if (line.includes(COMMENT_SIGNATURE_END)) {
                    // set false flag to find note end of cra comment
                    oldTemplateLine = false;
                    return { isLine: true, line };
                }
            }

            if (oldTemplateLine) return [];

            return { isLine: true, line };
        });

    return { content, uniqueKeywords: Object.keys(uniqueKeywords) };
};

const isComment = (line: string): boolean => {
    if (line.length > 3) {
        return line.slice(0, 4) === '<!--';
    }

    return false;
};

// const isWhitespace = (ch: string): boolean =>
//     ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';

const getKeywords = (line: string): string[] => {
    const keywords = line
        .slice(
            line.indexOf(COMMENT_SIGNATURE_START) + COMMENT_SIGNATURE_START.length,
            line.length - 3
        )
        .trim()
        .split(',');

    return keywords;
};
