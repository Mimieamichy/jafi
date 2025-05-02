const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Business = require("../business/business.model");

const Claim = sequelize.define("Claim", {
id: {
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
},
businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
},
businessType: {
    type: DataTypes.ENUM("standard", "premium"),
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
    type: DataTypes.STRING, // store as file path or URL
    allowNull: false,
},
transactionId: {
    type: DataTypes.STRING,
    allowNull: true, 
    references: {
      model: 'payments', 
      key: 'payment_reference',
    }
},
status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
},
},
{ 
    tableName: "claims", 
    timestamps: true 
});

Claim.belongsTo(Business, {
  foreignKey: "businessId",
});

module.exports = Claim;
