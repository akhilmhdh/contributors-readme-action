function capitalCaseUtil(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

exports.toCapitalCase = function (str) {
    return str ? str.split(" ").map(capitalCaseUtil).join(" ") : "";
};
