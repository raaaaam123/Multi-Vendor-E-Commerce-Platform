import Address from "../models/Address.js";

const REQUIRED_FIELDS = [
  "fullName",
  "phone",
  "addressLine1",
  "city",
  "postalCode",
];

const validateAddressFields = (body) => {
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || !String(body[field]).trim()) {
      return `${field} is required`;
    }
  }
  if (!/^[0-9+\-\s()]{7,20}$/.test(String(body.phone).trim())) {
    return "Please provide a valid phone number";
  }
  return null;
};

const unsetOtherDefaults = async (userId, exceptId = null) => {
  const filter = { user: userId, isDefault: true };
  if (exceptId) filter._id = { $ne: exceptId };
  await Address.updateMany(filter, { $set: { isDefault: false } });
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load addresses",
    });
  }
};

const createAddress = async (req, res) => {
  try {
    const invalid = validateAddressFields(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const isDefault = req.body.isDefault === true || existingCount === 0;

    if (isDefault) {
      await unsetOtherDefaults(req.user._id);
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2 || "",
      city: req.body.city,
      state: req.body.state || "",
      postalCode: req.body.postalCode,
      country: req.body.country || "India",
      isDefault,
    });

    return res.status(201).json({ success: true, address });
  } catch (error) {
    console.error("Create address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create address",
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const invalid = validateAddressFields(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }

    const makeDefault = req.body.isDefault === true;

    if (makeDefault) {
      await unsetOtherDefaults(req.user._id, address._id);
    }

    address.fullName = req.body.fullName.trim();
    address.phone = req.body.phone.trim();
    address.addressLine1 = req.body.addressLine1.trim();
    address.addressLine2 = req.body.addressLine2?.trim() || "";
    address.city = req.body.city.trim();
    address.state = req.body.state?.trim() || "";
    address.postalCode = req.body.postalCode.trim();
    address.country = req.body.country || "India";
    address.isDefault = makeDefault;
    await address.save();

    return res.status(200).json({ success: true, address });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (address.isDefault) {
      const nextDefault = await Address.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await unsetOtherDefaults(req.user._id, address._id);
    address.isDefault = true;
    await address.save();

    return res.status(200).json({ success: true, address });
  } catch (error) {
    console.error("Set default address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};

export {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};