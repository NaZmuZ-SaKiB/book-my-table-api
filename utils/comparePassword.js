const bcrypt = require("bcryptjs");

const comparePassword = (pass, hashedPass) =>
  bcrypt.compareSync(pass, hashedPass);

module.exports = comparePassword;
