const Sequelize = require("sequelize");
const sequelize = require("../config/database");

// Import your domain models
const User          = require("../domains/user/user.model");
const Business      = require("../domains/business/business.model");
const Service       = require("../domains/service/service.model");
const Payment       = require("../domains/payments/payments.model");
const Review        = require("../domains/review/review.model");
const AdminSettings = require("../domains/admin/admin.model");
const OTP           = require("../domains/otp/otp.model");
const Claim         = require("../domains/claim/claim.model");

const db = {
  sequelize,
  Sequelize,
  User,
  Business,
  Service,
  Payment,
  Review,
  AdminSettings,
  OTP,
  Claim,
};

// Run each model's associate() (if defined) to wire up relationships
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

module.exports = db;
