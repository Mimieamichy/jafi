require("dotenv").config();
const User = require("../user/user.model");
const Business = require("../business/business.model");
const Service = require("../service/service.model");
const AdminSettings = require('./admin.model')
const bcrypt = require("bcryptjs");
const Claim = require("../claim/claim.model");
const {generatePassword} = require("../../utils/generatePassword")
const {sendMail} = require("../../utils/sendEmail")





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
    business.status = "approved"
    const {plainPassword,hashedPassword} = generatePassword()

    await User.update(
      { password: hashedPassword },
      { where: { id: business.userId } }
    );

    await business.save();

    // Send an email notification to the business owner
    const mailContent = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dvmfubqhp/image/upload/v1744291750/jafi_logo_2_png_ktsfqn.png" alt="JAFIAI Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Business Approved - Login Details</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
              Congratulations! Your business has been approved. You can now log in with the details below.
          </p>
          <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 16px; color: #555;">Your password is: <strong>${plainPassword}</strong></p>
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="display: inline-block; padding: 12px 20px; background-color: #5271FF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                 Login Now
              </a>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
              If you did not request this, please contact support.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">
              &copy; 2025 JAFIAI. All rights reserved.
          </p>
          </div>`
    await sendMail(business.email, "JAFI AI Business Approved", mailContent);

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
    const {plainPassword, hashedPassword} = generatePassword()
    await User.update(
      { password: hashedPassword },
      { where: { id: service.userId } }
    );
    
    service.status = "approved";
    await service.save();

    // Send an email notification to the service owner
    const mailContent =  `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dvmfubqhp/image/upload/v1744291750/jafi_logo_2_png_ktsfqn.png" alt="JAFIAI Logo" style="max-width: 150px;">
    </div>
    <h2 style="color: #333; text-align: center;">Service Approved - Login Details</h2>
    <p style="font-size: 16px; color: #555; text-align: center;">
        Your service has been successfully approved. You can log in with the details below.
    </p>
    <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 16px; color: #555;">Your password is: <strong>${plainPassword}</strong></p>
        <a href="${process.env.FRONTEND_URL}/login" 
           style="display: inline-block; padding: 12px 20px; background-color: #5271FF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
           Login Now
        </a>
    </div>
    <p style="font-size: 14px; color: #777777; text-align: center;">
        If you did not request this, please contact support.
    </p>
    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 14px; color: #777; text-align: center;">
        &copy; 2025 JAFIAI. All rights reserved.
    </p>
</div>`
    await sendMail(service.email, "AFI AI Service Approved", mailContent);
    return { message: "Service approved successfully" };
}

exports.getClaim = async (claimId) => {
    const claim = await Claim.findByPk(claimId);
    if (!claim) throw new Error("Claim not found");
}

exports.approveClaim = async (claimId) => {
    const claim = await Claim.findByPk(claimId);
    if (!claim || claim.status !== 'pending' || claim.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Invalid claim approval' });
    }

    const business = await Business.findByPk(claim.businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    // Generate user credentials
    const { plainPassword, hashedPassword } = await generatePassword();
    // Create or update the user (depends on your system)
    const user = await User.update(
      { password: hashedPassword },
      { where: { email: business.email } }
    );
    
    if (updatedCount === 0) {
      throw new Error("User with this email does not exist");
    }
    

    // Update business info
    business.email = claim.email;
    business.phone = claim.phone;
    business.proof = claim.proof;
    business.claim = true;
    business.userId = user.id;
    await business.save();

    // Mark claim approved
    claim.status = 'approved';
    await claim.save();


    // Send an email notification to the CLAIMED business owner
    const mailContent = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dvmfubqhp/image/upload/v1744291750/jafi_logo_2_png_ktsfqn.png" alt="JAFIAI Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Claim Approved - Login Details</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
              Your claim has been approved. You can now log in with the details below.
          </p>
          <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 16px; color: #555;">Your password is: <strong>${plainPassword}</strong></p>
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="display: inline-block; padding: 12px 20px; background-color: #5271ff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                 Login Now
              </a>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
              If you did not request this, please contact support.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">
              &copy; 2025 JAFIAI. All rights reserved.
          </p>
      </div>
    `
    await sendMail(claim.email, "JAFI AI Business Claim Approved", mailContent);

    res.status(200).json({ message: 'Claim approved and business updated', plainPassword });
};