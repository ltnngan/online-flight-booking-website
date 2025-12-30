const determineAgeGroup = (dob) => {
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 12) return "Child";
    return "Adult";
};

module.exports = { determineAgeGroup }