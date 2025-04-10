const User = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Service = require("../service/service.model");
const Business = require("../business/business.model");
const { Op } = require('sequelize');
const { assign } = require("nodemailer/lib/shared");



exports.userLogin = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  if (user.role == 'reviewer') {
    throw new Error("You are registered as a reviewer, sign in with Google");
  }

  return jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "3d" });
};


exports.userForgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });


  const mailContent = ``
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


exports.getUserRole = async (email) => {
  const user = await User.findAll({ where: { email } });
  if (!user) throw new Error("User not found");

  return user.role
}


exports.getAllListings = async (searchTerm) => {
    let searchFilter = {};

    // If searchTerm is provided, add the filter conditions for both services and businesses
    if (searchTerm) {
        searchFilter = {
            [Op.or]: [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { category: { [Op.like]: `%${searchTerm}%` } },
            ],
        };
    }

    // Fetch services with the optional search filter
    const services = await Service.findAll({
        where: searchTerm ? searchFilter : {}, // Apply the filter if searchTerm exists
        order: [['createdAt', 'DESC']],
    });

    // Fetch businesses with the optional search filter
    const businesses = await Business.findAll({
      where: searchTerm ? searchFilter : {},
      attributes: { exclude: ['proof'] },
      order: [['createdAt', 'DESC']],
    });
    
    
    //Combine both services and businesses into one list
    const combined = [
        ...services.map(service => ({ type: 'service', ...service.toJSON() })),
        ...businesses.map(business => ({ type: 'business', ...business.toJSON() }))
    ];

    // Sort the combined list by creation date (descending)
    const allListings = combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return allListings;
};



