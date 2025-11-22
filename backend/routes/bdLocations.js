const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/divisions", async (req, res) => {
    console.log("Fetching BD divisions");
  try {
    const result = await axios.get("https://bdapis.com/api/v1.1/divisions");
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ success: false, message: "BD API failed" });
  }
});

router.get("/districts/:division", async (req, res) => {
    console.log("Fetching BD districts for division:", req.params.division);
  try {
    const div = req.params.division;
    const result = await axios.get(
      `https://bdapis.com/api/v1.1/division/${div}`
    );
    res.json(result.data);
  } catch {
    res.status(500).json({ success: false, message: "BD API failed" });
  }
});

router.get("/upazilas/:division", async (req, res) => {
    console.log("Fetching BD upazilas for division:", req.params.division);
  try {
    const div = req.params.division;
    const result = await axios.get(
      `https://bdapis.com/api/v1.2/division/${div}`
    );
    res.json(result.data);
  } catch {
    res.status(500).json({ success: false, message: "BD API failed" });
  }
});

module.exports = router;
