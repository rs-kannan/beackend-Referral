const express = require('express');
const {
  Register,
  Login,
  ForgetPassword,
  VerifyOTP,
  ResetPassword,
} = require('../Controller/UserController');

const router = express.Router();

router.route('/register').post(Register);
router.route('/login').post(Login);
router.route('/forget').post(ForgetPassword);
router.route('/verify').post(VerifyOTP);
router.route('reset').post(ResetPassword);

module.exports = router;