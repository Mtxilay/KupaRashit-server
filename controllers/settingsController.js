const Setting = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne({ userId: req.user._id });
    console.log(settings);
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load settings", error: err });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updated = await Setting.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to save settings", error: err });
  }
};
