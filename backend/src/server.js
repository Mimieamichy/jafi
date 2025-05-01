require("dotenv").config();
const {app, connectDb} = require("./app");


const PORT = process.env.PORT || 4000;


app.listen(PORT, async() => {
  await connectDb()
  console.log(`Server running on port ${PORT}`);
});
