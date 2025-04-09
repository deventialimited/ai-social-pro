const Domain = require('../models/Domain')
const Post = require('../models/Post')

exports.getAllPosts = async (req, res) => {
    try {
        const { domainId } = req.body; // Extract domainId from query parameters
    
        // Validate domainId
        if (!domainId) {
        return res.status(400).json({ message: "Domain ID is required" });
        }
    
        // Find the domain by ID
        const domain = await Domain.findById(domainId);
        if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
        }
    
        // Fetch all posts associated with the domain
        const posts = await Post.find({ domainId }).populate('domainId', 'clientName clientWebsite');
    
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}