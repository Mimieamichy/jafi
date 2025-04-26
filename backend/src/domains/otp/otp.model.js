const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../user/user.model");

const OTP = sequelize.define(
    "OTP",
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
                max: 3, // Maximum 3 attempts
            },
        },
    },
    {
        tableName: "otps",
    }
);

OTP.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });


module.exports = OTP;
