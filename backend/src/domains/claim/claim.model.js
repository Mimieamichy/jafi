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
status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
},
paymentStatus: {
    type: DataTypes.ENUM("unpaid", "paid"),
    defaultValue: "unpaid",
},
});

Claim.belongsTo(Business, {
  foreignKey: "businessId",
});

module.exports = Claim;
