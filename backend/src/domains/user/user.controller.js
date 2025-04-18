const UserService = require("../user/user.service");



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await UserService.userLogin(email, password);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await UserService.userForgotPassword(email);

    res.status(200).json({response })
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const email = await UserService.verifyResetToken(token);

    if (email) {
      res.redirect(
        `${process.env.FRONTEND_URL}/reset-password/?token=${token}`
      );
    }

  } catch (error) {

    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const response = await UserService.userResetPassword(token, newPassword);

    res.status(200).json({response })
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    res.status(200).json({ user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const { rows: users, count: total } = await UserService.getAllUsers({ offset, limit });

    res.status(200).json({
      users,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = await UserService.updateUser(id, data);

    res.status(200).json({ user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
} 

exports.getAllListings = async (req, res) => {
    try {
      const search = req.query.seasearchTermrch || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
  
      const { listings, total } = await listingService.getAllListings(search, offset, limit);
        return res.status(200).json({ listings, total});
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getUserRole = async (req, res) => {
  try {
    const { email } = req.params;
    const role = await UserService.getUserRole(email);

    res.status(200).json({ role });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}


exports.replyToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const newReply = req.body.reply;
        const userId = req.user.id; 
        const reply = await UserService.replyToReview(reviewId, userId, newReply);
        return res.status(201).json({ success: true, reply });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}