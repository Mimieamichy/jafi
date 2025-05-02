// src/domains/admin/admin.model.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class AdminSettings extends Model {}
AdminSettings.init(
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
    sequelize,
    modelName: "AdminSettings",
    tableName: "admin_settings",
    timestamps: true,
  }
);

// no associations for this one, but stub it so the loader won’t break
AdminSettings.associate = (models) => {
  // e.g. models.AdminSettings.hasMany(models.Other)…
};

module.exports = AdminSettings;
