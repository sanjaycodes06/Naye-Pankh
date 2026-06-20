const User = require("../models/User.model");

/**
 * Generates a unique volunteer ID in format: NP-YYYY-XXXX
 */
const generateVolunteerId = async () => {
  const year = new Date().getFullYear();
  const prefix = `NP-${year}-`;

  // Count existing volunteers this year to get next number
  const count = await User.countDocuments({
    volunteerId: { $regex: `^${prefix}` },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}${sequence}`;
};

module.exports = generateVolunteerId;
