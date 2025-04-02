const User = require("../user/user.model");
const Business = require("../business/business.model");
const Service = require("../service/service.model");
const Review = require("../review/review.model"); 
const AdminSettings = require('./admin.model')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


//send email function
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    
      const mailOptions = {
        to: to,
        from: process.env.GMAIL_USER,
        subject: subject,
        html: text,
      };
    
      await transporter.sendMail(mailOptions);

    }

exports.createUser = async (email, name, role) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    // Generate a random password
    const password = Math.random().toString(36).slice(-8);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({ email, password: hashedPassword, role, name });

    // Send the generated password via email
    await sendEmail(email, "JAFI AI Admin password", "Your Account Password", `Your password is: ${password}`);
    return newUser
}


exports.getAllUsers = async () => {
    const users = await User.findAll();
    if (!users) throw new Error("No users found");
    return users;
}


exports.updateUserPassword = async (userId, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await user.update({ password: hashedPassword }, { where: { id: userId } });
    return { message: "Password updated successfully" };
}


exports.getAllBusinesses = async () => {
    const businesses = await Business.findAll();
    if (!businesses) throw new Error("No businesses found");
    return businesses;
}


exports.approveBusiness = async (businessId) => {  
    const business = await Business.findByPk(businessId);
    if (!business) throw new Error("Business not found");

    // Approve the business and assign the user ID
    business.status = "approved";
    const user = await User.findByPk(business.userId);
    if (user) {
      business.userId = user.id;  // Re-assign userId after approval
    }

    await business.save();

    // Send an email notification to the business owner
    await sendEmail(user.email, "JAFI AI Business Approved", "Your Business is Approved", "Congratulations! Your business is approved.");

}

exports.updateBusinessPrice = async (price) => {
    const setting = await AdminSettings.findOne({ where: { key: "business_price" } });

  if (!setting) {
    // If the setting does not exist, create it
    await AdminSettings.create({ key: "business_price", value: price });
  } else {
    // Update the existing setting
    await setting.update({ value: price });
  }
    return { message: "Business price updated successfully" };
}

exports.getAllServices = async () => {
    const services = await Service.findAll();
    if (!services) throw new Error("No services found");
    return services;
}

exports.getAService = async (serviceId) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error("Service not found");
    return service;
}

exports.approveAService = async (serviceId) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error("Service not found");

    // Approve the service
    service.status = "approved";
    await service.save();

    // Send an email notification to the service owner
    await sendEmail(service.email, "JAFI AI Service Approved", "Your Service is Approved", "Congratulations! Your service is approved.");
}