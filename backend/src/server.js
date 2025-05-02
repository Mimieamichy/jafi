require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");


const PORT = process.env.PORT || 4000;


const start = async() => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync({ alter: true })
    app.listen(PORT)
    console.log(`Server running on port ${PORT} and Database connected successfully`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); 
  }
};

start()
