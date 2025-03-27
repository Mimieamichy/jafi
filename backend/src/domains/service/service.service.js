const Service = require("./service.model");
const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const OTPService = require("../otp/otp.service");
const PaymentService= require("../payments/payments.service");


exports.registerService = async (email, serviceData, images) => {

    try {
        const existingService = await Service.findOne({ where: { email } });
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser || existingService) throw new Error("User already exists");

        serviceData.images = images;
        serviceData.email = email;

        // Generate random password
        const plainPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Create user inside the transaction
        const user = await User.create(
            { email, password: hashedPassword, role: "service" , name: serviceData.name});

        // Create service inside the transaction
        const service = await Service.create({ ...serviceData, password: hashedPassword, status: "pending", userId: user.id })
    

        // Send OTP (outside transaction to avoid rollback on failure)
        const response = await OTPService.sendOTP(service.phone_number, user.id);
        return { message: "OTP sent successfully", service, response };
    } catch (error) {
        throw error;
    }
};

exports.verifyServiceNumber = async (phoneNumber, otp) => {
    if (!otp) throw new Error("Enter a valid OTP");

    await OTPService.verifyOTP(phoneNumber, otp);
    return { message: "OTP verified successfully" };
};

exports.getAService = async (serviceId) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error("Service not found");
  
    return service;
};

exports.getAllServices = async () => {
    const service = await Service.findAll();
    if (!service) throw new Error("Service not found");
  
    return service;
};

exports.updateService = async (serviceId, serviceData, ) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error("Service not found");
  
    service.set(serviceData);
    await service.save();
  
    return service;
}

exports.payForService = async (serviceId, amount, transaction) => {
    const service = await Service.findOne({
        where: { id: serviceId },
        include: [{ model: User, as: 'user' }],
        transaction
    });

    if (!service || !service.user) {
        throw new Error("Service not found or does not have an associated user.");
    }

    const userId = service.user.dataValues.id
    const entity_type = 'service';

    // Create payment
    const response = await PaymentService.createPayment(userId, serviceId, entity_type, amount, { transaction });
    // Make payment
    const paymentDetails = await PaymentService.makePayment(response.id, { transaction });

    return {response, paymentDetails};
};


exports.verifyPayment = async (paymentReference) => {
    const paymentResponse = await PaymentService.verifyPayment(paymentReference);
    
    return paymentResponse

}

  