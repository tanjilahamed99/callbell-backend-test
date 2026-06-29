const addCredit = require("../../api/v1/admin/addCredit");
const addWebsiteData = require("../../api/v1/admin/addWebisteData");
const deleteUser = require("../../api/v1/admin/deleteUser");
const getAllContacts = require("../../api/v1/admin/getAllContacts");
const getAllUsers = require("../../api/v1/admin/getAllUsers");
const getDistributors = require("../../api/v1/admin/getDistributors");
const getLiveKit = require("../../api/v1/admin/getLiveKit");
const getPaygic = require("../../api/v1/admin/getPaygic");
const setLiveKit = require("../../api/v1/admin/setLiveKit");
const setPaygic = require("../../api/v1/admin/setPaygic");
const updateDistributorStatus = require("../../api/v1/admin/updateDistributorStatus");
const { adminOnly } = require("../../middlewares/userValidate");

const router = require("express").Router();

router.get("/users/:id/:email", adminOnly, getAllUsers);
router.get("/getAllUsers", getAllUsers);

router.delete("/user/delete/:id/:email/:userId", adminOnly, deleteUser);

// website data related
router.post("/website/add/:id/:email", adminOnly, addWebsiteData);

// paygic
router.get("/paygic/:id/:email", adminOnly, getPaygic);
router.put("/paygic/set/:id/:email", adminOnly, setPaygic);

// razorpay
router.get("/paygic/:id/:email", adminOnly, getPaygic);
router.put("/paygic/set/:id/:email", adminOnly, setPaygic);


// contact
router.get("/contacts/:id/:email", adminOnly, getAllContacts);

// livekit
router.put("/livekit/set/:id/:email", adminOnly, setLiveKit);
router.get("/livekit/:id/:email", adminOnly, getLiveKit);

// credit
router.post("/credit/add/:userId/:userEmail", adminOnly, addCredit);

// distributor routes
router.get("/distributors/get/all", adminOnly, getDistributors);
router.put("/distributor/update/status/:userId", adminOnly, updateDistributorStatus);

module.exports = router;
