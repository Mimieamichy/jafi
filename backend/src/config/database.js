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

    // Create tables if they don't exist
    // try {
    //   await sequelize.query('ALTER TABLE `services` DROP COLUMN `password`')
    //   console.log("Tables created successfully");
    // } catch (error) {
    //   console.log(error)
    //   console.log("Error creating tables:");
      
    // }
    

    } catch (error) {
      console.error("Database connection error:", error);
    }
  })()   


module.exports = sequelize;
