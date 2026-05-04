const express = require('express');
const Workout = require('../models/workout');
const router = express.Router();

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access workouts.');
  res.redirect('/login');
}

router.get('/workouts', requireAuth, async (req, res) => {
  const workouts = await Workout.find({ user: req.user._id }).sort({ workoutDate: -1 });
  res.render('workouts', { workouts });
});

router.get('/workout/new', requireAuth, (req, res) => {
  res.render('new-workout');
});

router.post('/workout', requireAuth, async (req, res) => {
  const { workoutType, duration, caloriesBurned, workoutDate, notes } = req.body;
  try {
    const workout = new Workout({
      workoutType: workoutType.trim(),
      duration: Number(duration),
      caloriesBurned: Number(caloriesBurned),
      workoutDate,
      notes: notes ? notes.trim() : '',
      user: req.user._id,
    });
    await workout.save();
    req.flash('success', 'Workout created successfully.');
    res.redirect('/workouts');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Unable to save workout. Please check your input.');
    res.redirect('/workout/new');
  }
});

router.get('/workouts/:id', requireAuth, async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
  if (!workout) {
    req.flash('error', 'Workout not found.');
    return res.redirect('/workouts');
  }
  res.render('workout-details', { workout });
});

router.get('/workouts/:id/edit', requireAuth, async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
  if (!workout) {
    req.flash('error', 'Workout not found.');
    return res.redirect('/workouts');
  }
  res.render('edit-workout', { workout });
});

router.put('/workouts/:id', requireAuth, async (req, res) => {
  const { duration, caloriesBurned, workoutDate, notes } = req.body;
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
  if (!workout) {
    req.flash('error', 'Workout not found.');
    return res.redirect('/workouts');
  }

  workout.duration = Number(duration);
  workout.caloriesBurned = Number(caloriesBurned);
  workout.workoutDate = workoutDate;
  workout.notes = notes ? notes.trim() : '';

  await workout.save();
  req.flash('success', 'Workout updated successfully.');
  res.redirect(`/workouts/${workout._id}`);
});

router.delete('/workouts/:id', requireAuth, async (req, res) => {
  await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  req.flash('success', 'Workout deleted successfully.');
  res.redirect('/workouts');
});

module.exports = router;
