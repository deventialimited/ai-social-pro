const mongoose = require('mongoose');

// Define the Domain schema with user reference
const domainSchema = new mongoose.Schema({
    client_email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    clientWebsite: {
        type: String,
        trim: true
    },
    clientName: {
        type: String,
        trim: true
    },
    clientDescription: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    niche: {
        type: String,
        trim: true
    },
    colors: {
        type: String,
        trim: true
    },
    siteLogo: {
        type: String, // URL of the logo
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        index: true // Ensures efficient querying
    }
}, {
    timestamps: true
});

// Method to get color array
domainSchema.methods.getColorArray = function() {
    return this.colors.split(', ').map(color => color.trim());
};

// Create and export the model
const Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;
