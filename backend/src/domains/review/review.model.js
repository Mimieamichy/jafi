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
      primaryKey: true,
      allowNull: false,
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
      type: DataTypes.INTEGER,
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
    star_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    replyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "reviews",
        key: "id",
      },
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);


Review.belongsTo(User, {
  foreignKey: "userId",
})
Review.belongsTo(Business, {
  foreignKey: "listingId",
});
Review.belongsTo(Service, {
  foreignKey: "listingId",
});

module.exports = Review;