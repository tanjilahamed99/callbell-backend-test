const createUser = require("../../api/v1/distributor/createUser");
const disDeleteUser = require("../../api/v1/distributor/deleteUser");
const disAllUsers = require("../../api/v1/distributor/getAllUsers");
const getPaymentUrl = require("../../api/v1/distributor/getPaymentUrl");
const subValidatePayment = require("../../api/v1/distributor/subValidatePayment");
const { distributorOnly } = require("../../middlewares/userValidate");

const router = require("express").Router();

router.post("/create-user", distributorOnly, createUser);
router.get("/users/:id", distributorOnly, disAllUsers);
router.delete("/users/:id", distributorOnly, disDeleteUser);


// payment
router.post("/sub/getPaymentUrl", distributorOnly, getPaymentUrl);
router.post('/sub/validatePayment', distributorOnly, subValidatePayment);

module.exports = router;
