import asyncHanlder from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import UserModel from "../../models/UserModel.js";
import { validationResult } from "express-validator";
import sendEmail from "../../utils/sendEmail.js";
import {
    generateAccountConfirmationEmail,
    generateEmailChangeConfirmationEmail,
    generatePasswordResetEmail
} from "../../utils/emailTemplates.js";
import {
    generateRandomString,
    generateAccountConfirmationLink,
    generateEmailChangeConfirmationLink,
    generateResetPasswordLink,
    validateUserId,
    generateValidationError,
    validateUsername,
    generateAccessAndRefereshTokens
} from "../../utils/helpers.js";
import { PROJECT_NAME } from "../../constants/index.js";


// =====================================================================================================================
// Register User
// =====================================================================================================================
export const registerUser = asyncHanlder(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(
            400,
            "The request body is missing required fields. Please provide all required information.",
            generateValidationError(errors.errors)
        );
    }

    const existingUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        const whichOneExists = existingUser.email === email ? "email" : "username";

        throw new ApiError(409, `A user already exists with the same ${whichOneExists}.`);
    }

    const createdUser = await UserModel.create({
        fullName,
        username,
        email,
        authentication: {
            password
        }
    });

    // Generate account confirmation token & link
    const confirmationToken = await generateRandomString();
    const confirmationLink = generateAccountConfirmationLink(createdUser._id.toString(), confirmationToken);

    // Store confirmationToken in db
    createdUser.authentication.confirmationToken = confirmationToken;
    await createdUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generateAccountConfirmationEmail(createdUser.fullName, confirmationLink);
    await sendEmail(createdUser.email, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

    const createdUserObject = createdUser.toObject();
    delete createdUserObject.authentication.resetPasswordToken;
    delete createdUserObject.authentication.password;
    delete createdUserObject.authentication.refreshToken;

    res.status(201).json(new ApiResponse(201, { user: createdUserObject }, "User registered successfully."));
});

// =====================================================================================================================
// Resend Account Confirmation Email
// =====================================================================================================================
export const resendAccountConfirmationEmail = asyncHanlder(async (req, res) => {
    const { userId } = req.query;

    if (!validateUserId(userId)) {
        throw new ApiError(400, "Invalid user ID. Please ensure you provide a valid userId as the query parameter.");
    }

    const currentUser = await UserModel.findById(userId).select(
        "+authentication.isAccountConfirmed +authentication.confirmationToken"
    );
    if (!currentUser) {
        throw new ApiError(404, "No user exists with the provided user ID.");
    }

    if (currentUser.authentication.isAccountConfirmed) {
        throw new ApiError(409, "Your account is already confirmed. Feel free to log in.");
    }

    // Generate account confirmation token & link
    const confirmationToken = await generateRandomString();
    const confirmationLink = generateAccountConfirmationLink(currentUser._id.toString(), confirmationToken);

    // Store confirmationToken in db
    currentUser.authentication.confirmationToken = confirmationToken;
    await currentUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generateAccountConfirmationEmail(currentUser.fullName, confirmationLink);
    await sendEmail(currentUser.email, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

    const userObject = currentUser.toObject();
    userObject.authentication = {
        confirmationToken
    };

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: userObject
            },
            `A new confirmation email has been sent to ${currentUser.email}. Please check your inbox.`
        )
    );
});

// =====================================================================================================================
// Login User
// =====================================================================================================================
export const loginUser = asyncHanlder(async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    const isUsernameValid = req.body.username && !errors.array().some(error => error.path === "username");
    const isEmailValid = req.body.email && !errors.array().some(error => error.path === "email");
    const isPasswordValid = req.body.password && !errors.array().some(error => error.path === "password");
    
    if (!isPasswordValid || (!isEmailValid && !isUsernameValid)) {
        
        // remove username validation error when email is present ....
        const filteredErrors = errors.errors.filter(item => {
          if(email?.length > 5){
            return item.path !== "username";
          }
          if (username){
            return item.path !== "email";
          }
          else{
            return item;
          }
        });
        
        throw new ApiError(
            400,
            "A username or email address & password is required to proceed.",
            generateValidationError(filteredErrors)
        );
    }

    const user = await UserModel.findOne({
        $or: [{ username }, { email }]
    }).select("+authentication.password +authentication.isAccountConfirmed +authentication.role");

    if (!user) {
        throw new ApiError(404, "Oops! We couldn't find a user with the provided email or username.");
    }
    
    if (user.authentication.role === "admin") {
      throw new ApiError(
        403,
        "Admin users cannot log in as regular users."
      );
    }
    
    if (!user.authentication.isAccountConfirmed) {
        throw new ApiError(
            403,
            "Account Not Confirmed. Your account needs to be confirmed. Please check your email inbox for the confirmation link."
        );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect username or password. Please try again.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedInUserObject = user.toObject();
    loggedInUserObject.authentication = {
      accessToken, refreshToken
    };

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUserObject,
            },
            "User Logged In Successfully."
        )
    );
});

// =====================================================================================================================
// Confirm User Account
// =====================================================================================================================
export const confirmAccount = asyncHanlder(async (req, res) => {
    const { userId, confirmationToken } = req.query;

    if (!validateUserId(userId)) {
        throw new ApiError(400, "Invalid user ID. Please ensure you provide a valid userId as the query parameter.");
    }

    if (!confirmationToken) {
        throw new ApiError(
            400,
            "Oops! Looks like you forgot to include necessary query parameters: userId & confirmationToken"
        );
    }

    const user = await UserModel.findById(userId).select(
        "+authentication.confirmationToken +authentication.isAccountConfirmed"
    );

    if (!user) {
        throw new ApiError(
            400,
            "Uh-oh! Account confirmation failed. Please ensure you've provided a valid userId and confirmationToken."
        );
    }

    if (user.authentication.isAccountConfirmed) {
        throw new ApiError(400, "Hey there! Your account is already confirmed. Feel free to log in.");
    }

    if (user.authentication.confirmationToken !== confirmationToken) {
        throw new ApiError(400, "Uh-oh! The account confirmation token provided is invalid.");
    }

    user.authentication.isAccountConfirmed = true;
    user.authentication.confirmationToken = "";
    await user.save();

    const userObject = user.toObject();
    delete userObject.authentication;

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: userObject
            },
            "Your account has been successfully confirmed."
        )
    );
});

// =====================================================================================================================
// Get Any User Public Profile By User Id
// =====================================================================================================================
export const getUserProfile = asyncHanlder(async (req, res) => {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
        throw new ApiError(
            400,
            "Uh-oh! It seems the userId is missing or invalid. Please provide a valid userId in the request path."
        );
    }

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new ApiError(404, "Oops! The provided userId is invalid. No user exists with the given userId.");
    }

    const userObject = user.toObject();
    delete userObject.authentication;
    delete userObject.email;

    res.status(200).json(
        new ApiResponse(
            200,
            {
                profile: userObject
            },
            "User profile found successfully."
        )
    );
});

// =====================================================================================================================
// Get Currently Logged In User
// =====================================================================================================================
export const getCurrentUser = asyncHanlder(async (req, res) => {
    const { _id } = req.user;

    const currentUser = await UserModel.findById(_id).select("+authentication.refreshToken");
    if (!currentUser) {
        throw new ApiError(404, "User does not exists.");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: currentUser
            },
            "User found successfully."
        )
    );
});

// =====================================================================================================================
// Change User Password
// =====================================================================================================================
export const changeCurrentPassword = asyncHanlder(async (req, res) => {
    const { _id } = req.user;
    const { oldPassword, newPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(
            400,
            "Hey there! To change your password, please provide both your current password and a new password.",
            generateValidationError(errors.errors)
        );
    }

    const currentUser = await UserModel.findById(_id).select("+authentication.password");

    if (!currentUser) {
        throw new ApiError(404, "Password change failed. Reason: User does not exist.");
    }

    const isPasswordCorrect = await currentUser.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password. Please try again with the correct password.");
    }

    currentUser.authentication.password = newPassword;
    const savedUser = await currentUser.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                  _id: savedUser?._id,
                  email: savedUser?.email,
                  username: savedUser?.username
                }
            },
            "Password changed successfully."
        )
    );
});

// =====================================================================================================================
// Request Reset Password
// =====================================================================================================================
export const requestResetPassword = asyncHanlder(async (req, res) => {
    const { email } = req.query;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(
            400,
            "Please provide a valid email address as the query parameter.",
            generateValidationError(errors.errors)
        );
    }

    const currentUser = await UserModel.findOne({ email }).select("+authentication.resetPasswordToken");

    if (!currentUser) {
        throw new ApiError(404, "No user found with that email address.");
    }

    const resetPasswordToken = await generateRandomString();
    const resetPasswordLink = generateResetPasswordLink(currentUser._id.toString(), resetPasswordToken);

    // Store resetToken in db
    currentUser.authentication.resetPasswordToken = resetPasswordToken;
    await currentUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generatePasswordResetEmail(currentUser.fullName, resetPasswordLink);
    await sendEmail(currentUser.email, `${PROJECT_NAME} Password Reset`, htmlEmailTemplate);

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            `An email has been sent to "${currentUser.email}" with further instructions.`
        )
    );
});

// =====================================================================================================================
// Reset Password
// =====================================================================================================================
export const resetPassword = asyncHanlder(async (req, res) => {
    const { userId, resetPasswordToken } = req.query;
    const { newPassword } = req.body;

    if (!validateUserId(userId) || !resetPasswordToken) {
        if (!userId || !resetPasswordToken) {
            throw new ApiError(
                400,
                "Invalid userId or resetPasswordToken. Please provide both userId and resetPasswordToken as the query parameter."
            );
        }
    }

    if (!newPassword || newPassword?.length < 6) {
        throw new ApiError(
            400,
            "New password is missing or invalid in the request body. New password must be at least 6 characters long."
        );
    }

    const currentUser = await UserModel.findById(userId).select(
        "+authentication.resetPasswordToken +authentication.password"
    );

    if (!currentUser) {
        throw new ApiError(404, "User not found. Please ensure your userId is valid.");
    }

    if (currentUser.authentication.resetPasswordToken !== resetPasswordToken) {
        throw new ApiError(
            401,
            "You might have clicked on a broken link. Please request a new link to reset your password."
        );
    }

    currentUser.authentication.password = newPassword;
    currentUser.authentication.resetPasswordToken = "";
    await currentUser.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: currentUser.generateSafeObject()
            },
            "Password reset successfully."
        )
    );
});

// =====================================================================================================================
// Refresh User Access Token
// =====================================================================================================================
export const refreshAccessToken = asyncHanlder(async (req, res) => {
    const { userId, refreshToken } = req.body;
    
    if(!validateUserId(userId)){
      throw new ApiError(
          400,
          "User id is missing or invalid. Please provide a valid user id in the request body."
        )
    }
    
    if(!refreshToken?.trim()){
      throw new ApiError(
          400,
          "Missing or invalid refreshToken. Please provide a valid refreshToken in the request body."
        )
    }
    
    const currentUser = await UserModel.findById(userId);
    
    if (currentUser.authentication.refreshToken !== refreshToken) {
        throw new ApiError(
            401,
            "The refresh token provided is invalid or has expired. Please login again to obtain a new refresh token."
        );
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(userId);
    currentUser.authentication.refreshToken = newRefreshToken;
    await currentUser.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                newAccessToken,
                newRefreshToken
            },
            "Access token refreshed successfully."
        )
    );
});

// =====================================================================================================================
// Update User Account Details or Profile
// =====================================================================================================================
export const updateAccountDetails = asyncHanlder(async (req, res) => {
    const { _id } = req.user;
    const { fullName, username } = req.body;
    
    if (!validateUsername(username?.trim())) {
        throw new ApiError(
            400,
            "Invalid username. The username must start with a letter and contain only letters, numbers, and underscores."
        );
    }
    
    if (!fullName?.trim() === "" && !username?.trim() === "") {
        throw new ApiError(400, "Please provide either a name or a username to update account details.");
    }

    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
        throw new ApiError(409, "This username is already in use. Please provide a different username.");
    }

    const currentUser = await UserModel.findById(_id);
    const updateFields = {};

    if (fullName?.trim() !== "") updateFields.fullName = fullName;
    if (username?.trim() !== "") updateFields.username = username;
    
    const updatedUser = await UserModel.findOneAndUpdate({ _id }, { $set: updateFields }, { new: true });

    const userObject = updatedUser.toObject();
    delete userObject.authentication;

    res.status(200).json(new ApiResponse(200, { user: userObject }, "Account updated successfully."));
});

// =====================================================================================================================
// Change Current Email Address
// =====================================================================================================================
export const changeCurrentEmail = asyncHanlder(async (req, res) => {
    const { email, password } = req.body;
    const { _id } = req.user;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(
            400,
            "Invalid email address or password. Please provide a valid email address & current password."
        );
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "This email address is already in use. Please provide a different email address.");
    }

    const currentUser = await UserModel.findById(_id).select("+authentication.password");
    const isPasswordCorrect = await currentUser.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password. Please provide correct password and try again.");
    }

    // generate a new token
    const confirmationToken = await generateRandomString();
    // generate a verification link for email change
    const confirmationLink = generateEmailChangeConfirmationLink(currentUser._id, confirmationToken);

    // send email
    const htmlEmailTemplate = generateEmailChangeConfirmationEmail(currentUser.fullName, confirmationLink);

    await sendEmail(email, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

    // store token & new email in db
    currentUser.authentication.changeEmailConfirmationToken = confirmationToken;
    currentUser.authentication.tempMail = email;

    await currentUser.save();
    
    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: currentUser.generateSafeObject()
            },
            `A confirmation email has been sent to ${email}. Please check your inbox and follow the instructions to confirm your email address.`
        )
    );
});

// =====================================================================================================================
// Confirm Email Change
// =====================================================================================================================
export const confirmChangeEmail = asyncHanlder(async (req, res) => {
    const { userId, confirmationToken } = req.query;

    if (!validateUserId(userId) || !confirmationToken?.trim() === "") {
        throw new ApiError(
            400,
            "Failed to update email due to missing or invalid user id or confirmation token. Check your request body & ensure all fields are included."
        );
    }

    const existingUser = await UserModel.findById(userId).select(
        "+authentication.tempMail +authentication.changeEmailConfirmationToken"
    );

    if (!existingUser) {
        throw new ApiError(404, "User not found. Please ensure that you have clicked on the correct link.");
    }

    if (
        existingUser.authentication.changeEmailConfirmationToken !== confirmationToken ||
        !existingUser.authentication.tempMail?.trim() === ""
    ) {
        throw new ApiError(
            401,
            "Sorry, you don’t have permission to update this email address. Please click on the correct link."
        );
    }

    // update email
    existingUser.email = existingUser.authentication.tempMail;

    // remove tempMail & confirmationToken from db
    existingUser.authentication.changeEmailConfirmationToken = "";
    existingUser.authentication.tempMail = "";

    const updatedUser = await existingUser.save({ new: true });

    const userObject = updatedUser.toObject();
    delete userObject.authentication;

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: userObject
            },
            "Great! Email changed successfully."
        )
    );
});
