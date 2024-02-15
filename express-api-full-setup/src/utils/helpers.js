import mongoose from "mongoose";
import crypto from "crypto";
import { ACCOUNT_CONFIRMATION_ROUTE } from "./constants.js";

// Validate user input against Mongoose ObjectId
export function validateUserId(inputId) {
    if (!inputId || !inputId.trim()) return false;

    try {
        const mongooseObjectId = new mongoose.Types.ObjectId(inputId);
        return true;
    } catch (error) {
        return false;
    }
}

export const generateRandom = (length = 128) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                const token = buffer.toString("base64");
                resolve(token);
            }
        });
    });
};

export const generateAccountConfirmationLink = (userId, confirmationToken) => {
    const confirmationLink = `${ACCOUNT_CONFIRMATION_ROUTE}?userId=${userId}&token=${confirmationToken}`;
    return confirmationLink;
};
