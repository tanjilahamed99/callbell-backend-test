const getPageUrl = require("../../api/v1/paygic/getPageUrl");
const validatePayment = require("../../api/v1/paygic/Validate-payment");
const { protect } = require("../../middlewares/userValidate");

const router = require("express").Router();

router.post("/getPage", protect, getPageUrl);
router.post("/validatePayment", protect, validatePayment);

module.exports = router;
