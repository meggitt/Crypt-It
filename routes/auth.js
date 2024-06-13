const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const File = require('../models/File');

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER, // Set your email user in environment variables
    pass: process.env.EMAIL_PASS  // Set your email password in environment variables
  }
});

// Root Route - Render Register Page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

// Register Route
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

// Upload Route - Redirect to login if user is not logged in
router.get('/upload', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

// Handle Registration
router.post('/register', async (req, res) => {
  const { firstName, lastName, password, confirmPassword } = req.body;
  let { email } = req.body;

  // Convert email to lowercase
  email = email.toLowerCase();

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.redirect('/login?alreadyRegistered=true');
  }

  // Generate OTP
  const OTP = (Math.floor(100000 + Math.random() * 900000)).toString();

  // Send OTP email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OTP for registration at Crypt-it',
    text: `Hello,\n\nPlease enter the below OTP to register:\nYour OTP is: ${OTP}\n\nThanks,\nYour Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: inset 0 0 0 2px #212931; background-color: #212931; color: white">
        <div style="text-align: center; padding: 10px 0; color: #333">
          <h1 style="color: white">Crypt - It</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; color: black">
          <h2>Hello,</h2>
          <p>Please enter the below OTP to register:</p>
          <div style="padding: 10px; background-color: #e9ecef; border: 1px solid #ddd; display: inline-block;">
            <strong style="font-size: 24px; color: #d9534f;">${OTP}</strong>
          </div>
          <p style="color: red">This OTP is valid for 10 minutes.</p>
          <p>Thanks.</p>
        </div>
        <div style="text-align: center; padding: 20px 0; font-size: 12px; color: #888;">
          <p>Crypt-it by Your Team</p>
          <p><a href="https://crypt-it.example.com" style="color: #007bff;">Visit our website</a></p>
        </div>
      </div>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending OTP');
    } else {
      console.log('Email sent: ' + info.response);
      // Set OTP in user session for verification
      req.session.OTP = OTP;
      req.session.otpExpires = Date.now() + 600000; // OTP expires in 10 mins
      // Store user details temporarily in session
      req.session.tempUser = { firstName, lastName, email, password };
      res.redirect('/otp'); // Redirect to OTP verification page
    }
  });
});

// Login Route
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Handle Login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    let { email } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      // Check if the user is already logged in from this browser
      if (req.session.isLoggedIn) {
        return res.redirect('/dashboard?alreadyLoggedIn=true');
      }

      // Set session variables
      req.session.isLoggedIn = true;
      req.session.user = { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email };

      res.redirect('/dashboard');
    } else {
      res.redirect('/login?loginFailed=true');
    }
  } catch (err) {
    res.redirect('/login?loginError=true');
    console.log(err);
  }
});

// OTP Verification Route
router.get('/otp', (req, res) => {
  if (!req.session.OTP) {
    return res.redirect('/register');
  }
  if (!req.session.tempUser) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../views/otp.html'));
});

// Dashboard Route - List user files and shared files
router.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userEmail = req.session.user.email;
  try {
    const userFiles = await File.find({ userId: req.session.user.id }).lean();
    const sharedFiles = await File.find({ sharedWithEmails: userEmail }).populate('userId', 'email').lean();

    res.render('dashboard', {
      user: req.session.user,
      userFiles: userFiles,
      sharedFiles: sharedFiles
    });
  } catch (err) {
    console.log(err);
    return res.redirect('/login?loginError=true');
  }
});

// Retrieve and decrypt file content
router.get('/file/:id', async (req, res) => {
  const fileId = req.params.id;
  const key = req.query.key; // Get the decryption key from the query

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send('File Not Found');
    }

    // Decrypt the file content
    const algorithm = 'aes-256-cbc';
    const iv = Buffer.from(file.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);
    let decrypted = decipher.update(file.content, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    res.send(decrypted);
  } catch (err) {
    console.log(err);
    if (err.code === 'ERR_OSSL_EVP_WRONG_FINAL_BLOCK_LENGTH' || err.message.includes('bad decrypt')) {
      return res.status(400).send('Decryption failed: Invalid key');
    }
    return res.status(500).send('An error occurred while retrieving the file');
  }
});

// API to get the current user's information
router.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Handle Logout
router.get('/logout', async (req, res) => {
  req.session.isLoggedIn = false;
  req.session.user = null;

  req.session.destroy(err => {
    if (err) {
      return res.redirect('/login?loginError=true');
    }
    res.redirect('/login');
  });
});

// OTP verification for registration
router.post('/otp', async (req, res) => {
  const { otp } = req.body;
  const storedOTP = req.session.OTP;
  const otpExpires = req.session.otpExpires;

  if (otp !== storedOTP || Date.now() > otpExpires) {
    return res.redirect('/otp?registrationFailedOtp=true');
  }

  // OTP verified, proceed with registration
  const { firstName, lastName, email, password } = req.session.tempUser;
  delete req.session.tempUser;
  delete req.session.OTP;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ firstName, lastName, email, password: hashedPassword });
  try {
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Registration Successful at Crypt-it',
      text: `Hello ${user.firstName},\n\nWelcome to Crypt-it. Thank you for registering.\n\nThanks.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: inset 0 0 0 2px #212931; background-color: #212931; color: white">
          <div style="text-align: center; padding: 10px 0; color: #333">
            <h1 style="color: white">Crypt - It</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; color: black">
            <h2>Hello ${user.firstName},</h2>
            <p>Welcome to Crypt-it. Thank you for registering.</p>
            <p>Thanks.</p>
          </div>
          <div style="text-align: center; padding: 20px 0; font-size: 12px; color: #888;">
            <p>Crypt-it by Your Team</p>
            <p><a href="https://crypt-it.example.com" style="color: #007bff;">Visit our website</a></p>
          </div>
        </div>`
    };
    transporter.sendMail(mailOptions);
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register?registrationFailedDb=true');
  }
});

module.exports = router;
