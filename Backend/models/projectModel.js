// Backend/models/projectModel.js
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String },
    component: { 
        type: String, 
        required: true,
        enum: ['Adarsh Gram', 'GIA', 'Hostel']
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending Approval', 'On Track', 'Delayed', 'Completed'],
        default: 'Pending Approval',
    },
    progress: { type: Number, required: true, default: 0 },
    budget: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },

    assignments: [{
        agency: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Agency',
            required: true
        },
        allocatedFunds: { 
            type: Number, 
            default: 0 
        },
        checklist: [{
            text: { type: String, required: true },
            completed: { type: Boolean, default: false },
            status: {
                type: String,
                enum: ['Not Started', 'Pending Review', 'Approved', 'Rejected'],
                default: 'Not Started'
            },
            proofImages: [{ type: String }], // URLs to uploaded images
            submittedAt: { type: Date },
            reviewedAt: { type: Date },
            reviewedBy: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User'
            },
            reviewComments: { type: String }
        }]
    }],
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;