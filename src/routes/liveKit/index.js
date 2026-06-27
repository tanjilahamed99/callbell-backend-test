const getLiveKit = require("../../api/v1/liveKit/getLiveKit");

const router = require("express").Router();

router.get("/get-token", getLiveKit);

module.exports = router;
