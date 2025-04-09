const Business = require("./business.model");
const User = require("../user/user.model");
const PaymentService = require("../payments/payments.service");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.registerBusiness = async (businessData) => {
    const existingBusiness = await Business.findOne({ where: { email: businessData.email } });
        const existingUser = await User.findOne({ where: { email: businessData.email } });
        
        if (existingBusiness) throw new Error("Business already exists with this email");
        
        let user;
    
            // Check if the user exists and is an admin or superadmin
            if (existingUser) {
                if (existingUser.role !== "admin" && existingUser.role !== "superadmin") {
                    user = existingUser
                    const newBusiness = await Business.create({
                        ...businessData,
                        userId: user.id,
                        status: "pending",
                        claimed: true
                    });

                    return {user, newBusiness, plainPassword}
                }
                
            } else {
                // Create new user with role "business"
                const plainPassword = crypto.randomBytes(6).toString("hex");
                const hashedPassword = await bcrypt.hash(plainPassword, 10);
                
                user = await User.create({ 
                    email: businessData.email, 
                    password: hashedPassword, 
                    role: "business", 
                    name: businessData.name 
                });
                

            // Create business inside the transaction
            const newBusiness = await Business.create({
                ...businessData,
                userId: user.id,
                status: "verified",
                claimed: false
            });
        
            return { 
                user, 
                newBusiness, 
                plainPassword: !existingUser ? plainPassword : existingUser.password
            };
        }

};

exports.getABusiness = async (businessId) => {
    const business = await Business.findByPk(businessId, {
        include: {
            model: User,
            attributes: ["id", "name", "email", "role"],
        },
    });

    if (!business) throw new Error("Business not found");

    return business;
};

exports.getAllBusinesses = async () => {
    const businesses = await Business.findAll({
        include: {
            model: User,
            attributes: ["id", "name", "email", "role"],
        },
    });

    if (!businesses || businesses.length === 0) {
        throw new Error("No businesses found");
    }

    return businesses;
};

exports.updateBusiness = async (businessId, userId, businessData) => {
    const business = await Business.findByPk(businessId);
    if (!business) throw new Error("Business not found");

    if (business.userId !== userId) throw new Error("Unauthorized to update this business");

    business.set(businessData);
    await business.save();

    return business;
};

exports.payForBusiness = async (businessId, amount, transaction) => {
    const business = await Business.findOne({
        where: { id: businessId },
        include: [{ model: User, attributes: ["id", "email", "name", "role"] }],
        transaction,
    });

    if (!business || !business.User) {
        throw new Error("Business not found or does not have an associated user.");
    }

    const userId = business.User.id;
    const entity_type = 'business';

    // Create payment
    const response = await PaymentService.createPayment(userId, businessId, entity_type, amount, { transaction });
    // Make payment
    const paymentDetails = await PaymentService.makePayment(response.id, { transaction });

    return { response, paymentDetails };
};

exports.verifyPayment = async (paymentReference) => {
    const paymentResponse = await PaymentService.verifyPayment(paymentReference);

    return paymentResponse;
};

exports.getBusinessByUserId = async (userId) => {
    const business = await Business.findOne({ where: { userId } });
    if (!business) throw new Error("Business not found");

    return business;
};

exports.deleteBusiness = async (businessId, userId) => {
    if (userId === undefined || userId !== req.user.id) {
        throw new Error("Unauthorized to access this business");
    }
    const business = await Business.findByPk(businessId);

    if (!business) throw new Error("Business not found");

    // Check if the user is authorized to delete the business
    if (business.userId !== userId) throw new Error("Unauthorized to delete this business");

    // Find the corresponding user based on userId
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Delete the business and corresponding user
    await business.destroy();
    await user.destroy();

    return { message: "Business deleted successfully" };
};
