const capitalCaseUtil = str => {
    return str.charAt(0).toUpperCase() + str.substring(1);
};

export default str => {
    return str ? str.split(' ').map(capitalCaseUtil).join(' ') : '';
};
