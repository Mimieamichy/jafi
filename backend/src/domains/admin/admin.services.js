require("dotenv").config();
const User = require("../user/user.model");
const Business = require("../business/business.model");
const Service = require("../service/service.model");
const AdminSettings = require('./admin.model')
const Review = require('../review/review.model')
const bcrypt = require("bcryptjs");
const Claim = require("../claim/claim.model");
const { generatePassword } = require("../../utils/generatePassword")
const { sendMail } = require("../../utils/sendEmail");
const Payment = require("../payments/payments.model");




//Users management
exports.createAdmin = async (email, name, role) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error("User already exists");


    const { hashedPassword, plainPassword } = await generatePassword();

    // Create the user
    const newUser = await User.create({ email, password: hashedPassword, role, name });


    const mailContent = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/dvmfubqhp/image/upload/v1744291750/jafi_logo_2_png_ktsfqn.png" alt="JAFIAI Logo" style="max-width: 150px;">
  </div>
  <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
  <p style="font-size: 16px; color: #555; text-align: center;">
      You have been added as an admin for JAFIAI. Use the link to access your account. Your password is: ${plainPassword}
      If you did not request this, you can safely ignore this email.
  </p>
  <div style="text-align: center; margin: 20px 0;">
      <a href="${process.env.FRONTEND_URL}/signin" 
         style="display: inline-block; padding: 12px 20px; background-color: #5271FF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
         Your Account
      </a>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="font-size: 14px; color: #777; text-align: center;">
      &copy; 2025 JAFIAI. All rights reserved.
  </p>
</div>`;

    // Send the generated password via email
    await sendMail(email, "JAFI AI Admin password", mailContent);
    return newUser
}

exports.getAllUsers = async () => {
    const users = await User.findAll();
    if (!users) throw new Error("No users found");
    return users;
}

exports.updateAdminPassword = async (userId, newPassword) => {
    const user = await User.findOne({
        where: {
            id: userId,
            [Op.or]: [{ role: "admin" }, { role: "superadmin" }],
        },
    });


    if (!user) throw new Error("Not an admin");

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await user.update({ password: hashedPassword }, { where: { id: userId } });
    return { message: "Password updated successfully" };
}

exports.deleteUser = async (id) => {
    const user = await User.findOne({ where: { id } });

    if (!user) throw new Error("User not found");

    await Business.destroy({ where: { userId: id } });
    await Service.destroy({ where: { userId: id } });
    await user.destroy();

    return { message: "User and associated business/services deleted successfully" };
};



//Business management
exports.getAllBusinesses = async () => {
    const businesses = await Business.findAll();
    if (!businesses) throw new Error("No businesses found");
    return businesses;
}

exports.approveBusiness = async (businessId) => {
    const business = await Business.findByPk(businessId);
    if (!business) throw new Error("Business not found");

    // Approve the business and assign the user ID
    business.status = "verified"
    await business.save();
    const { plainPassword, hashedPassword } = await generatePassword()


    console.log(plainPassword, hashedPassword)

    await User.update(
        { password: hashedPassword },
        { where: { id: business.userId } }
    );



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
              <a href="${process.env.FRONTEND_URL}/signin" 
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

exports.getABusiness = async (id) => {
    const business = await Business.findOne({
        where: { id },
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'email', 'role'],
            },
            {
                model: Service,
                attributes: ['id', 'name', 'description', 'price', 'duration'],
            },
        ],
    });

    if (!business) throw new Error("Business not found");

    return business;
};

exports.deleteBusiness = async (id) => {
    const business = await Business.findOne({ where: { id } });

    if (!business) return { message: "Business not found" };

    const businessOwner = await User.findOne({ where: { id: business.userId } });

    if (!businessOwner) return { message: "Business owner not found" };

    if (businessOwner.role === 'superadmin' || businessOwner.role === 'admin') {
        return { message: "This business was created by an admin and cannot be deleted" };
    }

    // First delete the business
    await business.destroy();

    // Then optionally delete the user (if you really want to)
    await businessOwner.destroy();

    return { message: "Business and associated user deleted successfully" };
};

exports.addBusiness = async (businessData, userId) => {
    const newBusiness = await Business.create({
        ...businessData,
        userId: userId,
        status: "verified",
        claimed: false,
        proof: "No proof needed"
    });

    return {
        newBusiness
    };
};


exports.getMyBusiness = async (userId) => {
    const business = await Business.findOne({
        where: { userId },
        include: [
            {
                model: User,
                attributes: ["id", "name", "email"],
            },
        ],
    });

    return business;
};

exports.updateMyBusiness = async (businessId, userId, businessData, password, email) => {
    const business = await Business.findByPk(businessId);
    if (!business) throw new Error("Business not found");
  
    if (business.userId !== userId) throw new Error("Unauthorized to update this business");
  
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
  
    // Only hash and update password if it's defined and not empty
    const updatedFields = { email };
  
    if (password && password.trim() !== "") {
      updatedFields.password = await bcrypt.hash(password, 10);
    }
  
    // Update user record
    await User.update(updatedFields, { where: { id: userId } });
  
    // Update business
    business.set(businessData);
    await business.save();
  
    return business;
};
  

exports.getBusinessPrice = async () => {
    const price = await AdminSettings.findOne({ where: { key: 'business_price' }, attributes: ["value"] });
    if (!price) throw new Error("Price not found");
  
    return price;
};





//Service management
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
    const { plainPassword, hashedPassword } = await generatePassword()
    await User.update(
        { password: hashedPassword },
        { where: { id: service.userId } }
    );

    service.status = "verified";
    await service.save();

    // Send an email notification to the service owner
    const mailContent = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
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

exports.deleteService = async (id) => {
    const service = await Service.findOne({ where: { id } });

    if (!service) return { message: "Business not found" };

    const serviceOwner = await User.findOne({ where: { id: service.userId } });

    if (!serviceOwner) return { message: "Business owner not found" };

    if (serviceOwner.role === 'superadmin' || serviceOwner.role === 'admin') {
        return { message: "This service was created by an admin and cannot be deleted" };
    }

    // First delete the service
    await service.destroy();

    // Then optionally delete the user (if you really want to)
    await serviceOwner.destroy();

    return { message: "Service and associated user deleted successfully" };
}

exports.getMyServices = async (userId) => {
    const services = await Service.findAll({
        where: { userId },
        include: [
            {
                model: User,
                attributes: ["id", "name", "email"],
            },
        ],
    });

    return services;
};
exports.updateSevicePrice = async (price) => {
    const setting = await AdminSettings.findOne({ where: { key: "service_price" } });

    if (!setting) {
        // If the setting does not exist, create it
        await AdminSettings.create({ key: "service_price", value: price });
    } else {
        // Update the existing setting
        await setting.update({ value: price });
    }
    return { message: "Service price updated successfully" };
}

exports.getServicePrice = async () => {
    const price = await AdminSettings.findOne({ where: { key: 'service_price' }, attributes: ["value"] });
    if (!price) throw new Error("Price not found");
  
    return price;
};

//Claim management
exports.getClaim = async (claimId) => {
    const claim = await Claim.findByPk(claimId);
    if (!claim) throw new Error("Claim not found");
    return claim;
}

exports.getClaims = async () => {
    const claims = await Claim.findAll();
    return claims;
}

exports.approveClaim = async (claimId) => {
    console.log(claimId);
    const claim = await Claim.findByPk(claimId);
    
    if (!claim || claim.status !== 'pending') {
        return { message: 'Invalid claim approval' }
    }

    const business = await Business.findByPk(claim.businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    // Generate user credentials
    const { plainPassword, hashedPassword } = await generatePassword();
    // Create or update the user (depends on your system)
    await User.update(
        { password: hashedPassword },
        { where: { email: claim.email } }
    );
      
    const updatedUser = await User.findOne({ where: { email: claim.email } });

    // Update business info
    business.email = claim.email;
    business.phone_number1 = claim.phone;
    business.proof = claim.proof;
    business.claimed = true;
    business.userId = updatedUser.id;
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

    return { message: 'Claim approved and business updated', plainPassword };
};


//Review management

exports.getAllReviews = async () => {
    const reviews = await Review.findAll({
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'email', 'role'],
            },
        ],
    });

    if (!reviews) throw new Error("Reviews not found");

    return reviews;
};

exports.getAllReviewers = async () => {
    const users = await User.findAll({ where: { role: 'reviewer' } });
    if (!users) throw new Error("No users found");
    return users;
}

exports.deleteReviews = async (id) => {
    const reviews = await Review.findAll({ where: { id } });

    if (!reviews) throw new Error("Reviews not found");

    await reviews.destroy();

    return { message: "Reviews deleted successfully" };
};

exports.deleteReviewer = async (id) => {
    const reviewer = await User.findOne({ where: { id } });

    if (!reviewer && reviewer.role !== 'reviewer') return { message: "Reviewer not found" };
    await reviewer.destroy();

    return { message: "Reviewer deleted successfully" };
};


//Transaction management{check in payments service}








