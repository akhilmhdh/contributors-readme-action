/**
 * function to clean an array of objects with duplicates
 */
export const stripDuplicates = <T extends Record<string, unknown>>(arr: T[], key: keyof T): T[] => {
    // if either array or key is null
    if (!arr || !key) return [];

    const hasSeen: Record<string, boolean> = {};
    const uniqueArray: T[] = [];

    arr.forEach(el => {
        if (!hasSeen?.[el[key] as string]) {
            hasSeen[el[key] as string] = true;
            uniqueArray.push(el);
        }
    });

    return uniqueArray;
};
