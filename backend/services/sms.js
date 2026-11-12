// Replace the body of sendOtp with a real provider (MSG91, Twilio, Fast2SMS) before going live.
// Return true if the OTP was actually delivered by SMS.
exports.sendOtp = async (phone, code) => {
  console.log(`[DEV] OTP for ${phone}: ${code}`);
  return false;
};
