require("dotenv").config();
const User = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Service = require("../service/service.model");
const Business = require("../business/business.model");
const { Op } = require("sequelize");
const { sendMail } = require("../../utils/sendEmail");
const Review = require("../review/review.model");

exports.userLogin = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  if (user.role == "reviewer") {
    throw new Error("You are registered as a reviewer, sign in with Google");
  }

  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );
};

exports.userForgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const mailContent = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dvmfubqhp/image/upload/v1744291750/jafi_logo_2_png_ktsfqn.png" alt="JAFIAI Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
              We received a request to reset your password. Click the button below to set a new password.  
              If you did not request this, you can safely ignore this email.
          </p>
          <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.BACKEND_URL}/user/reset-password/${resetToken}" 
                 style="display: inline-block; padding: 12px 20px; background-color: #5271FF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                 Reset Password
              </a>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
              This link is valid for 15 minutes. If you need further assistance, please contact our support team.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">
              &copy; 2025 JAFIAI. All rights reserved.
          </p>
      </div>`;
  await sendMail(user.email, "JAFI AI Reset Password", mailContent);
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
};

exports.getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  return user;
};

exports.getAllUsers = async (offset, limit) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role"],
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  return users; 
};

exports.updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await user.update(data);
  return user;
};

exports.getUserRole = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  return user.role;
};

exports.getAllListings = async (searchTerm, offset, limit) => {
  let searchFilter = {};
  if (searchTerm) {
    searchFilter = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { category: { [Op.like]: `%${searchTerm}%` } },
        { address: { [Op.like]: `%${searchTerm}%` } },
      ],
    };
  }

  const services = await Service.findAll({
    where: searchFilter,
    order: [["createdAt", "DESC"]],
  });

  const businesses = await Business.findAll({
    where: searchFilter,
    attributes: { exclude: ["proof"] },
    order: [["createdAt", "DESC"]],
  });

  const combined = [
    ...services.map((service) => ({ type: "service", ...service.toJSON() })),
    ...businesses.map((business) => ({
      type: "business",
      ...business.toJSON(),
    })),
  ];

  if (!combined.length) {
    return { message: "No listings found for the provided search term." };
  }

  const sortedListings = combined.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const allListings = sortedListings.slice(offset, offset + limit);

  return allListings
};


exports.replyToReview = async (reviewId, userId, comment) => {
  const originalReview = await Review.findByPk(reviewId);

  if (!originalReview) throw new Error("Original review not found");

  const business = await Business.findOne({
    where: { uniqueId: originalReview.listingId },
  });

  const service = await Service.findOne({
    where: { uniqueId: originalReview.listingId },
  });

  let owner = "";
  if (business) {
    owner = business.userId;
  } else if (service) {
    owner = service.userId;
  } else {
    throw new Error("Invalid listing type");
  }

  if (owner != userId) {
    throw new Error("You are not authorized to reply to this review");
  }
  const reply = await Review.update(
    { reply: comment },
    {
      where: {
        id: reviewId,
        listingId: originalReview.listingId,
      },
    }
  );

  return reply;
};


