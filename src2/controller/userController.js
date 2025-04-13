const userService = require("../service/userService")
const otpGererator = require("otp-generator")
const bcrypt = require("bcrypt")
const UserModel = require("../models/userModel")
const jwtProvider = require("../config/jwtProvider")

const getUserProfile = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];

    if (!jwt) {
      return res.status(401).send({ error: "token not found" });
    }

    // Extract userId from token and set it in req object
    try {
      const userId = jwtProvider.getUserIdFromToken(jwt);
      req.userId = userId;
      req.user = { id: userId }; // Set both for compatibility
    } catch (err) {
      return res.status(401).send({ error: "Invalid token" });
    }

    const user = await userService.getUserProfileByToken(jwt);

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers()
        return res.status(200).send(users)
    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.findUserById(userId);
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
}

const verifyUser = async (req, res, next) => {
  try {
      const { email } = req.method == "GET" ? req.query : req.body;

      // check the user existance
      let exist = await UserModel.findOne({ email });
      if(!exist) return res.status(404).send({ error : "Can't find User!"});
      next();
  } catch (error) {
      return res.status(404).send({ error: "Authentication Error"});
  }
}

const generateOTP = async (req, res) => {
  req.app.locals.OTP = await otpGererator.generate(6, {
    lowerCaseAlphabets: false, 
    upperCaseAlphabets: false, 
    specialChars: false
  });

  res.status(201).send({ code: req.app.locals.OTP });
};

const verifyOTP = async (req, res) => {
  const { code } = req.query;
  const localOTP = parseInt(req.app.locals.OTP);
  const receivedCode = parseInt(code);

  if (localOTP === receivedCode) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).send({ msg: "Verify Successfully " });
  }
  return res.status(400).send({ error: "Invalid OTP" });
};

const createResetSession = async (req, res) => {
  if(req.app.locals.resetSession){
    req.app.locals.resetSession = false;
    res.status(201).send({msg: "Access Granted."});
  } else {
    return res.status(440).send({msg: "Session Expired"});
  }
}

const resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession) return res.status(440).send({ error: "Session expired!" });

    const { email, password } = req.body;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).send({ error: "Email not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      await UserModel.updateOne({ email: user.email }, { password: hashedPassword });
      
      req.app.locals.resetSession = false; // Reset session
      return res.status(201).send({ msg: "Record Updated...!" });
    } catch (error) {
      return res.status(500).send({ error: "Error occurred: " + error.message });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
};

// Make both names available for this method
const updateUserProfile = async (req, res) => {
  try {
    // Get userId from token authentication
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    const { firstName, lastName, email } = req.body;
    const updatedUser = await userService.updateUserProfile(userId, { firstName, lastName, email });

    return res.status(200).send(updatedUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    const addressData = req.body;
    const updatedUser = await userService.addAddress(userId, addressData);
    
    return res.status(201).send(updatedUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    const addressId = req.params.id || req.params.addressId;
    const addressData = req.body;
    
    const updatedUser = await userService.updateAddress(userId, addressId, addressData);
    
    return res.status(200).send(updatedUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    const addressId = req.params.id || req.params.addressId;
    const updatedUser = await userService.deleteAddress(userId, addressId);
    
    return res.status(200).send(updatedUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers,
  getUserById,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
  verifyUser,
  updateUserProfile, // Changed from updateProfile to updateUserProfile
  updateProfile: updateUserProfile, // Alias for backward compatibility
  updateAddress,
  addAddress,
  deleteAddress
}