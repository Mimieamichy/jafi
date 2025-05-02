const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

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

// Defer associations until all models are loaded
Review.associate = (models) => {
  // A review belongs to the user who wrote it
  Review.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });

  // Polymorphic business review
  Review.belongsTo(models.Business, {
    foreignKey: "listingId",
    targetKey: "uniqueId",
    constraints: false,
    scope: { listingType: "business" },
    as: "business",
  });

  // Polymorphic service review
  Review.belongsTo(models.Service, {
    foreignKey: "listingId",
    targetKey: "uniqueId",
    constraints: false,
    scope: { listingType: "service" },
    as: "service",
  });
};

module.exports = Review;
