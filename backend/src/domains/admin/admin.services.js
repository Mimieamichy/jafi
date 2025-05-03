require("dotenv").config();
const bcrypt = require("bcryptjs");
const { generatePassword } = require("../../utils/generatePassword")
const { sendMail } = require("../../utils/sendEmail");
const { Op } = require('sequelize');
const { exportTableData } = require("../../utils/exports");
const {User, Business, Service, Review, AdminSettings, Claim, Payment } = require("../../models/index");




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
  <h2 style="color: #333; text-align: center;">Login with your Password</h2>
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

exports.getAllUsers = async (role, offset, limit, page) => {
    // If a specific role is provided, filter by that role
    const whereClause = role ? { role } : {};

    const { count, rows: allUsers } = await User.findAndCountAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "name", "email", "role", "createdAt"],
        offset,
        limit
    });
    // Process users to add business info or service count based on role
    const processedUsers = await Promise.all(allUsers.map(async user => {
        const userData = user.toJSON();

        // For business, admin, or superadmin roles, get associated business
        if (['business', 'admin', 'superadmin'].includes(userData.role)) {
            const businessCount = await Business.count({
                where: { userId: userData.id }
            })
            userData.count = businessCount
        }
        // For service role, get the service count
        else if (userData.role === 'service') {
            const serviceCount = await Service.count({
                where: { userId: userData.id }
            });
            userData.count = serviceCount;
        }
        // For other roles, set defaults
        else {
            userData.count = 0;
        }

        return userData;
    }));
    const users = processedUsers;
    return {
        data: users, meta: { page, limit, total: count }
    };
};

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

exports.transferBusiness = async (userId, email) => {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const newOwner = await User.findOne({ where: { email } });
    const ownerId = newOwner.id
    if (!newOwner) throw new Error("New owner email not found.");

    // Transfer ownership of businesses
    await Business.update(
        { userId: ownerId },
        { where: { userId } }
    );
    // await Service.destroy({ where: { userId: ownerId } });
    // await OTP.destroy({ where: { userId: ownerId } });
    // await Review.destroy({ where: { userId: ownerId } });
    await user.destroy();

    return { message: "Business ownership transferred successfully" };

}


exports.deleteUser = async (id) => {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new Error("User not found");

    await Business.destroy({ where: { userId: id } });
    // await Service.destroy({ where: { userId: id } });
    // await OTP.destroy({ where: { userId: id } });
    // await Review.destroy({ where: { userId: id } });
    await user.destroy()


    return { message: "User deleted successfully" };
};

exports.getAdminCount = async () => {
    const adminCount = await User.count({ where: { role: "admin" } });
    const superAdminCount = await User.count({ where: { role: "superadmin" } });
    return { message: "Admin count retrieved successfully", adminCount, superAdminCount };
};



//Business management
exports.getAllBusinesses = async (offset, limit, page) => {
    const { count, rows } = await Business.findAndCountAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Payment,
            as: 'payments',
            attributes: ["status"],
            where: { status: "successful" },
            required: true, 
          },
        ],
        order: [["createdAt", "DESC"]],
        offset,
        limit,
      });
      

    if (count === 0) {
        return { message: "No businesses found", data: null,
            meta: { page, limit, total: count }};
    }

    return {
        data: rows, meta: { page, limit, total: count }
    };
};

exports.approveBusiness = async (businessId) => {
    const business = await Business.findByPk(businessId);
    if (!business) throw new Error("Business not found");

    // Approve the business and assign the user ID
    await Business.update({ status: "verified" }, { where: { id: businessId } });
    const { plainPassword, hashedPassword } = await generatePassword()


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

exports.updateBusinessPremium = async (price) => {
    const setting = await AdminSettings.findOne({ where: { key: "premium_price" } });

    if (!setting) {
        // If the setting does not exist, create it
        await AdminSettings.create({ key: "premium_price", value: price });
    } else {
        // Update the existing setting
        await setting.update({ value: price });
    }
    return { message: "Business Premium price updated successfully" };
}

exports.updateBusinessStandard = async (price) => {
    const setting = await AdminSettings.findOne({ where: { key: "standard_price" } });

    if (!setting) {
        // If the setting does not exist, create it
        await AdminSettings.create({ key: "standard_price", value: price });
    } else {
        // Update the existing setting
        await setting.update({ value: price });
    }
    return { message: "Business Standard price updated successfully" };
}

exports.getABusiness = async (id) => {
    const business = await Business.findOne({
        where: { id },
        include: [
            {
                model: User,
                as: 'user',
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

exports.getMyBusiness = async (userId, offset, limit, page) => {
    const { count, rows } = await Business.findAndCountAll({
        where: { userId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ["id", "name", "email"],
            },
        ],
        order: [["createdAt", "DESC"]],
        offset,
        limit
    });

    return {
        data: rows, meta: { page, limit, total: count }
    };
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

exports.getPremiumPrice = async () => {
    const price = await AdminSettings.findOne({ where: { key: 'premium_price' }, attributes: ["value"] });
    if (!price) throw new Error("Price not found");

    return price;
};

exports.getStandardPrice = async () => {
    const price = await AdminSettings.findOne({ where: { key: 'standard_price' }, attributes: ["value"] });
    if (!price) throw new Error("Price not found");

    return price;
};

exports.addCategory = async (categoryName, type) => {
    // Ensure the type is either 'standard' or 'premium'
    if (type !== "standard" && type !== "premium") {
        throw new Error("Invalid category type. Type must be 'standard' or 'premium'.");
    }

    // Find the admin setting entry for categories
    const category = await AdminSettings.findOne({ where: { key: "categories" } });


    // If no entry exists, create a new one with empty arrays for standard and premium
    if (!category) {
        const newCategories = {
            standard: type === "standard" ? [categoryName] : [],
            premium: type === "premium" ? [categoryName] : []
        };


        await AdminSettings.create({
            key: "categories",
            value: JSON.stringify(newCategories),
        });
    } else {
        // Parse the existing categories
        const existingCategories = JSON.parse(category.value);
        // If entry exists,check if value exists
        const categoryList = existingCategories[type];
        const lowerCasedList = categoryList.map(c => c.toLowerCase());
        if (lowerCasedList.includes(categoryName.toLowerCase())) {
            return { message: `Category '${categoryName}' already exists in ${type}` }
        }


        // Add the new category to the appropriate section based on type
        if (type === "standard") {
            existingCategories.standard.push(categoryName);
        } else if (type === "premium") {
            existingCategories.premium.push(categoryName);
        }

        // Update the value in the database with the updated categories
        await category.update({ value: JSON.stringify(existingCategories) });
    }

    return { message: `${categoryName} added to ${type} categories successfully` };
};

exports.deleteCategory = async (categoryName, type) => {
    // Ensure the type is either 'standard' or 'premium'
    if (type !== "standard" && type !== "premium") {
        throw new Error("Invalid category type. Type must be 'standard' or 'premium'.");
    }

    // Find the admin setting entry for categories
    const category = await AdminSettings.findOne({ where: { key: "categories" } });

    // If no entry exists, return an error message
    if (!category) {
        throw new Error("No categories found to delete.");
    }

    // Parse the existing categories
    const existingCategories = JSON.parse(category.value);

    // Check if the category exists in the correct array based on type
    if (type === "standard") {
        // Remove the category from the 'standard' array
        const index = existingCategories.standard.indexOf(categoryName);
        if (index === -1) {
            throw new Error(`${categoryName} not found in standard categories.`);
        }
        existingCategories.standard.splice(index, 1);
    } else if (type === "premium") {
        // Remove the category from the 'premium' array
        const index = existingCategories.premium.indexOf(categoryName);
        if (index === -1) {
            throw new Error(`${categoryName} not found in premium categories.`);
        }
        existingCategories.premium.splice(index, 1);
    }

    // Update the value in the database with the updated categories
    await category.update({ value: JSON.stringify(existingCategories) });

    return { message: `${categoryName} has been deleted from ${type} categories.` };
};

exports.getStandardCategories = async () => {
    const allCategories = await AdminSettings.findOne({ where: { key: "categories" } });
    if (!allCategories) throw new Error("No categories found");

    const theCategories = JSON.parse(allCategories.dataValues.value);

    // Filter the categories for 'standard' type
    const standardCategories = theCategories.standard || [];

    if (standardCategories.length === 0) {
        throw new Error("No standard categories found");
    }

    return { message: "Standard categories retrieved successfully", categories: standardCategories };
};

exports.getPremiumCategories = async () => {
    const allCategories = await AdminSettings.findOne({ where: { key: "categories" } });
    if (!allCategories) throw new Error("No categories found");

    const theCategories = JSON.parse(allCategories.dataValues.value);

    // Get premium categories array
    const premiumCategories = theCategories.premium || [];

    if (!premiumCategories.length) {
        throw new Error("No premium categories found");
    }

    return { message: "Premium categories retrieved successfully", categories: premiumCategories };
};




//Service management
exports.getAllServices = async (offset, limit, page) => {
    const { count, rows } = await Service.findAndCountAll({
        include: [
            {
                model: Payment,
                as: 'payments',
                attributes: ["status"],
                where: { status: "successful" },
                required: true, 
              },
        ],
        order: [["createdAt", "DESC"]],
        offset,
        limit,
    });

    if (count === 0) return { message: "No services found", data: null,
        meta: { page, limit, total: count }};

    return {
        data: rows.map((item) => item.toJSON()),
        meta: { page, limit, total: count },
    };
};

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

    await Service.update(
        { status: "verified" },
        { where: { id: serviceId } }
    );

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
        <a href="${process.env.FRONTEND_URL}/signin" 
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
    await sendMail(service.email, "JAFI AI Service Approved", mailContent);
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

exports.getMyServices = async (userId, searchTerm, limit, offset) => {
    const searchFilter = searchTerm
        ? {
            [Op.or]: [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { category: { [Op.like]: `%${searchTerm}%` } },
            ],
        }
        : {};

    const services = await Service.findAll({
        where: { searchFilter, userId },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    if (!services || services.length === 0) {
        throw new Error("No services found");
    }

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

exports.getAllClaims = async () => {
    const claims = await Claim.findAll();
    return claims;
}

exports.approveClaim = async (claimId) => {
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

    // Delete claim record
    await claim.destroy()



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
              <a href="${process.env.FRONTEND_URL}/signin" 
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
                as: 'user',
                attributes: ["id", "name", "email", "role"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });

    if (!reviews) throw new Error("Reviews not found");

    return { reviews };
};


exports.getAllReviewers = async (offset, limit, page) => {
    const { count, rows: users } = await User.findAndCountAll({
        where: { role: "reviewer" },
        order: [["createdAt", "DESC"]],
        attributes: ["id", "name", "email", "role"],
        offset,
        limit,
    }
    );
    if (!users) throw new Error("No users found");
    return {
        data: users,
        meta: { page, limit, total: count },
    };
};

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


//Exproting of data service
// 1. Export Users
exports.exportUsers = async (res) => {
    await exportTableData(User, 'users', res);
};

// 2. Export Businesses
exports.exportBusinesses = async (res) => {
    await exportTableData(Business, 'businesses', res);
};

// 3. Export Reviewers
exports.exportReviewers = async (res) => {
    await exportTableData(Review, 'reviewers', res);
};

// 4. Export Services
exports.exportServices = async (res) => {
    await exportTableData(Service, 'services', res);
};

// 5. Export Transactions
exports.exportTransactions = async (res) => {
    await exportTableData(Transaction, 'transactions', res);
};



//Transaction management{check in payments service}








