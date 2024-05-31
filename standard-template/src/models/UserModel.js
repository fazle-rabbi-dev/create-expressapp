import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 20,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: [3, "Username must be at least 3 digit"],
            maxlength: 20,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                message: "Invalid email format"
            }
        },
        authentication: {
            password: {
                type: String,
                required: true,
                minlength: [6, "Password must be at least 6 characters long."],
                trim: true,
                select: false
            },
            role: {
              type: String,
              default: "user",
              select: false
            },
            tempMail: {
                type: String,
                select: false
            },
            confirmationToken: {
                type: String,
                select: false
            },
            resetPasswordToken: {
                type: String,
                select: false
            },
            changeEmailConfirmationToken: {
                type: String,
                select: false
            },
            isAccountConfirmed: {
                type: Boolean,
                default: false,
                select: false
            },
            refreshToken: {
                type: String
            }
        }
    },
    { timestamps: true }
);

// =====================================================================================================================
// Hash user password before save them into DB
// =====================================================================================================================
userSchema.pre("save", async function (next) {
    if (!this.isModified("authentication.password")) return next();

    this.authentication.password = await bcrypt.hash(this.authentication.password, 10);
    next();
});

// ================================================
// Static method to find a user by email
// ================================================
userSchema.statics.findByEmail = async function (email) {
    try {
        // 'this' refers to the UserModel created using userSchema
        return await this.findOne({ email });
    } catch (error) {
        // Handle errors gracefully, perhaps log them
        console.error("Error finding user by email:", error);
        throw error;
    }
};

// =================================
// Instance methods
// =================================
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.authentication.password);
};

userSchema.methods.generateSafeObject = function () {
    return {
        _id: this._id,
        fullName: this.fullName,
        username: this.fullName,
        email: this.email,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

userSchema.methods.generateAccessToken = function (role = "user") {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function (role = "user") {
    return jwt.sign(
        {
            _id: this._id,
            role
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
