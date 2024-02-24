const User = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//OTP Declare
var OTP;

//Register user
const Register = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password || !pic) {
      return res
        .status(200)
        .json({ status: false, message: 'Please fill the Details' });
    }
    let userExist = await User.findOne({ email });

    if (userExist) {
      return res
        .status(200)
        .json({ status: false, message: 'User already Regsitered' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        pic,
      });
      res.status(201).json({ message: 'Register Successfully', user });
    }
  } catch (error) {
    return res.status(200).json({
      status: false,
      message: 'Something went wrong in register',
      error,
    });
  }
};

//Login User
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(200)
        .json({ status: false, message: 'Please fill the Details' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ status: false, message: 'User Not Found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: 'Invlid username or password',
      });
    } else {
      const token = await jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: '30d',
        }
      );
      return res.status(200).json({
        message: 'Login Successfully',
        name: user.name,
        email: user.email,
        pic: user.pic,
        token,
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: false,
      message: 'Something went wrong in Login',
      error,
    });
  }
};

const ForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET);
    OTP = Math.floor(1000 + Math.random() * 9000);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'gowthampostbox30@gmail.com',
          pass: process.env.MAIL_KEY,
        },
      });

      var mailOptions = {
        from: 'gowthampostbox30@gmail.com',
        to: existingUser.email,
        subject: `Welcome from Mothers Recipe ${existingUser.name}`,
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
        </head>
        <body>
        <h3>Hi ${existingUser.name},</h3> 
        <h3>You can Reset Your Password using Below OTP</h3>
         <h1>${OTP}</h1>
         <h3>Happy Cooking 🍪 Mother's Recepie</h3>
         <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0WHULTTwC0Jv6LKKzuWVNpabSm6WfTYgJ1qunm_5CROShy12liRHNLU7ismj6fdukyfs&usqp=CAU' width:"200px" height:"200px"/>
        </body>
        </html>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return res
            .status(205)
            .json({ status: false, message: 'Error in Sending OTP' });
        } else {
          return res.status(201).json({
            status: true,
            message: 'OTP Sended SuccessFully',
            data: token,
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: 'Account not Exist!!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const VerifyOTP = async (req, res) => {
  const { UserOTP } = req.body;
  try {
    if (UserOTP == OTP) {
      res.status(200).json({ status: true, message: 'OTP is Verified' });
    } else {
      res.status(200).json({ status: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(404).json({ message: '404 Page not Found' });
  }
};

const ResetPassword = async (req, res) => {
  const { password, confirmpassword, token } = req.body;
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const email = verify.email;

    if (password === confirmpassword) {
      const hashedpassword = await hashedPassword(password);
      await User.updateOne(
        {
          email: email,
        },
        {
          $set: {
            password: hashedpassword,
          },
        }
      );
      res.status(201).json({ status: true, message: 'Password Updated!!' });
    } else {
      res
        .status(200)
        .json({ status: false, message: 'Password should be same!!' });
    }
  } catch (error) {
    res.status(200).json({ status: false, message: 'Password reset failed' });
  }
};

module.exports = { Register, Login, ForgetPassword, VerifyOTP, ResetPassword };