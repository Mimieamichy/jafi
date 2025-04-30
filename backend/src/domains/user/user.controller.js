const UserService = require("../user/user.service");



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await UserService.userLogin(email, password);

    res.status(200).json(response);
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

    res.status(200).json(response)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await UserService.getUserById(id);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const response = await UserService.getAllUsers();

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const response = await UserService.updateUser(id, data);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
} 

exports.getAllListings = async (req, res) => {
    try {
      const search = req.query.searchTerm || "";
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 10;
      const page = req.query.page || 1;
      const response = await UserService.getAllListings(search, offset, limit, page);
      return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getUserRole = async (req, res) => {
  try {
    const { email } = req.params;
    const response = await UserService.getUserRole(email);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.replyToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const newReply = req.body.reply;
        const userId = req.user.id; 
        const response = await UserService.replyToReview(reviewId, userId, newReply);
        return res.status(201).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}