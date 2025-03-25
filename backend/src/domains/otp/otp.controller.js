const OTPService = require("./otp.service");

exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber, userId } = req.body;
        if (!phoneNumber || !userId || !purpose) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const response = await OTPService.sendOTP(phoneNumber, userId);
        console.log(response)
        res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ error: "Phone number and OTP are required" });
        }

        const response = await OTPService.verifyOTP(phoneNumber, otp);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
