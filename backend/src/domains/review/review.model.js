const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../user/user.model");
const Business = require("../business/business.model");
const Service = require("../service/service.model");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    listingId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    listingName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    listingType: {
      type: DataTypes.ENUM("business", "service"),
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    star_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    reply: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);


Review.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE"
})


Review.belongsTo(Business, {
  foreignKey: "listingId",
  targetKey: "uniqueId", // This tells Sequelize which column in Business to match
  constraints: false,
  scope: {
    listingType: "business"
  }
});

Review.belongsTo(Service, {
  foreignKey: "listingId",
  targetKey: "uniqueId", // This tells Sequelize which column in Service to match
  constraints: false,
  scope: {
    listingType: "service"
  }
});

module.exports = Review;