const Service = require("./service.model");
const User = require("../user/user.model");
const OTPService = require("../otp/otp.service");
const PaymentService = require("../payments/payments.service");
const { generatePassword } = require("../../utils/generatePassword")




exports.registerService = async (email, name, service, phone, address, category, images, description) => {
    const existingService = await Service.findOne({ where: { email } });
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser || existingService) throw new Error("User already exists");

    // Generate random password
    const { plainPassword, hashedPassword } = generatePassword()

    // Use transaction to ensure data consistency
    // Create user inside the transaction
    const user = await User.create(
        {
            email,
            password: hashedPassword,
            role: "service",
            name: name
        },
    );

    // Create service inside the transaction
    const newService = await Service.create(
        {
            name: service,
            password: hashedPassword,
            status: "pending",
            userId: user.id,
            address,
            phone_number: phone,
            category,
            images,
            email,
            description
        },
    );

    const response = await OTPService.sendOTP(result.newService.phone_number, result.user.id);
    return { user, newService, plainPassword, response };
};

exports.verifyServiceNumber = async (phoneNumber, otp) => {
    if (!otp) throw new Error("Enter a valid OTP");

    await OTPService.verifyOTP(phoneNumber, otp);
    return { message: "OTP verified successfully" };
};

exports.getAService = async (serviceId) => {
    const service = await Service.findByPk(serviceId, {
        include: {
            model: User,
            attributes: ["id", "name", "email", "role"],
        },
    });

    if (!service) throw new Error("Service not found");

    return service;
};

exports.getAllServices = async () => {
    const services = await Service.findAll({
        include: {
            model: User,
            attributes: ["id", "name", "email", "role"],
        },

    });
    if (!services || services.length === 0) {
        throw new Error("No services found");
    }

    return services;
};

exports.updateService = async (serviceId, userId, serviceData, password, email) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error("Service not found");

    if (service.userId !== userId) throw new Error("Unauthorized to update this service");



    if (password !== undefined || password !== "") {
        const hashedPassword = generatePassword(password);
        await User.update(
            { password: hashedPassword },
            { where: { id: userId } }
        );
    }
    await User.update(
        { password: hashedPassword, email: email },
        { where: { id: userId } }
    )


    service.set(serviceData);
    await service.save();

    return service;
};


exports.payForService = async (serviceId, amount, transaction) => {
    const service = await Service.findOne({
        where: { id: serviceId },
        include: [{
            model: User, attributes: ["id", "email", "name", "role"]
        }],
        transaction
    });

    if (!service || !service.User) {
        throw new Error("Service not found or does not have an associated user.");
    }

    const userId = service.User.id
    const entity_type = 'service';

    // Create payment
    const response = await PaymentService.createPayment(userId, serviceId, entity_type, amount, { transaction });
    // Make payment
    const paymentDetails = await PaymentService.makePayment(response.id, { transaction });

    return { response, paymentDetails };
};


exports.verifyPayment = async (paymentReference) => {
    const paymentResponse = await PaymentService.verifyPayment(paymentReference);

    return paymentResponse

}

exports.getServiceByUserId = async (userId) => {
    const service = await Service.findOne({ where: { userId } });
    if (!service) throw new Error("Service not found");

    return service;
}

exports.deleteService = async (serviceId, userId) => {
    if (userId === undefined || userId != req.user.id) {
        throw new Error("Unauthorized to access this service");
    }
    const service = await Service.findByPk(serviceId);

    if (!service) throw new Error("Service not found");

    // Check if the user is authorized to delete the service
    if (service.userId !== userId) throw new Error("Unauthorized to delete this service");

    // Find the corresponding user based on userId
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Delete the service and corresponding user
    await service.destroy();
    await user.destroy();

    return { message: "Service deleted successfully" };
};



