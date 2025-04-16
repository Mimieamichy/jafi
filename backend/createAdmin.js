// scripts/createSuperAdmin.js
const readline = require("readline");
const bcrypt = require("bcryptjs");
const User  = require("./src/domains/user/user.model")
const sequelize = require("./src/config/database")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Optional: ensure tables exist

    const email = await askQuestion("Enter superadmin email: ");
    const name = await askQuestion("Enter name: ");
    const password = await askQuestion("Enter password: ");

    const existing = await User.findOne({
      where: { email, role: "superadmin" },
    });

    if (existing) {
      console.log("Superadmin already exists with this email.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newSuperAdmin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "superadmin",
      });

      console.log("✅ Superadmin created:", newSuperAdmin.email, newSuperAdmin.password, newSuperAdmin.hashedPassword);
    }
  } catch (err) {
    console.error("❌ Error creating superadmin:", err.message);
  } finally {
    rl.close();
    process.exit();
  }
})();
