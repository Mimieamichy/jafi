const ServiceService = require("./service.service");
const sequelize = require("../../config/database");
const cache = require('../../utils/cache')



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
    cache.flushAll();
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.verifyServiceNumber = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const response = await ServiceService.verifyServiceNumber(phone, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getAService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServiceService.getAService(id);
    res.status(200).json(service);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    //Caching
    const cacheKey = `services:page=${page}-limit=${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await ServiceService.getAllServices(offset, limit, page);
    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const serviceData = req.body;


    // Handle images
    const images = req.files?.["workSamples"]? req.files["workSamples"].map(file => file.path) : [];
    serviceData.images = images;
    
    const password = serviceData.password;
    const email = serviceData.email
    delete serviceData.password;
    delete serviceData.email


    //Delete cacke key
    cache.flushAll();
    const service = await ServiceService.updateService(id, userId, serviceData, password, email);
    res.status(200).json(service);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
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
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.verifyServicePayment = async (req, res) => {
  const { pay_ref } = req.params;
  try {
    const response = await ServiceService.verifyPayment(pay_ref);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getServiceByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ServiceService.getServiceByUserId(id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    //Delete cacke key
    cache.flushAll();
    const service = await ServiceService.deleteService(id, userId);
    res.status(200).json(service);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
