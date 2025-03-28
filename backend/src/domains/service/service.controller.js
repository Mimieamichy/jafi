const ServiceService = require("./service.service");
const sequelize = require("../../config/database");


exports.registerService = async (req, res) => {
  try {
    const { email, ...serviceData } = req.body;
    const images = req.files["hiring_images"] ? req.files["hiring_images"].map(file => file.path) : [];

    const response = await ServiceService.registerService(email, serviceData, images);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyServiceNumber = async (req, res) => {
  try {
    const { otp, phone_number } = req.body;
    const response = await ServiceService.verifyServiceNumber(phone_number, otp);
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
    res.status(404).json({ error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    const service = await ServiceService.updateService(id, serviceData);
    res.status(200).json(service);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

exports.payForService = async (req, res) => {
  const { serviceId } = req.params;
  const { amount } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const response = await ServiceService.payForService(serviceId, amount, transaction);
    await transaction.commit();
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyServicePayment = async (req, res) => {
  const {pay_ref}  = req.params
  try{
    const response = await ServiceService.verifyPayment(pay_ref)
    res.status(200).json(response);
  } catch (error){
    res.status(404).json({ error: error.message });
  }
  
}
