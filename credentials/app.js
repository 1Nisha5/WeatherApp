const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

  // Check if the username or email already exists.
  const user = await User.findOne({
    username: username,
    email: email,
  });
  if (user) {
    res.status(409).send('The username or email already exists.');
    return;
  }

  // Create the user.
  const newUser = new User({
    username,
    email,
    password,
  });
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
      Hi <span class="math-inline">\{username\},
Please click on the following link to confirm your email address\:
https\://your\-domain\.com/api/users/confirm/</span>{newUser._id}

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
});

// Confirm email route.
app.get('/api/users/confirm/:id', async (req, res) => {
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
