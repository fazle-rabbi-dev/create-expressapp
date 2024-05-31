import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { NoteModel } from "../models/NoteModel.js";

// Imagine A Note App

const isOwner = (req, res, next) => {
    try {
        const { noteId } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new ApiError(401, "Authorization header is missing");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Authorization token is missing");
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT secret is not defined in environment variables");
        }

        jwt.verify(token, secret, async (err, user) => {
            if (err) {
                throw new ApiError(401, "Unauthorized Access: Please log in to perform this operation.");
            }

            const existingNote = await NoteModel.findById(noteId);
            if (!existingNote) {
                throw new ApiError(404, "Note Note Found.");
            }

            if (existingNote.author !== user.id) {
                throw ApiError(401, "You do not have permission to update this note.");
            }

            req.user = user;
            next();
        });
    } catch (err) {
        console.error(`Authentication error: ${err.message}`);
        throw err;
    }
};

export default authMiddleware;
