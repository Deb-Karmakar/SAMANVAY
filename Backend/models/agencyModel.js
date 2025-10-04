import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { 
        type: String, 
        required: true,
        enum: ['Implementing', 'Executing'] 
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
    // We can add more details later, like a reference to the user who created it
}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);
export default Agency;