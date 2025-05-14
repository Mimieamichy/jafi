require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op, fn, col} = require("sequelize");
const { sendMail } = require("../../utils/sendEmail");
const {Review, Service, Business, User} = require('../../models/index')


exports.userLogin = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  if (user.role == "reviewer") {
    throw new Error("You are registered as a reviewer, sign in with Google");
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "3d" });
  return { message: "Login successful", token };
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

  return { message: "Token is valid", email: decoded.email };
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
  return { message: "User found", user };
};

exports.getAllUsers = async () => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role"],
    order: [["createdAt", "DESC"]],
  });

  return { message: "Users found", users };
};

exports.updateUser = async (id, data) => {
  // Hash password if it's included
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const [updatedCount] = await User.update(data, {
    where: { id },
  });

  if (updatedCount === 0) {
    throw new Error("User not found or no changes applied");
  }

  // Optionally return the updated user if needed
  const updatedUser = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });

  return {
    message: "User updated successfully",
    user: updatedUser,
  };
};

exports.getUserRole = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const role = user.role;
  return { message: "User role found", role };
};

exports.getAllListings = async (searchTerm, offset, limit, page, filter) => {
  // 1. Build the search clause
  const baseWhere = {
    status: "verified",
    ...(searchTerm && {
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { category: { [Op.like]: `%${searchTerm}%` } },
        { address: { [Op.like]: `%${searchTerm}%` } },
      ]
    })
  };

  // 2. Fetch services and businesses with individual pagination
  const [services, businesses] = await Promise.all([
    Service.findAll({
      where: baseWhere,
      order: [["createdAt", "DESC"]],
      raw: true,
    }),
    Business.findAll({
      where: baseWhere,
      attributes: { exclude: ["proof"] },
      order: [["createdAt", "DESC"]],
      raw: true,
    })
  ]);

  // 3. Get total counts for pagination metadata
  const [serviceCount, businessCount] = await Promise.all([
    Service.count({ where: baseWhere }),
    Business.count({ where: baseWhere })
  ]);

  // 4. Combine results
  const combined = [
    ...services.map(s => ({ type: "service", ...s })),
    ...businesses.map(b => ({ type: "business", ...b }))
  ];

  // 5. Get review counts
  const allIds = [
    ...services.map(s => `ser_${s.id}`),
    ...businesses.map(b => `bus_${b.id}`)
  ];
  
  const reviewCounts = await Review.findAll({
    where: { listingId: { [Op.in]: allIds } },
    attributes: [
      "listingId",
      [fn("COUNT", col("id")), "reviewCount"]
    ],
    group: ["listingId"],
    raw: true,
  });

  const countMap = reviewCounts.reduce((acc, curr) => {
    acc[curr.listingId] = curr.reviewCount;
    return acc;
  }, {});

  // 6. Annotate with review counts and ratings
  const annotated = combined.map(item => ({
    ...item,
    reviewCount: countMap[`${item.type.slice(0, 3)}_${item.id}`] || 0,
    average_rating: parseFloat(item.average_rating || 0)
  }));

  // 7. Apply sorting
  annotated.sort((a, b) => {
    switch (filter) {
      case "highestRated":
        return b.average_rating - a.average_rating;
      case "highestReviewed":
        return b.reviewCount - a.reviewCount;
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "mostRecent":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 7. Apply pagination
  const total = serviceCount + businessCount
  const data = annotated.slice(offset, offset + limit);
  return {
    data,
    meta: { page, limit, total },
  };
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

  return { message: "Reply added successfully", reply };
};


