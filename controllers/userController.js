const User = require('../models/user');
var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const Role = require('../middleware/roles');
const nodemailer = require("nodemailer");



exports.getById = async (req, res) => {
  User.findById(mongoose.Types.ObjectId(req.params.id)
  , (err, User) => {
    res.status(200).json(User);
    return;
  });
};   

exports.getByEmail =async (req,res)=>{
  try {
    const user = await User.find({ email: req.body.email });
  
    res.status(200).json(user);
} catch (error) {
    res.status(500).json({ message: error.message });
}
}


exports.createUser = async (req, res) => {

  const { f_name, username,email, password } = req.body;

  const verifUser = await User.findOne({ email });
  if (verifUser) {
    res.status(403).send({ message: "User already exists !" });
  } else {

    const newUser = new User();
    mdpEncrypted = await bcrypt.hash(password, 10);
    newUser.f_name = f_name;
    newUser.username=username;
    newUser.email = email;
    newUser.password = mdpEncrypted;
    newUser.isVerified = false;
    //newUser.Avatar =  "http://localhost:3001/" + req.file.path
    const token = jwt.sign({ _id: newUser._id }, "token_secret!!", {
      expiresIn: "60000", // in Milliseconds (3600000 = 1 hour)
    });

    sendConfirmationEmail(email, token);

    newUser.save();
    res.status(201).json({ newUser });

  }
}

exports.updateUser = async (req, res) => {
  const user = new User({
    _id: req.params.id,
    ...req.body
  });
  User.updateOne({ _id: req.params.id }, user).then(
    () => {
      res.status(201).json({
        message: 'user updated successfully!',
        user
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
}


function makeTokenForLogin(_id) {
  return jwt.sign({ _id: _id }, "token_secret", {
    expiresIn: "99999999999", // in Milliseconds (3600000 = 1 hour)
  });
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {

    // token creation
    const token = makeTokenForLogin(user._id)

    if (!user.isVerified) {
      res.status(201).send({ message: "email not verified" });
    } else {
      res.status(200).send({ token, UserId: user._id , email:user.email,username:user.username,f_name:user.f_name});
    }

  } else {
    res.status(403).send({ message: "email or password incorrect" });
  };
}


//fuctions
async function sendConfirmationEmail(email, token) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'eventado344@gmail.com',
      pass: 'eventado123!'
    }
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const link = token;

  const mailOptions = {
    from: 'eventado344@gmail.com',
    to: email,
    subject: 'Confirm your email',
    html: "<h3>Please confirm your email using this verification : </h3><h1><p>" + link[0] + link[1] + link[2] + link[3] + "</p></h1>" + link
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


exports.confirmation = async (req, res) => {
  var tokenValue;
  try {
    tokenValue = jwt.verify(req.params.token, "token_secret");
  } catch (e) {
    return res.status(400).send({ message: 'The confirmation link expired, please reverify.' });
  }

  User.findById(tokenValue._id, function (err, user) {
    if (!user) {
      return res.status(401).send({ message: 'User not found, please sign up.' });
    }
    else if (user.isVerified) {
      return res.status(200).send({ message: 'This mail has already been verified, please login' });
    }
    else {
      user.isVerified = true;
      user.save(function (err) {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        else {
          return res.status(200).send({ message: 'Your account has been verified' });
        }
      });
    }
  });
}

exports.resendConfirmation = async (req, res) => {
  const user = await User.findOne({ "email": req.body.email });

  if (user) {
    // token creation
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.token_secret, {
      expiresIn: "60000", // in Milliseconds (3600000 = 1 hour)
    });

    sendConfirmationEmail(req.body.email, token);

    res.status(200).send({ "message": "Confirmation email has been sent to " + user.email })
  } else {
    res.status(404).send({ "message": "User not found" })
  }
};

exports.forgotPassword = async (req, res) => {
  User.findOne({ email: req.body.email })
    .then(User => {
      if (!User) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });
      //Generate and set password reset token
      User.generatePasswordReset();
      // Save the updated user object
      User.save()
        .then(User => {
          // send email
          let token = User.resetPasswordToken;
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'eventado344@gmail.com',
              pass: 'eventado123!'
            }
          });

          const mailOptions = {
            from: 'eventado344@gmail.com',
            to: User.email,
            subject: 'Reset your password',
            html: "<h2>Use this as your reset code : " + token + "</h2>"
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          res.status(200).json({ token: token });
        })
        .catch(err => res.status(500).json({ message: err.message }));
    })
    .catch(err => res.status(500).json({ message: err.message }));
};



exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  newEncryptedPassword = await bcrypt.hash(password, 10);

  let user = await User.findOneAndUpdate(
    { email: email },
    {
      $set: {
        password: newEncryptedPassword
      }
    }
  );

  res.status(200).json({ user });
}


exports.makeFollow = async (req, res, next) => {
  if (!req.body) {

    return res.status(422).json({ message: 'Follow id is required' })
  }

  const checkAvailable = await User.findOne({ _id: req.params.id }).exec()
  if (!checkAvailable) {
    return res.json({ message: 'Not found' })
  }


  let checkFollowingAvailable = await checkAvailable.following.find(id => id == req.body._id)
  if (checkFollowingAvailable) {
    return res.json({ message: 'Already following' })
  }


  const createFollowing = await User.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { following: req.body._id } },
    { new: true }
  ).exec()

  const createFollower = await User.findOneAndUpdate(
    { _id: req.body._id },
    { $push: { followers: req.params.id } },
    { new: true }
  ).exec()

  if (createFollowing && createFollower) {
    return res.status(201).json({ message: 'success' })
  }
}

exports.getFollowers = async (req, res) => {

  User.findById(mongoose.Types.ObjectId(req.params.id)
    , (err, User) => {
      res.json(User.followers);
      return;
    });
}

exports.getFollowing = async (req, res) => {

  User.findById(mongoose.Types.ObjectId(req.params.id)
    , (err, User) => {
      res.json(User.following);
      return;
    });
}