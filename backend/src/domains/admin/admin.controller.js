const AdminService = require("./admin.services");


exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminService.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addUser = async (req, res) => {
  const { email, name, role } = req.body;
  
  try {
    const newUser = AdminService.createUser(email, name, role);
    if (!newUser) throw new Error("User creation failed");
    
    return res.status(201).json({ success: true, message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserPassword = async (req, res) => {
  const id = req.user.id
  const { newPassword } = req.body;

  try {
    await AdminService.updateUserPassword(id, newPassword);
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
    const business = await Business.findByPk(id);
    if (!business) throw new Error("Business not found");

    business.price = price;
    await business.save();

    return res.status(200).json({ success: true, message: "Business price updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Service management
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    return res.status(200).json({ success: true, services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);
    if (!service) throw new Error("Service not found");

    service.status = "approved";
    const user = await User.findByPk(service.userId);
    if (user) {
      service.userId = user.id; // Re-assign userId after approval
    }

    await service.save();

    // Send an email notification to the service owner
    await sendEmail(user.email, "Your Service is Approved", "Congratulations! Your service is approved.");

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
    const reviews = await Review.findAll();
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

