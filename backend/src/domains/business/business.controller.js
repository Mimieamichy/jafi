const BusinessService = require("./business.service");
const sequelize = require("../../config/database");

exports.registerBusiness = async (req, res) => {
    try {
      const businessData = { ...req.body };
  
      // Check and handle image files
      if (req.files) {
        if (req.files["images"]) {
          businessData.images = req.files["images"].map(file => file.path);  
        }
        
        // Handle proof file if it's provided
        if (req.files["pob"]) {
          businessData.proof = req.files["pob"].map(file => file.path);   
        }
      }
  
      const response = await BusinessService.registerBusiness(businessData);
      res.status(201).json(response);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
};

exports.getABusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await BusinessService.getABusiness(id);
    res.status(200).json(business);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await BusinessService.getAllBusinesses();
    res.status(200).json(businesses);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const businessData = req.body;
    const images = req.files["workSamples"] ? req.files["workSamples"].map(file => file.path) : [];
    const proof = req.files["pob"] ? req.files["pob"].map(file => file.path) : [];
    businessData.images = images
    businessData.proof = proof
    const business = await BusinessService.updateBusiness(id, userId, businessData);
    res.status(200).json(business);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.payForBusiness = async (req, res) => {
  const { businessId } = req.params;
  const { amount } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const response = await BusinessService.payForBusiness(businessId, amount, transaction);
    await transaction.commit();
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyBusinessPayment = async (req, res) => {
  const { pay_ref } = req.params;
  try {
    const response = await BusinessService.verifyPayment(pay_ref);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getBusinessByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === undefined || id != req.user.id) {
      throw new Error("Unauthorized to access this business");
    }
    const user = await BusinessService.getBusinessByUserId(id);
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const business = await BusinessService.deleteBusiness(id, userId);
    res.status(200).json(business);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
