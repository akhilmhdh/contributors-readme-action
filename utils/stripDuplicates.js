// function to clean an array of objects duplicates
exports.clean = function (arr, key) {
    const unqiue = {};
    const uniqueArray = [];
    for (let index = 0; index < arr.length; index++) {
        const value = arr[index];
        if (!unqiue[value[key]]) {
            unqiue[value[key]] = true;
            uniqueArray.push(value);
        }
    }
    return uniqueArray;
};
