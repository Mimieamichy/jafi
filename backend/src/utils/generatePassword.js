const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.generatePassword = async () => {
  const plainPassword = crypto.randomBytes(6).toString("hex");
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  return { plainPassword, hashedPassword };
};
