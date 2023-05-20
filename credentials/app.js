const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Define the database connection string.
const MONGODB_URI = 'mongodb://localhost/mydb';

// Connect to the database.
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Define the schema for the users collection.
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    bcrypt: true,
  },
  twoFactorSecret: {
    type: String,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

// Create the users collection.
const User = mongoose.model('User', UserSchema);

// Define the routes.
const app = express();
app.use(bodyParser.json());

// Sign up route.
app.post('/api/users', async (req, res) => {
  // Validate the request body.
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).send('Invalid request body.');
    return;
  }

  try {
    // Check if the username or email already exists.
    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (existingUser) {
      res.status(409).send('The username or email already exists.');
      return;
    }

    // Create the user.
    const newUser = new User({
      username,
      email,
      password,
    });

    // Hash the password.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    newUser.password = hashedPassword;

    // Save the user to the database.
    await newUser.save();

    // Send an email confirmation.
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password',
      },
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Email Confirmation',
      text: `
        Hi ${username},

        Please click on the following link to confirm your email address:
        https://your-domain.com/api/users/confirm/${newUser._id}

        If you did not create this account, please ignore this email.
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred while sending the email confirmation.');
        return;
      }

      res.status(201).send('User created successfully.');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while creating the user.');
  }
});

// Confirm email route.
app.get('/api/users/confirm/:id', async (req, res) => {
  try {
    // Get the user.
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      res.status(404).send('The user does not exist.');
      return;
    }

    // Check if the user has already confirmed their email address.
    if (user.confirmed) {
      res.status(400).send('The user has already confirmed their email address.');
      return;
    }

    // Update the user's confirmation status.
    user.confirmed = true;
    await user.save();

    res.status(200).send('Email confirmed successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while confirming the email.');
  }
});

// Forgot password route.
app.post('/api/users/forgot-password', async (req, res) => {
  // Validate the request body.
  const { email } = req.body;
  if (!email) {
    res.status(400).send('Invalid request body.');
    return;
  }

  try {
    // Find the user by email.
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    // Generate a unique reset token and save it to the user.
    const resetToken = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
    user.resetToken = resetToken;
    await user.save();

    // Send an email with the reset token.
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password',
      },
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `
        Hi ${user.username},

        To reset your password, click on the following link:
        https://your-domain.com/api/users/reset-password/${resetToken}

        This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred while sending the password reset email.');
        return;
      }

      res.status(200).send('Password reset email sent successfully.');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing the forgot password request.');
  }
});

// Reset password route.
app.post('/api/users/reset-password/:token', async (req, res) => {
  // Validate the request body.
  const { password } = req.body;
  if (!password) {
    res.status(400).send('Invalid request body.');
    return;
  }

  try {
    // Verify the reset token.
    const { token } = req.params;
    const decodedToken = jwt.verify(token, 'your_secret_key');

    // Find the user by the decoded token.
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    // Update the user's password.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();

    res.status(200).send('Password reset successful.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while resetting the password.');
  }
});

// Two-factor authentication route.
app.post('/api/users/two-factor-auth', async (req, res) => {
  // Validate the request body.
  const { userId, method } = req.body;
  if (!userId || !method) {
    res.status(400).send('Invalid request body.');
    return;
  }

  try {
    // Find the user.
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    // Generate a unique two-factor secret.
    const twoFactorSecret = generateTwoFactorSecret();

    // Store the two-factor secret in the user document.
    user.twoFactorSecret = twoFactorSecret;
    await user.save();

    // Return the two-factor secret to the client.
    res.status(200).json({ twoFactorSecret });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while setting up two-factor authentication.');
  }
});

// Helper function to generate a two-factor secret.
function generateTwoFactorSecret() {
  // Generate a random 32-character secret.
  const secret = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');

  return secret;
}

// Start the server.
app.listen(3000, () => {
  console.log('Server is running on port 3000.');
});
