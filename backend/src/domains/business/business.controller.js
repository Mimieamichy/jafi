const BusinessService = require("./business.service");
const sequelize = require("../../config/database");
const cache = require("../../utils/cache")


exports.registerBusiness = async (req, res) => {
  try {
    const businessData = { ...req.body };

    // Check and handle image files
    if (req.files) {
      if (req.files["images"]) {
        businessData.images = req.files["images"].map((file) => file.path);
      }

      // Handle proof file if it's provided
      if (req.files["pob"]) {
        businessData.proof = req.files["pob"][0]?.path;
      }

      if (req.files["logo"]) {
        businessData.logo = req.files["logo"][0]?.path;
      }
    }

    cache.flushAll();
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    //Cache the response for 1 hour
    const cacheKey = `allBusiness:page=${page}-limit=${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await BusinessService.getAllBusinesses(offset, limit, page);
    cache.set(cacheKey, response);
    res.status(200).json(response);
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


    // Handle images
    const images = req.files?.["images"] ? req.files["images"].map(file => file.path) : [];
    //const logo = req.files?.["logo"] ? req.files["logo"].map(file => file.path) : [];
    businessData.images = images;
    // businessData.logo = logo;

    const password = businessData.password;
    const email = businessData.email
    delete businessData.password;
    delete businessData.email

    //Delete cacke key
    cache.flushAll();
    const business = await BusinessService.updateBusiness(id, userId, businessData, password, email);
    res.status(200).json(business);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

exports.payForBusiness = async (req, res) => {
  const { businessId } = req.params;
  const { amount } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const response = await BusinessService.payForBusiness(
      businessId,
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
    const business = await BusinessService.getBusinessByUserId(id);
    res.status(200).json(business);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    //Delete cacke key
    cache.flushAll();
    const business = await BusinessService.deleteBusiness(id, userId);
    res.status(200).json(business);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getBusinessByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const filter = req.query.filter || "";
    //Cache the response for 1 hour
    const cacheKey = `businessCat:category=${category}-page=${page}-limit=${limit}-filter=${filter}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await BusinessService.getBusinessByCategory(category, offset, limit, page, filter);
    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(error.status || 500).json({ message: error.message });
  }
}
