const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Service = require("../service/service.model");
const User = require("../user/user.model");
const Business = require("../business/business.model");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.ENUM("business", "service", "claim"),
      allowNull: false,
    },
    amount: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM("processing", "successful", "failed"), 
      defaultValue: "processing" 
    },
    payment_reference: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
  },
  { 
    tableName: "payments", 
    timestamps: true 
  }
);

// Standard associations – note the constraints: false to disable foreign key enforcement
Payment.belongsTo(User, { foreignKey: "userId", as: "user" });
Payment.belongsTo(Service, { foreignKey: "entity_id", as: "ser_entity", constraints: false });
Payment.belongsTo(Business, { foreignKey: "entity_id", as: "bus_entity", constraints: false });

module.exports = Payment;
