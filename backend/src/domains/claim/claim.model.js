const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Claim extends Model {}
Claim.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    businessType: {
      type: DataTypes.ENUM("standard", "premium"),
      allowNull: false,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Claim",
    tableName: "claims",
    timestamps: true,
  }
);

// associations will be set up by the central loader
Claim.associate = (models) => {
  Claim.belongsTo(models.Business, {
    foreignKey: "businessId",
    as: "business",
    onDelete: "CASCADE",
  });
};

module.exports = Claim;
