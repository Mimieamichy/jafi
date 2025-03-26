const User = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.userLogin = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  return jwt.sign({ id: user.id, role: user.role}, process.env.JWT_SECRET, { expiresIn: "1h" });
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


exports.userResetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ where: { email: decoded.email } });

  if (!user) throw new Error("Invalid or expired token");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password reset successful" };
}



exports.userGoogleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email, name } = ticket.getPayload();

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ name, email, password: null }); 
  }

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
