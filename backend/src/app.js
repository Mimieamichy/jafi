const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const passport = require('./config/passport')
const app_url = process.env.APP_URL || "/api/v1";

const app = express();


//middlewares
const { errorHandler } = require("./application/middlewares/errorHandler");


// Security Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// Rate Limiting (chnage back to 100 on production)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100});
//app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Serve static frontend files
app.use(cors({
    origin: ['https://jafiai.vercel.app', 'http://localhost:5173'],
    credentials: true,
}))


// Routes
const serviceRoutes = require("./domains/service/service.routes");
const userRoutes = require("./domains/user/user.routes");
const otpRoutes = require("./domains/otp/otp.routes");
const reviewRoutes = require("./domains/review/review.routes");
const businessRoutes = require("./domains/business/business.routes")
const claimRoutes = require("./domains/claim/claim.routes")
const adminRoutes = require("./domains/admin/admin.routes");



app.use(`${app_url}/service`, serviceRoutes);
app.use(`${app_url}/user`, userRoutes);
app.use(`${app_url}/otp`, otpRoutes);
app.use(`${app_url}/review`, reviewRoutes);
app.use(`${app_url}/business`, businessRoutes);
app.use(`${app_url}/claim`, claimRoutes);
app.use(`${app_url}/admin`, adminRoutes);



// Error Handling Middleware
app.use(errorHandler);

module.exports = app;