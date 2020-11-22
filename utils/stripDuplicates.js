/**
 * function to clean an array of objects duplicates
 * @param {Array} - arr - array of objects
 * @param {string} - key - key to compare
 */
export default (arr, key) => {
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
