const { Sequelize } = require("sequelize");

require("dotenv").config();

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//   host: process.env.DB_HOST,
//   dialect: "mysql",
//   logging: false,
// });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Railway
    },
  },
});


(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Drop all tables in the database
    // sequelize.query('ALTER TABLE `businesses` MODIFY `day` JSON;')
    // .then(() => console.log('Day column changed to JSON type'))
    // .catch((error) => console.error('Error changing day column type:', error));

  } catch (error) {
    console.error("Database connection error:", error);
  }
})();


module.exports = sequelize;
