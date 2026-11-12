const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const asyncHandler = require('../utils/asyncHandler');
const { sendOtp } = require('../services/sms');
const { OTP_TTL_MINUTES, OTP_MAX_ATTEMPTS } = require('../config/constants');

const PHONE_RE = /^[6-9]\d{9}$/;
const hash = (phone, code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${phone}:${code}`).digest('hex');
const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email || '', phone: u.phone, role: u.role, addresses: u.addresses, createdAt: u.createdAt });

exports.sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!PHONE_RE.test(phone || '')) return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });

  const code = String(crypto.randomInt(100000, 1000000));
  await Otp.deleteMany({ phone });
  await Otp.create({ phone, codeHash: hash(phone, code), expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60000) });

  const delivered = await sendOtp(phone, code);
  const body = { message: 'OTP sent', expiresInMinutes: OTP_TTL_MINUTES };
  // Dev convenience only: never expose the OTP in production
  if (!delivered && process.env.NODE_ENV !== 'production') body.devOtp = code;
  res.json(body);
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, name } = req.body;
  if (!PHONE_RE.test(phone || '') || !/^\d{6}$/.test(otp || '')) {
    return res.status(400).json({ message: 'Enter your mobile number and the 6-digit OTP' });
  }

  const record = await Otp.findOne({ phone });
  if (!record) return res.status(400).json({ message: 'OTP expired. Request a new one' });
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await record.deleteOne();
    return res.status(429).json({ message: 'Too many wrong attempts. Request a new OTP' });
  }

  const ok = crypto.timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(hash(phone, otp)));
  if (!ok) {
    record.attempts += 1;
    await record.save();
    return res.status(400).json({ message: 'Incorrect OTP' });
  }
  await record.deleteOne();

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone, name: (name || '').trim() });
  else if (!user.name && name) { user.name = name.trim(); await user.save(); }

  res.json({ token: signToken(user), user: publicUser(user) });
});

exports.me = (req, res) => res.json({ user: publicUser(req.user) });

exports.updateProfile = asyncHandler(async (req, res) => {
  if (typeof req.body.name === 'string') req.user.name = req.body.name.trim().slice(0, 60);
  if (typeof req.body.email === 'string') req.user.email = req.body.email.trim() || undefined;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

exports.addAddress = asyncHandler(async (req, res) => {
  if (req.user.addresses.length >= 5) return res.status(400).json({ message: 'You can save up to 5 addresses. Remove one first' });
  const { label, line1, area, pincode, landmark } = req.body;
  req.user.addresses.push({ label: label || 'Home', line1, area, pincode, landmark });
  await req.user.save();
  res.status(201).json({ user: publicUser(req.user) });
});

exports.removeAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter((a) => String(a._id) !== req.params.addressId);
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});
