require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5173;


// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Handle all unknown routes by serving index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
