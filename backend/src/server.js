require("dotenv").config();
const {app, connectDb} = require("./app");


const PORT = process.env.PORT || 4000;


app.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); 
  }
});
