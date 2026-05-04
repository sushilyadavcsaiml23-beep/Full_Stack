const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password, age, gender, fitnessGoal } = req.body;

  if (!username || !password || !age || !gender || !fitnessGoal) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/register');
  }

  try {
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      req.flash('error', 'Username already exists.');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username: username.trim(),
      password: hashedPassword,
      age: Number(age),
      gender,
      fitnessGoal: fitnessGoal.trim(),
    });

    await user.save();
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Unable to register. Please try again.');
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password.',
}), (req, res) => {
  res.redirect('/workouts');
});

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    req.flash('success', 'You have been logged out.');
    res.redirect('/login');
  });
});

module.exports = router;
