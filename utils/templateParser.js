// to convert given html template to an object
// to reuse the old data for efficiency

exports.parser = function (str) {
    // regex to parse into an array of three each with url userid and name
    // ntg to match will result in null
    let parsedKeys = str.match(/src="([\s\S]*?)"|alt="([\s\S]*?)"|<b>([\s\S]*?)<\/b>/gm);
    if (!parsedKeys) return {};

    let data = {};

    for (let i = 0; i < parsedKeys.length; i = i + 3) {
        let url = parsedKeys[i].substring(5, parsedKeys[i].length - 1);
        let userid = parsedKeys[i + 1].substring(5, parsedKeys[i + 1].length - 1);
        let name = parsedKeys[i + 2].substring(3, parsedKeys[i + 2].length - 4);
        data[userid] = { url, name };
    }

    return data;
};
