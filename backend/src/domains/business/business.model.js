const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../user/user.model");

const Business = sequelize.define(
  "Business",
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
      references: {
        model: "users", // Reference to the 'users' table
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    phone_number1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Hotel",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    whatsApp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    x: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tiktok: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessType: {
      type: DataTypes.ENUM("standard", "premium"),
      allowNull: false,
    },
    day: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    start: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      defaultValue: "pending",
    },
    average_rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    faqs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    claimed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "businesses",
    timestamps: true,
    hooks: {
      afterCreate: async (business) => {
        if (!business.uniqueId) {
          business.uniqueId = `bus_${business.id}`;
          await business.save();
        }
      },
    },
  }
);


Business.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = Business;
