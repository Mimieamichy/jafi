const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const passport = require('./config/passport')


const app = express();


//middlewares
const {errorHandler} = require("./application/middlewares/errorHandler");


// Security Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());



// Routes
const serviceRoutes = require("./domains/service/service.routes");
const userRoutes = require("./domains/user/user.routes");
const otpRoutes = require("./domains/otp/otp.routes");
const reviewRoutes = require("./domains/review/review.routes");




app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/review", reviewRoutes);







app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Jafi API 🚀",
        status: "200",
        documentation: "https://api.example.com/docs",
    });
});


// Error Handling Middleware
app.use(errorHandler);

module.exports = app;