const express = require('express');
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001; // Changed to 3001 to avoid conflict with React dev server

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Use this for demo (persist in DB/session for real use)
const OTP_SECRET = speakeasy.generateSecret({ length: 20 }).base32;

// OTP generator function
function generateOTP() {
  return speakeasy.totp({
    secret: OTP_SECRET,
    encoding: 'base32',
    step: 300, // 5-minute validity
  });
}

// Send OTP to email
async function sendOTPEmail(email, otp) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'neutrino.ashutosh@gmail.com',
      pass: 'xsnh ibmq mknq nyet' // use App Passwords, not raw password
    }
  });

  let info = await transporter.sendMail({
    from: '"ComedyHub" <neutrino.ashutosh@gmail.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `
    <div style="max-width: 500px; margin: auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #9c27b0; color: white; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">ComedyHub</h2>
      <p style="margin: 5px 0 0;">Your Ultimate Comedy Universe</p>
    </div>
    <div style="padding: 20px; text-align: center;">
      <h3 style="color: #333;">🔐 One-Time Password (OTP)</h3>
      <p style="font-size: 18px; color: #555;">Use the following OTP to continue:</p>
      <div style="font-size: 32px; font-weight: bold; color: #222; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #888;">This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
    </div>
    <div style="background: #eeeeee; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      &copy; 2024 ComedyHub.in • Connecting you to the funniest shows and talents in town.
      <br><a href="https://comedyhub.in" style="color: #9c27b0; text-decoration: none;">Visit ComedyHub.in</a>
    </div>
  </div>
  `
  });

  console.log('Message sent: %s', info.messageId);
}

// API Routes
// Route to generate and send OTP
app.post('/api/generate-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = generateOTP();
  console.log('Generated OTP:', otp); // For testing

  try {
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

// OTP verification route
app.post('/api/verify-otp', (req, res) => {
  const { otp } = req.body;

  const verified = speakeasy.totp.verify({
    secret: OTP_SECRET,
    encoding: 'base32',
    token: otp,
    window: 1,
    step: 300, // Match with generation
  });

  res.json({ message: verified ? '✅ OTP is valid' : '❌ OTP is invalid' });
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  console.log(`Your OTP secret is: ${OTP_SECRET}`); // Log to test
});