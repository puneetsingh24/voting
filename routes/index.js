const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User').User;
const FUNC = require(process.cwd() + '/functions/functions.js');

router.get('/', function (req, res, next) {
  if (req.session.user != undefined) {
    return res.redirect("/dashboard");
  }
  return res.render('login', { title: 'Login' });
});


router.get('/dashboard', FUNC.Auth, function (req, res, next) {
  req.app.locals.layout = '/layouts/table';
  res.render('dashboard', {
    title: 'Dashboard'
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
      User.findOne({ $and: [{ 'email': email }, { 'role_type': 'admin' }] }, { password: 1 }, function (err, userInfo) {
        if (err) {
          console.log(err);
          return res.redirect("/login");
        } else {

          if (userInfo) {
            bcrypt.compare(password, userInfo.password, function (err, hash_result) {
              if (hash_result) {
                // user create session 
                req.session.regenerate(function () {
                  req.session.user = userInfo;
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


module.exports = router;