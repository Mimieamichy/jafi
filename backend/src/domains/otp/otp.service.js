const {africastalking} = require('../../config/africastalking');
const bcrypt = require('bcryptjs');
const OTP = require('./otp.model');

const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};


exports.sendOTP = async (phoneNumber, userId) => {

    // Generate OTP
    const otp = generateOTP(6);
    const otpCode = await bcrypt.hash(otp, 10);
    await OTP.create({
        phone_number: phoneNumber,
        otp: otpCode,
        userId: userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const response = await africastalking.send({
        to: phoneNumber,
        message: `Your verification code is: ${otp}. Valid for 15 minutes, do not share this code with anyone`,
        from: 'JAFI.AI'
    });

    return { message: "OTP sent successfully" , response, otp};
}


exports.verifyOTP = async (phoneNumber, otp) => {
    const otpRecord = await OTP.findOne({
        where: { 
          phone_number: phoneNumber 
        },
        order: [['createdAt', 'DESC']], // Sort by creation time, most recent first
        limit: 1 // Ensure only the latest record is returned
      });
    if (!otpRecord) throw new Error("OTP not found");

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new Error("Invalid OTP");
    }

    if (otpRecord.attempts >= 3) {
        throw new Error("Maximum attempts reached");
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return { message: "OTP verified successfully" };
}
