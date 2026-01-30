const Contact = require("../../../models/Contact");

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json({
      success: true,
      message: "Contacts retrieved successfully",
      data: contacts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error retrieving contacts", success: false });
  }
};

module.exports = getAllContacts;