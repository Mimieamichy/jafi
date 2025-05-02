const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class OTP extends Model {}
OTP.init(
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
        model: 'users', 
        key: 'id',
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    purpose: {
      type: DataTypes.ENUM(
        'phone_verification',
        'password_reset',
        'account_recovery',
        'login'
      ),
      defaultValue: 'phone_verification',
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 3,
      },
    },
  },
  {
    sequelize,
    modelName: "OTP",
    tableName: "otps",
    timestamps: true,
  }
);

// Define associations via associate hook
OTP.associate = (models) => {
  OTP.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });
};

module.exports = OTP;
