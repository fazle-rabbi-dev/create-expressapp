import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
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
        password: {
            type: String,
            required: true,
            minlength: 6,
            trim: true,
            select: false
        },
        authentication: {
            confirmationToken: { 
              type: String,
              select: false
            },
            isConfirmed: {
              type: Boolean,
              default: false,
              select: false
            }
        }
    },
    { timestamps: true }
);

// ================================================
// Usages of Pre & Post hook
// ================================================
userSchema.pre("save", async function (next) {
    // if(!this.isModified("password")) return next();

    // this.password = await bcrypt.hash(this.password, 10)
    next();
});

userSchema.post("save", function (doc) {
    // console.log('A new user was created:', doc);
});

userSchema.post("update", function (doc) {
    console.log("A user was updated:", doc);
});

userSchema.post("delete", function (doc) {
    console.log("A user was deleted:", doc);
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
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const UserModel = mongoose.model("User", userSchema);

// ================================================
// Encapsulating user actions within the model file
// ================================================
export const getUserByEmail = email => UserModel.findOne({ email });

export const createUser = values => {
    // Creating a new user model instance
    const newUser = new UserModel(values);

    // Saving the new user to the database and returning the user object
    return newUser.save().then(user => user.toObject());
};

export default UserModel;
