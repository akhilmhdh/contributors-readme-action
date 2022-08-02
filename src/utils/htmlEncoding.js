export const htmlEncoding = string => {
    return String(string).replace(/>/g, '&gt;').replace(/</g, '&lt;');
};
