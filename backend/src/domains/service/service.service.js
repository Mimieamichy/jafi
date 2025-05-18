const OTPService = require("../otp/otp.service");
const PaymentService = require("../payments/payments.service");
const { generatePassword } = require("../../utils/generatePassword")
const bcrypt = require('bcryptjs')
const {Service, User, Review} = require('../../models/index')
const {Op, fn, col} = require('sequelize')




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

    const response = await OTPService.sendOTP(newService.phone_number, user.id);
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
            as: 'user',
            attributes: ["id", "name", "email", "role"],
        },
    });

    if (!service) throw new Error("Service not found");

    return service;
};

exports.getAllServices = async (offset, limit, page, filter) => {
    const raw = await Service.findAll({
    where: { status: "verified" },
    include: {
      model: User,
      as: "user",
      attributes: ["id", "name", "email", "role"],
    },
    attributes: [
      "id",
      "name",
      "description",
      "address",
      "category",
      "images",
      "phone_number",
      "average_rating",
      "createdAt",
    ],
    limit,
    offset,
    raw: true,
    order: [["createdAt", "DESC"]],
  });

  if (!raw.length) {
    throw new Error("No services found");
  }

  const total = raw.length;

  // 2. Get review counts for all services in one go
  const listingIds = raw.map((s) => `ser_${s.id}`);
  const counts = await Review.findAll({
    where: { listingId: { [Op.in]: listingIds } },
    attributes: [
      "listingId",
      [fn("COUNT", col("id")), "reviewCount"],
    ],
    group: ["listingId"],
    raw: true,
  });
  const countMap = counts.reduce((map, { listingId, reviewCount }) => {
    map[listingId] = parseInt(reviewCount, 10);
    return map;
  }, {});

  // 3. Annotate each service
  const annotated = raw.map((s) => ({
    ...s,
    average_rating: parseFloat(s.average_rating || 0),
    reviewCount: countMap[`ser_${s.id}`] || 0,
  }));

  // 4. Sort in-memory
  annotated.sort((a, b) => {
    switch (filter) {
      case "highestRated":
        return b.average_rating - a.average_rating;
      case "highestReviewed":
        return b.reviewCount - a.reviewCount;
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "mostRecent":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 5. Paginate
  const data = annotated.slice(offset, offset + limit);

  return {
    data,
    meta: { page, limit, total },
  };
};

exports.updateService = async (serviceId, userId, serviceData, password, email) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error("Service not found");
  
    if (service.userId !== userId) throw new Error("Unauthorized to update this service");
  
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
  
    // Update service
    await service.update({ ...serviceData, userId });
    const updatedService = await Service.findByPk(serviceId, {
        attributes: { exclude: ['password'] },
      });
  
    return updatedService;
};

exports.payForService = async (serviceId, amount, transaction) => {
    const service = await Service.findOne({
        where: { id: serviceId },
        include: [{
            model: User, attributes: ["id", "email", "name", "role"],
            as: 'user'
        }],
        transaction
    });

    
    const serviceUser = service.user.dataValues

    if (!service || !serviceUser) {
        throw new Error("Service not found or does not have an associated user.");
    }

    const userId = serviceUser.id
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



