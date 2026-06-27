const changePassword = require("../../api/v1/auth/change-passowrd");
const checkUser = require("../../api/v1/auth/checkUser");
const login = require("../../api/v1/auth/login");
const register = require("../../api/v1/auth/register");
const sendOtp = require("../../api/v1/auth/sendOtp");
const verifyCode = require("../../api/v1/auth/verify-code");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check-user", checkUser);
router.post("/send-code", sendOtp);
router.post("/verify-code", verifyCode);
router.post("/change-password", changePassword);

module.exports = router;
