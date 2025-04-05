const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../user/user.model");


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
      type: DataTypes.STRING,
      allowNull: false,
    },
    listingName: {
      type: DataTypes.STRING,
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

// Relationships
Review.belongsTo(User, { foreignKey: "userId", as: "user" });
Review.belongsTo(Review, { foreignKey: "replyId", as: "reply" });


module.exports = Review;
