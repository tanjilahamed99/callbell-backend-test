const createContact = require("../../api/v1/users/createContact");
const getLiveKitData = require("../../api/v1/users/getLiveKit");
const getMyData = require("../../api/v1/users/getMyData");
const getUserData = require("../../api/v1/users/getUser");
const getWebsiteData = require("../../api/v1/users/getWebsiteData");
const updateUserData = require("../../api/v1/users/updateUserData");
const saveFcmToken = require("../../api/v1/users/saveFcmToken");
const { protect } = require("../../middlewares/userValidate");

const router = require("express").Router();

router.put("/update/:userId", protect, updateUserData);
router.get("/myData/:userId", protect, getMyData);
router.get("/get/:userId", getUserData);
router.get("/website", getWebsiteData);
router.post("/contact", createContact);
router.get("/liveKit", getLiveKitData);
router.post("/save-fcm-token", saveFcmToken);

module.exports = router;
