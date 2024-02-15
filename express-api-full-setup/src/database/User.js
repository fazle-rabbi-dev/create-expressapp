import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";
import sendEmail from "../utils/sendEmail.js";
import { generateAccountConfirmationEmail } from "../utils/emailTemplates.js";
import {
    generateRandom,
    generateAccountConfirmationLink
} from "../utils/helpers.js";
import { PROJECT_NAME } from "../utils/constants.js";


// ==========================================================================================
// Create User Account
// ==========================================================================================
const createNewUser = async userData => {
    const { username, email } = userData;

    const existingUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        const whichOneExists =
            existingUser.email === email ? "email" : "username";

        throw {
            status: 400,
            message: `A user already exists with the same ${whichOneExists}.`
        };
    }

    // Create user in db
    const createdUser = await new UserModel(userData).save();

    // Generate confirmation link
    const confirmationToken = await generateRandom();
    const confirmationLink = generateAccountConfirmationLink(
        createdUser._id.toString(),
        confirmationToken
    );

    // Store confirmationToken in db
    createdUser.authentication.confirmationToken = confirmationToken;
    await createdUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generateAccountConfirmationEmail(
        createdUser.name,
        confirmationLink
    );
    await sendEmail(
        createdUser.email,
        `${PROJECT_NAME} Account confirmation`,
        htmlEmailTemplate
    );

    const userObject = createdUser.toObject();
    delete userObject.password;
    delete userObject.authentication;

    return userObject;
};

// ==========================================================================================
// Login
// ==========================================================================================
const login = async ({ username, email, password }) => {
    const user = await UserModel.findOne({
        $or: [{ username }, { email }]
    }).select("+password +authentication.isConfirmed");

    if (!user) {
        throw new CustomError(404, "User does not exist.");
    }

    if (!user.authentication.isConfirmed) {
        throw new CustomError(
            403,
            "Account Not Confirmed. Your account needs to be confirmed. Please check your email inbox for the confirmation link."
        );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new CustomError(401, "Invalid user credentials.");
    }

    const payload = {
        _id: user._id,
        username: user.username,
        email: user.email
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });

    const userObject = user.toObject();
    userObject.accessToken = accessToken
    delete userObject.password;
    delete userObject.authentication;
    
    return userObject;
};

// ==========================================================================================
// Confirm User Account
// ==========================================================================================
const confirmAccount = async (userId, token) => {
    const user = await UserModel.findById(userId).select(
        "+authentication.confirmationToken +authentication.isConfirmed"
    );

    if (!user) {
        throw {
            status: 400,
            message:
                "Account confirmation failed.Please provide valid userId & token"
        };
    }

    if (user.authentication.isConfirmed) {
        throw {
            status: 400,
            message: "Account already confirmed."
        };
    }

    user.authentication.isConfirmed = true;
    user.authentication.confirmationToken = "";
    await user.save();

    return { isConfirmed: true };
};

// ==========================================================================================
// Find User By Id
// ==========================================================================================
const getUserById = async userId => {
    const user = await UserModel.findById(userId);
    return user;
};

// ==========================================================================================
// Change User Password
// ==========================================================================================
const changePassword = async (oldPassword, newPassword, req) => {
    const user = await UserModel.findById(req?.user?._id).select("+password");

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
        throw new CustomError(
            400,
            "The old password provided is incorrect. Please verify the old password and try again."
        );
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    user.password = hash;
    await user.save();
};

// ==========================================================================================
// Update User Account
// ==========================================================================================
const updateAccount = async (req, name) => {
    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name: name
            }
        },
        {
            new: true
        }
    );

    return user;
};

export default {
    createNewUser,
    login,
    confirmAccount,
    getUserById,
    changePassword,
    updateAccount
};
