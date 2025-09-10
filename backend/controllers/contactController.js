import Contact from "../models/Contact.js";

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build query
    const query = { createdBy: req.user.id };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } }
      ];
    }

    // Add filters
    if (status) query.status = status;
    if (source) query.source = source;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name email"),
      Contact.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts"
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate("createdBy", "name email");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contact"
    });
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
export const createContact = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      company,
      tags,
      notes,
      customFields,
      source = "manual"
    } = req.body;

    // Validation
    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required"
      });
    }

    // Check if contact with same phone already exists for this user
    const existingContact = await Contact.findOne({
      phoneNumber,
      createdBy: req.user.id
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: "Contact with this phone number already exists"
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      company: company ? company.trim() : undefined,
      tags: tags || [],
      notes: notes ? notes.trim() : undefined,
      customFields: customFields || {},
      source,
      createdBy: req.user.id
    });

    const populatedContact = await Contact.findById(contact._id)
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: populatedContact
    });
  } catch (error) {
    console.error("Create contact error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating contact"
    });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      company,
      tags,
      notes,
      customFields,
      status
    } = req.body;

    // Find contact
    let contact = await Contact.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    // Check if phone number is being changed and if it already exists
    if (phoneNumber && phoneNumber !== contact.phoneNumber) {
      const existingContact = await Contact.findOne({
        phoneNumber,
        createdBy: req.user.id,
        _id: { $ne: req.params.id }
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: "Contact with this phone number already exists"
        });
      }
    }

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (phoneNumber) updateFields.phoneNumber = phoneNumber.trim();
    if (email !== undefined) updateFields.email = email ? email.toLowerCase().trim() : null;
    if (company !== undefined) updateFields.company = company ? company.trim() : null;
    if (tags) updateFields.tags = tags;
    if (notes !== undefined) updateFields.notes = notes ? notes.trim() : null;
    if (customFields) updateFields.customFields = customFields;
    if (status) updateFields.status = status;

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact
    });
  } catch (error) {
    console.error("Update contact error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating contact"
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully"
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting contact"
    });
  }
};

// @desc    Bulk import contacts
// @route   POST /api/contacts/bulk-import
// @access  Private
export const bulkImportContacts = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of contacts"
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (const contactData of contacts) {
      try {
        const { name, phoneNumber, email, company, notes } = contactData;

        if (!name || !phoneNumber) {
          results.errors.push({
            contact: contactData,
            error: "Name and phone number are required"
          });
          results.skipped++;
          continue;
        }

        // Check if contact already exists
        const existingContact = await Contact.findOne({
          phoneNumber: phoneNumber.trim(),
          createdBy: req.user.id
        });

        if (existingContact) {
          results.errors.push({
            contact: contactData,
            error: "Contact with this phone number already exists"
          });
          results.skipped++;
          continue;
        }

        await Contact.create({
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email ? email.toLowerCase().trim() : undefined,
          company: company ? company.trim() : undefined,
          notes: notes ? notes.trim() : undefined,
          source: "import",
          createdBy: req.user.id
        });

        results.imported++;
      } catch (error) {
        results.errors.push({
          contact: contactData,
          error: error.message
        });
        results.skipped++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Import completed. ${results.imported} contacts imported, ${results.skipped} skipped.`,
      data: results
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({
      success: false,
      message: "Error during bulk import"
    });
  }
};

export default {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  bulkImportContacts
};
