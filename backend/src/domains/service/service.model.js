const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Service extends Model {}
Service.init(
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
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      defaultValue: "pending",
    },
    average_rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    sequelize,
    modelName: "Service",
    tableName: "services",
    timestamps: true,
    hooks: {
      afterCreate: async (service) => {
        if (!service.uniqueId) {
          service.uniqueId = `ser_${service.id}`;
          await service.save();
        }
      },
    },
  }
);

Service.associate = (models) => {
  // Who owns this service
  Service.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });

  // Polymorphic payments
  Service.hasMany(models.Payment, {
    foreignKey: "entity_id",
    constraints: false,
    scope: { entity_type: "service" },
    as: "payments",
  });

  // Polymorphic reviews
  Service.hasMany(models.Review, {
    foreignKey: "listingId",
    constraints: false,
    scope: { listingType: "service" },
    as: "reviews",
  });
};

module.exports = Service;
