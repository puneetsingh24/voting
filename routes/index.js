const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User').User;
const Movie = require('../models/Movie').Movie;
const ObjectId = require('mongoose').Types.ObjectId;
const FUNC = require(process.cwd() + '/functions/functions.js');

router.get('/', function (req, res, next) {
  if (req.session.user != undefined) {
    return res.redirect("/dashboard");
  }
  return res.render('login', { title: 'Login' });
});


router.get('/dashboard', FUNC.Auth, function (req, res, next) {
  Movie.find({ is_active: true }, function (err, movies) {
    res.render('dashboard', {
      title: 'Dashboard',
      logged_user: req.session.user,
      movies: movies,
      show_votes: (req.session.user.role_type == "admin"
        || req.session.user.is_voted) ? true : false
    });
  });
});


/* User login with bcrypt hashing */
router.all('/login', function (req, res) {

  if (req.method == 'GET') {
    return res.render('login', { title: 'Login' });
  } else if (req.method == 'POST') {
    if (req.body.email != '' && req.body.email != undefined) {

      // get plain password
      var password = req.body.password.trim();
      var email = req.body.email.trim()
      User.findOne({ 'email': email }, { password: 1, full_name: 1, role_type: 1, is_voted: 1 }, function (err, userInfo) {
        if (err) {
          console.log(err);
          return res.redirect("/login");
        } else {

          if (userInfo) {
            bcrypt.compare(password, userInfo.password, function (err, hash_result) {
              if (hash_result) {
                // user create session 
                req.session.regenerate(function () {
                  let logged_user = userInfo.toObject();
                  delete logged_user.password;
                  req.session.user = logged_user;
                  return res.redirect("/dashboard");
                })
              } else {
                req.flash('error', 'The credentials you supplied were not correct or did not grant access to this resource');
                return res.redirect("/login");
              }
            });
          } else {
            req.flash('error', 'The credentials you supplied were not correct or did not grant access to this resource');
            return res.redirect("/login");
          }
        }
      });
    } else {
      req.flash('error', 'The credentials you supplied were not correct or did not grant access to this resource');
      return res.redirect("/login");
    }
  }
});


/* User Logout */
router.all('/logout', function (req, res) {
  //console.log('logout function is called value:', req.session)
  if (req.session.user) {
    req.session.user.destroy; // Deletes the session in the database.
    req.session.user = null; // Deletes the cookie.
  }

  req.flash('success', 'Your are successfully logged out.');
  return res.redirect(urljoin(admin_url, 'login'));
});


router.get('/cast/:movie_id', FUNC.Auth, function (req, res, next) {

  let movie_id = req.params.movie_id;

  if (req.session.user.role_type == "admin") {
    req.flash('error', 'Admin cannot cast a vote');
    return res.redirect(urljoin(admin_url, 'dashboard'));
  } else {
    User.findOne({ _id: ObjectId(req.session.user._id) }, { is_voted: 1 }, function (err, userInfo) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect(urljoin(admin_url, 'dashboard'));
      } else {
        if (userInfo.is_voted) {
          req.flash('error', 'A user cannot vote twice, you have already voted');
          return res.redirect(urljoin(admin_url, 'dashboard'));
        }
        // We need to put Mongodb 4 transaction here so that both record will updated confirmed
        Movie.findOneAndUpdate({ _id: ObjectId(movie_id) }, { $inc: { votes: 1 } }, { new: true }, function (err, movieObj) {
          User.update({ _id: ObjectId(req.session.user._id) }, {
            $set: { is_voted: true }}, function(err, results) {
              req.session.user.is_voted = true;
              req.flash('success', 'You have casted your vote successfully to - ' + movieObj.title);
              return res.redirect(urljoin(admin_url, 'dashboard'));
          });
        });
      }
    });
  }
});




router.all('/forgot_password', function (req, res) {

  if (req.method == 'GET') {
    return res.render('forgot_password', { title: 'Forgot Password' });
  } else if (req.method == 'POST') {
    // Forgot password logic pending
  }
});


module.exports = router;