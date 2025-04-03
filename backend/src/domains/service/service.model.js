const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../user/user.model");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uniqueId: {
      type: DataTypes.STRING, 
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "services",
    timestamps: true,
  hooks: {
      afterCreate: async (service) => {
        if (!service.uniqueId) {
          service.uniqueId = `ser_${service.id}`;
          await service.save();
        }
      },
    },
  },
);

Service.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = Service;
