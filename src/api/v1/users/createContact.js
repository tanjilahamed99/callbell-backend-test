const Contact = require("../../../models/Contact");

const createContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Create a new contact in the database
    const newContact = new Contact({
      name,
      email,
      message,
    });
    await newContact.save();

    res.status(201).json({
      message: "Contact created successfully",
      success: true,
      data: newContact,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = createContact;
