const User = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");




exports.userLogin = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  return jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "3d" });
};


exports.userForgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });


  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    host: "smtp@gmai.com",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  const mailOptions = {
    to: email,
    subject: "Jafi App Password Reset",
    text: `Use this token to reset your password: ${resetToken}`,
  };

  await transporter.sendMail(mailOptions);

  return { message: "Reset token sent to email" };
};


exports.verifyResetToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.email) {
    throw new Error("Invalid or expired token");
  }

  return decoded.email;

};

exports.userResetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ where: { email: decoded.email } });

  if (!user) throw new Error("Invalid or expired token");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password reset successful" };
}

exports.getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  return user;
};

exports.getAllUsers = async () => {
  const users = await User.findAll();
  return users;
}

exports.updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await user.update(data);
  return user;
}


exports.getUserRole = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  return user.role
}

