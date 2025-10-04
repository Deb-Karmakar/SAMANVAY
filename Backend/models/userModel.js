import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // --- Common Fields ---
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    // In userModel.js, add this field to the schema:
    agencyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agency' 
    },
    role: { 
        type: String, 
        required: true,
        enum: ['CentralAdmin', 'StateOfficer', 'ExecutingAgency'] 
    },
    isActive: { type: Boolean, default: false }, // Accounts are inactive until approved

    // --- Role-Specific Fields ---
    // For Central Admin
    designation: { type: String },
    
    // For State Officer & Executing Agency
    state: { type: String },

    // For Executing Agency
    district: { type: String },
    agencyName: { type: String },
    agencyType: { type: String },

}, { timestamps: true });

// Middleware to hash password BEFORE saving a new user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with the hashed password in the DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;