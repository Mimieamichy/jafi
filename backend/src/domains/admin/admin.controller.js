const AdminService = require("./admin.services");


exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminService.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Business management
exports.getAllBusinesses = async (req, res) => {
  try {
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

exports.updateBusinessPrice = async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  try {
    await AdminService.updateBusinessPrice(id, price);

    return res.status(200).json({ success: true, message: "Business price updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveClaim = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await AdminService.approveClaim(id);
    return res.status(200).json({ success: true, response });
  } catch (error) {
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

exports.getABusiness = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await AdminService.getABusiness(id);
    return res.status(200).json({ success: true, business });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Service management
exports.getAllServices = async (req, res) => {
  try {
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
    await AdminService.getAService(id);
    return res.status(200).json({ success: true, message: "Service approved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateServicePrice = async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  try {
    const service = await Service.findByPk(id);
    if (!service) throw new Error("Service not found");

    service.price = price;
    await service.save();

    return res.status(200).json({ success: true, message: "Service price updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Review management
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await AdminService.getAllReviews()
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBusiness = async (req, res) => {
  
}

exports.getAllReviewers = async(req, res) => {
  try {
    const reviews = await AdminService.getAllReviewers()
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


