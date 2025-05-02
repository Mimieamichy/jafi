// src/domains/user/user.model.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("business", "service", "reviewer", "admin", "superadmin"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

User.associate = (models) => {
  // A user can own many businesses
  User.hasMany(models.Business, {
    foreignKey: "userId",
    as: "businesses",
    onDelete: "CASCADE",
  });

  // A user can own many services
  User.hasMany(models.Service, {
    foreignKey: "userId",
    as: "services",
    onDelete: "CASCADE",
  });

  // A user can have many payments
  User.hasMany(models.Payment, {
    foreignKey: "userId",
    as: "payments",
    onDelete: "CASCADE",
  });

  // A user can write many reviews
  User.hasMany(models.Review, {
    foreignKey: "userId",
    as: "reviews",
    onDelete: "CASCADE",
  });

  // A user can have multiple OTP entries
  User.hasMany(models.OTP, {
    foreignKey: "userId",
    as: "otps",
    onDelete: "CASCADE",
  });
};

module.exports = User;
