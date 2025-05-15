const AdminService = require("./admin.services");
const cache = require('../../utils/cache')

//users management
exports.getAllUsers = async (req, res) => {
  try {
    const role = req.query.role || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    //Caching
    const cacheKey = `adAllUsers:page=${page}-limit=${limit}-role=${role}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await AdminService.getAllUsers(role, offset, limit, page);
    cache.set(cacheKey, response);
    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await AdminService.deleteUser(id);
    //Delete cacke key
    cache.flushAll();
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.transferBusiness = async (req, res) => {
  const ownerEmail = req.body.email;
  const { userId } = req.params
  try {
    //Delete cacke key
    cache.flushAll();
    const response = await AdminService.transferBusiness(userId, ownerEmail);
    res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
}

exports.createAdmin = async (req, res) => {
  const { email, name, role } = req.body;

  try {
    //Delete cacke key
    cache.flushAll();
    const newUser = AdminService.createAdmin(email, name, role);
    if (!newUser) throw new Error("User creation failed");

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminCount = async (req, res) => {
  try {
    //Delete cacke key
    cache.flushAll();
    const response = await AdminService.getAdminCount();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.updateAdminPassword = async (req, res) => {
  const id = req.user.id
  const { newPassword } = req.body;

  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.updateAdminPassword(id, newPassword);
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};





// Business management
exports.getAllBusinesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    //Caching
    const cacheKey = `adAllBusinesses:page=${page}-limit=${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await AdminService.getAllBusinesses(offset, limit, page);
    cache.set(cacheKey, response)
    return res.status(200).json(response);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};

exports.approveBusiness = async (req, res) => {
  const { id } = req.params;
  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.approveBusiness(id);
    return res.status(200).json({ message: "Business approved successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateBusinessPremium = async (req, res) => {
  const { price } = req.body;
  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.updateBusinessPremium(price);

    return res.status(200).json({ message: "Business Premium price updated successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error.message });
  }
};


exports.updateBusinessEnterprise = async (req, res) => {
  const { price } = req.body;
  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.updateBusinessEnterprise(price);

    return res.status(200).json({ message: "Business enterprise price updated successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error.message });
  }
};

exports.getABusiness = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await AdminService.getABusiness(id);
    return res.status(200).json({ business });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addBusiness = async (req, res) => {
  const businessData = { ...req.body };
  const userId = req.user.id
  if (req.files) {
    if (req.files["images"]) {
      businessData.images = req.files["images"].map((file) => file.path);
    }
  }
  try {
    //Delete cacke key
    cache.flushAll();
    const business = await AdminService.addBusiness(businessData, userId);
    if (!business) throw new Error("Business creation failed");

    return res.status(201).json({ message: "Business created successfully", business: business });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}


exports.deleteBusiness = async (req, res) => {
  const id = req.params.id;
  try {
    //Delete cacke key
    cache.flushAll();
    const response = await AdminService.deleteBusiness(id);
    return res.status(200).json({ message: response });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

exports.getMyBusiness = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const response = await AdminService.getMyBusiness(userId, offset, limit, page);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.updateMyBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const businessData = req.body;


    // Handle images
    const images = req.files?.["images"] ? req.files["images"].map(file => file.path) : [];
    businessData.images = images;

    const password = businessData.password;
    const email = businessData.email
    delete businessData.password;
    delete businessData.email


    //Delete cacke key
    cache.flushAll();
    const business = await AdminService.updateMyBusiness(id, userId, businessData, password, email);
    res.status(200).json(business);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

exports.getPremiumPrice = async (req, res) => {
  const { id } = req.params;
  try {
    const premiumPrice = await AdminService.getPremiumPrice(id);
    return res.status(200).json({ premiumPrice });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getEnterprisePrice = async (req, res) => {
  const { id } = req.params;
  try {
    const enterprisePrice = await AdminService.getEnterprisePrice(id);
    return res.status(200).json({ enterprisePrice });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addCategory = async (req, res) => {
  const { categoryName, type } = req.body;
  try {
    //Delete cacke key
    cache.flushAll();
    const response = await AdminService.addCategory(categoryName, type);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { categoryName } = req.body;
  console.log(req.body)
  try {
    //Delete cacke key
    cache.flushAll();
    const response = await AdminService.deleteCategory(categoryName);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getEnterpriseCategories = async (req, res) => {
  try {
    const response = await AdminService.getEnterpriseCategories();
    res.status(200).json(response);
  } catch (error) {
     console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPremiumCategories = async (req, res) => {
  try {
    const response = await AdminService.getPremiumCategories();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// Service management
exports.getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    //Caching
    const cacheKey = `adAllServices:page=${page}-limit=${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await AdminService.getAllServices(offset, limit, page);
    cache.set(cacheKey, response)
    return res.status(200).json(response);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};

exports.getAService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await AdminService.getAService(id);
    return res.status(200).json({ service });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.approveService = async (req, res) => {
  const { id } = req.params;
  try {
    await AdminService.approveAService(id);
    return res.status(200).json({ message: "Service approved successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateServicePrice = async (req, res) => {
  const { price } = req.body;

  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.updateSevicePrice(price);

    return res.status(200).json({ message: "Service price updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  const id = req.params.id;
  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.deleteService(id);
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.getServicePrice = async (req, res) => {
  try {
    const price = await AdminService.getServicePrice();
    return res.status(200).json({ price });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}



// Review management
exports.getAllReviews = async (req, res) => {
  try {
    //Caching
    const cacheKey = `adAllReviews`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await AdminService.getAllReviews();
    cache.set(cacheKey, response)
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllReviewers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    //Caching
    const cacheKey = `adAllReviewers:page=${page}-limit=${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await AdminService.getAllReviewers(offset, limit, page);
    cache.set(cacheKey, response);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.deleteReview = async (req, res) => {
  const id = req.params;
  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.deleteReviews(id);
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.deleteReviewer = async (req, res) => {
  const id = req.params;
  try {
    //Delete cacke key
    cache.flushAll();
    await AdminService.deleteReviewer(id);
    return res.status(200).json({ message: "Reviewer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

}




//claim management
exports.approveClaim = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await AdminService.approveClaim(id);
    return res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getClaim = async (req, res) => {
  const { id } = req.params;

  try {
    const claim = await AdminService.getClaim(id);
    return res.status(200).json(claim)
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllClaims = async (req, res) => {
  try {
    //Caching
    const cacheKey = `adAllCalims`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const claims = await AdminService.getAllClaims();
    cache.set(cacheKey, claims)
    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//export management
exports.exportUsers = async (req, res) => {
  try {
    const response = await AdminService.exportUsers(res);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.exportBusinesses = async (req, res) => {
  try {
    const response = await AdminService.exportBusinesses(res);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message })
  }
}

exports.exportServices = async (req, res) => {
  try {
    const response = await AdminService.exportServices(res);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.exportReviewers = async (req, res) => {
  try {
    const response = await AdminService.exportReviewers(res);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.exportTransactions = async (req, res) => {
  try {
    const response = await AdminService.exportTransactions(res);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}