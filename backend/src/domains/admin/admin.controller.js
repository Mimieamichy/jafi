const AdminService = require("./admin.services");

//users management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminService.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  const newUserEmail = req.body.email || null
  try {
    await AdminService.deleteUser(id, newUserEmail);
    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.createAdmin = async (req, res) => {
  const { email, name, role } = req.body;
  
  try {
    const newUser = AdminService.createAdmin(email, name, role);
    if (!newUser) throw new Error("User creation failed");
    
    return res.status(201).json({ success: true, message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdminPassword = async (req, res) => {
  const id = req.user.id
  const { newPassword } = req.body;

  try {
    await AdminService.updateAdminPassword(id, newPassword);
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
};





// Business management
exports.getAllBusinesses = async (req, res) => {
  try {;
    const businesses = await AdminService.getAllBusinesses();
    return res.status(200).json({ success: true, businesses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveBusiness = async (req, res) => {
  const { id } = req.params;
  try {
    await AdminService.approveBusiness(id);
    return res.status(200).json({ success: true, message: "Business approved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBusinessPremium = async (req, res) => {
  const { price } = req.body;
  try {
    await AdminService.updateBusinessPremium(price);

    return res.status(200).json({ success: true, message: "Business Premium price updated successfully" });
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateBusinessStandard = async (req, res) => {
  const { price } = req.body;
  try {
    await AdminService.updateBusinessStandard(price);

    return res.status(200).json({ success: true, message: "Business standard price updated successfully" });
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getABusiness = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await AdminService.getABusiness(id);
    return res.status(200).json({ success: true, business });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addBusiness = async (req, res) => {
  const businessData = { ...req.body };
  const userId = req.user.id
  console.log(businessData)
  if (req.files) {
    if (req.files["images"]) {
      businessData.images = req.files["images"].map((file) => file.path);
    }
  }
  try {
    const business = await AdminService.addBusiness(businessData, userId);
    if (!business) throw new Error("Business creation failed");
    
    return res.status(201).json({ success: true, message: "Business created successfully", business: business });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.updateBusiness = async (req, res) => {
}

exports.deleteBusiness = async (req, res) => {
  const id = req.params.id;
  try {
    const response = await AdminService.deleteBusiness(id);
    return res.status(200).json({ success: true, message: response });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.getMyBusiness = async (req, res) => {
  const userId = req.user.id;
  const searchTerm = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const business = await AdminService.getMyBusiness(userId, searchTerm, offset, limit);
    return res.status(200).json({ success: true, business });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.updateMyBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const businessData = req.body;


    // Handle images
    const images = req.files?.["images"]? req.files["images"].map(file => file.path) : [];
    businessData.images = images;
    
    const password = businessData.password;
    const email = businessData.email
    delete businessData.password;
    delete businessData.email


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
    return res.status(200).json({ success: true, premiumPrice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



exports.getStandardPrice = async (req, res) => {
  const { id } = req.params;
  try {
    const standardPrice = await AdminService.getStandardPrice(id);
    return res.status(200).json({ success: true, standardPrice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// Service management
exports.getAllServices = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const services = await AdminService.getAllServices();
    return res.status(200).json({ success: true, services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await AdminService.getAService(id);
    return res.status(200).json({ success: true, service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.approveService = async (req, res) => {
  const { id } = req.params;
  try {
    await AdminService.approveAService(id);
    return res.status(200).json({ success: true, message: "Service approved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateServicePrice = async (req, res) => {
  const { price } = req.body;

  try {
    await AdminService.updateSevicePrice(price);

    return res.status(200).json({ success: true, message: "Service price updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  const id = req.params.id;
  try {
    await AdminService.deleteService(id);
    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.getServicePrice = async (req, res) => {
  try {
    const price = await AdminService.getServicePrice();
    return res.status(200).json({ success: true, price });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}





// Review management
exports.getAllReviews = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const reviews = await AdminService.getAllReviews();
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReviewers = async(req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const reviewers = await AdminService.getAllReviewers()
    return res.status(200).json({ success: true, reviewers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.deleteReview = async (req, res) => {
  const id = req.params;
  try {
    await AdminService.deleteReviews(id);
    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.deleteReviewer = async (req, res) => {
  const id = req.params;
  try {
    await AdminService.deleteReviewer(id);
    return res.status(200).json({ success: true, message: "Reviewer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

}




//claim management
exports.approveClaim = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await AdminService.approveClaim(id);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClaim = async (req, res) => {
  const { id } = req.params;

  try {
    const claim = await AdminService.getClaim(id);
    return res.status(200).json(claim)
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllClaims = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const claims = await AdminService.getAllClaims();
    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

