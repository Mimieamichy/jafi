const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AdminSettings = sequelize.define(
  "AdminSettings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "AdminSettings",
    timestamps: true,
  }
);

module.exports = AdminSettings;
