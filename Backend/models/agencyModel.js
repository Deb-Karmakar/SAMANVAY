// Backend/models/agencyModel.js
import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { 
        type: String, 
        required: true,
    },
    state: { type: String, required: true },
    district: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String, required: true },
    status: { 
        type: String, 
        default: 'Active',
        enum: ['Active', 'Onboarding', 'Inactive']
    },
}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);
export default Agency;