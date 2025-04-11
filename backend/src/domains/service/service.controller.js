const ServiceService = require("./service.service");
const sequelize = require("../../config/database");
const bcrypt = require("bcryptjs");

exports.registerService = async (req, res) => {
  try {
    const { email, name, service, phone, address, category, description } =
      req.body;
    const images = req.files["workSamples"]
      ? req.files["workSamples"].map((file) => file.path)
      : [];

    const response = await ServiceService.registerService(
      email,
      name,
      service,
      phone,
      address,
      category,
      images,
      description
    );
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.verifyServiceNumber = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const response = await ServiceService.verifyServiceNumber(phone, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServiceService.getAService(id);
    res.status(200).json(service);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await ServiceService.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const serviceData = req.body;

    // Handle images
    const images = req.files?.["workSamples"]
      ? req.files["workSamples"].map((file) => file.path)
      : [];
    serviceData.images = images;

    // Hash password if it exists in the update payload
    if (serviceData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(serviceData.password, salt);
      serviceData.password = hashedPassword;
    }

    const service = await ServiceService.updateService(id, userId, serviceData);
    res.status(200).json(service);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

exports.payForService = async (req, res) => {
  const { serviceId } = req.params;
  const { amount } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const response = await ServiceService.payForService(
      serviceId,
      amount,
      transaction
    );
    await transaction.commit();
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyServicePayment = async (req, res) => {
  const { pay_ref } = req.params;
  try {
    const response = await ServiceService.verifyPayment(pay_ref);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getServiceByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === undefined || id != req.user.id) {
      throw new Error("Unauthorized to access this service");
    }
    const user = await ServiceService.getServiceByUserId(id);
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const service = await ServiceService.deleteService(id, userId);
    res.status(200).json(service);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
