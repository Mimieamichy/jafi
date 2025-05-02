// src/domains/payments/payments.model.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Payment extends Model {}
Payment.init({
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
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("processing", "successful", "failed"),
    defaultValue: "processing",
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,           // ← hook it up
  modelName: "Payment",// ← name it
  tableName: "payments",
  timestamps: true,
});

// **No requires here!**  Just define the model.
// Expose an associate hook for your central loader to call later:
Payment.associate = (models) => {
  Payment.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });
  Payment.belongsTo(models.Service, {
    foreignKey: "entity_id",
    as: "ser_entity",
    constraints: false,
    scope: { entity_type: "service" },
  });
  Payment.belongsTo(models.Business, {
    foreignKey: "entity_id",
    as: "bus_entity",
    constraints: false,
    scope: { entity_type: "business" },
  });
};

module.exports = Payment;
