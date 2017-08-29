const express = require('express');
const router = express.Router();
const User = require('../models/user');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

// Register
router.post('/register', (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
            res.json({success: false, msg: 'Failed to register user'});
        } else {
            res.json({success: true, msg: 'User registered'});
        }
    })
});

// Authenticate 
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if(!user) {
            return res.json({success:false, msg: 'User Not Found'});
        } else {
            User.comparePassword(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    const token = jwt.sign(user, config.secret, {
                        // expires in a week, after that, the user must login again
                        expiresIn: 604800,
                    });

                    // we don't send the user object because it contains the password
                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        user : {
                            id: user._id,
                            name: user.name,
                            username: user.username,
                            email: user.email
                        }
                    });
                } else {
                    return res.json({success:false, msg: 'Wrong Password'});
                }
            });
        }
    })
});

// Profile
// This is a protected route
// Any route that we want protected, we provide it with passport.authenticate('jwt', { session: false }) as second argument
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({
        user: req.user
    });
});

// Exporting Router
module.exports = router;