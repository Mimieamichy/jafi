const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../user/user.model");

const Business = sequelize.define(
    "Business",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        uniqueId: {
            type: DataTypes.STRING,
            unique: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tagline: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        phone_number1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone_number2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.ENUM(
                "Automotives",
                "Hotel",
                "Healthcare",
                "Groceries",
                "Malls & Supermarket",
                "Banking & FinTech",
                "Churches",
                "Aircraft",
                "Nigerian Made",
                "Nightlife & Entertainment"
            ),
            allowNull: false,
            defaultValue: "Hotel",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tags: {
            type: DataTypes.STRING, // Comma-separated values
            allowNull: true,
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        featured_images: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        social_links: {
            type: DataTypes.JSON, // Store Twitter, Facebook, LinkedIn, etc., as an object
            allowNull: true,
        },
        whatsapp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        businessType: {
            type: DataTypes.ENUM("standard", "exclusive"),
            allowNull: false,
            defaultValue: "standard",
        },
        day: {
            type: DataTypes.ENUM(
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ),
            allowNull: false,
        },
        start: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        end: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "verified", "rejected"),
            defaultValue: "pending",
        },
    },
    {
        tableName: "businesses",
        timestamps: true,
        hooks: {
            beforeCreate: async (business) => {
                business.uniqueId = `bus_${business.id}`;
            },
            beforeSave: async (business) => {
                if (!business.uniqueId) {
                    business.uniqueId = `bus_${business.id}`;
                }
            },
        },
    }
);

// Relationships
Business.belongsTo(User, { foreignKey: "userId" });

module.exports = Business;
