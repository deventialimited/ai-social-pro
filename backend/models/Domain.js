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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
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

// Example usage:
/*
const newDomain = new Domain({
    client_email: "mhm13devlearn@gmail.com",
    clientWebsite: "youtube.com",
    clientName: "YouTube",
    clientDescription: "YouTube is a global video-sharing platform that allows users to upload, watch, share, and comment on videos. It enables creators to share their content with a worldwide audience and provides various monetization opportunities.",
    industry: "Technology & Media",
    niche: "Online Video Sharing & Streaming",
    colors: "#FF0000, #282828, #FFFFFF",
    user: "507f191e810c19729de860ea" // Example user ObjectId
});

// With population
Domain.find()
    .populate('user')
    .exec()
    .then(domains => console.log(domains))
    .catch(err => console.log(err));
*/