import userService from "../services/userService.js";
import asyncHanlder from "express-async-handler";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";


export const createNewUser = asyncHanlder(async (req, res) => {
    const user = await userService.createNewUser(req);
    
    res.status(201).json(
        new ApiResponse("Success", user, "User created successfully")
    );
});

// ==========================================================================================
// Login
// ==========================================================================================
export const login = asyncHanlder(async (req, res) => {
    const user = await userService.login(req);

    res.status(200).json(
        new ApiResponse("Success", user, "Logged in successfully")
    );
});

// ==========================================================================================
// Confirm user account
// ==========================================================================================
export const confirmAccount = asyncHanlder(async (req, res) => {
    await userService.confirmAccount(req.query);

    res.status(200).json(
        new ApiResponse("Success", null, "Account confirmed successfully.")
    );
});

// ==========================================================================================
// Find User By Id
// ==========================================================================================
export const getUserById = asyncHanlder(async (req, res) => {
    const user = await userService.getUserById(req);
    
    res.status(200).json(new ApiResponse("Success", user, "User found."));
});

// ==========================================================================================
// Change User Password
// ==========================================================================================
export const changePassword = asyncHanlder(async (req, res) => {
    await userService.changePassword(req);
    
    res.status(200).json(new ApiResponse("Success", {}, "Password changed successfully."));
});

// ==========================================================================================
// Update User Account
// ==========================================================================================
export const updateAccount = asyncHanlder(async (req, res) => {
    const user = await userService.updateAccount(req);
    
    res.status(200).json(new ApiResponse("Success", user, "Account updated successfully."));
});

