const express = require("express");
const router = express.Router();
const { getSection } = require("../controllers/homepageController");

router.get("/:type", getSection);

module.exports = router;
