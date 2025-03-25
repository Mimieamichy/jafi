const UserService = require("../user/user.service");



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await UserService.userLogin(email, password);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await UserService.userForgotPassword(email);

    res.status(200).json({response })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const response = await UserService.userResetPassword(token, newPassword);

    res.status(200).json({response })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};



exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const token = await UserService.userGoogleLogin(idToken);
    res.status(200).json({token })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

