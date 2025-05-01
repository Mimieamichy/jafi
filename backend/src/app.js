const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const passport = require('./config/passport');
const path = require('path');
const sequelize = require("./config/database");


const app_url = process.env.APP_URL || "/api/v1";
const app = express();

// ✅ Proper CORS configuration applied globally
app.use(cors({
  origin: ['http://localhost:5173', 'https://jafiai.vercel.app', 'https://jafi-0fve.onrender.com'],
  credentials: true,
}));

// Security Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting (change max back to 100 in production)
const limiter = rateLimit({ windowMs: 15 * 60 * 100, max: 100 });
app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Middlewares
const { errorHandler } = require("./application/middlewares/errorHandler");
const { DocumentDownloader } = require("./utils/downloadPOB");

// Routes
const serviceRoutes = require("./domains/service/service.routes");
const userRoutes = require("./domains/user/user.routes");
const otpRoutes = require("./domains/otp/otp.routes");
const reviewRoutes = require("./domains/review/review.routes");
const businessRoutes = require("./domains/business/business.routes");
const claimRoutes = require("./domains/claim/claim.routes");
const adminRoutes = require("./domains/admin/admin.routes");
const paymentsRoutes = require("./domains/payments/payments.route");

app.use(`${app_url}/service`, serviceRoutes);
app.use(`${app_url}/user`, userRoutes);
app.use(`${app_url}/otp`, otpRoutes);
app.use(`${app_url}/review`, reviewRoutes);
app.use(`${app_url}/business`, businessRoutes);
app.use(`${app_url}/claim`, claimRoutes);
app.use(`${app_url}/admin`, adminRoutes);
app.use(`${app_url}/payment`, paymentsRoutes);


app.use(`${app_url}/download/:filename`,  DocumentDownloader);

// Error Handling Middleware
app.use(errorHandler);


const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully") 

    } catch (error) {
      console.error("Database connection error:", error);
    }
}

module.exports = {app, connectDb};



// const apicache = require('apicache');
// const cache = apicache.middleware;

// app.use(`${app_url}/business`, cache('5 minutes'), businessRoutes);
