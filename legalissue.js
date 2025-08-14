const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// In-memory storage for legal issues (replace with database in production)
let legalIssues = [];

// Validation middleware
const validateLegalIssue = [
    body('category').isIn(['property', 'family', 'labor', 'consumer', 'domestic-violence', 'criminal', 'civil', 'government', 'other']).withMessage('Valid category is required'),
    body('title').trim().isLength({ min: 10, max: 100 }).withMessage('Title must be between 10 and 100 characters'),
    body('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
    body('urgency').isIn(['low', 'medium', 'high', 'emergency']).withMessage('Valid urgency level is required'),
    body('language').isIn(['en', 'hi', 'mr', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'gu']).withMessage('Valid language is required')
];

// Post a new legal issue
router.post('/', validateLegalIssue, (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            category,
            title,
            description,
            urgency,
            language,
            anonymous = false,
            personalInfo = null,
            location,
            files = [],
            hasAudio = false,
            consent = {}
        } = req.body;

        const newIssue = {
            id: `LI${Date.now().toString().slice(-6)}`,
            category,
            title,
            description,
            urgency,
            language,
            anonymous,
            personalInfo: anonymous ? null : personalInfo,
            location,
            files,
            hasAudio,
            consent,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            responses: [],
            assignedLawyer: null,
            tags: [],
            priority: urgency === 'emergency' ? 'high' : urgency === 'high' ? 'medium' : 'low'
        };

        legalIssues.push(newIssue);

        // Emit real-time notification (if using Socket.IO)
        if (req.app.get('io')) {
            req.app.get('io').to(`lang-${language}`).emit('new-legal-issue', {
                id: newIssue.id,
                category,
                urgency,
                language,
                timestamp: newIssue.createdAt
            });
        }

        res.status(201).json({
            success: true,
            message: 'Legal issue posted successfully',
            issue: {
                id: newIssue.id,
                title: newIssue.title,
                category: newIssue.category,
                urgency: newIssue.urgency,
                status: newIssue.status,
                createdAt: newIssue.createdAt
            }
        });

    } catch (error) {
        console.error('Legal issue creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while posting legal issue'
        });
    }
});

// Get all legal issues with filtering
router.get('/', (req, res) => {
    try {
        const {
            category,
            urgency,
            language,
            status,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let filteredIssues = [...legalIssues];

        // Apply filters
        if (category) {
            filteredIssues = filteredIssues.filter(issue => issue.category === category);
        }
        if (urgency) {
            filteredIssues = filteredIssues.filter(issue => issue.urgency === urgency);
        }
        if (language) {
            filteredIssues = filteredIssues.filter(issue => issue.language === language);
        }
        if (status) {
            filteredIssues = filteredIssues.filter(issue => issue.status === status);
        }

        // Sort issues
        filteredIssues.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

        // Remove sensitive information for public listing
        const publicIssues = paginatedIssues.map(issue => ({
            id: issue.id,
            category: issue.category,
            title: issue.title,
            description: issue.description.substring(0, 200) + '...',
            urgency: issue.urgency,
            language: issue.language,
            status: issue.status,
            createdAt: issue.createdAt,
            views: issue.views,
            responsesCount: issue.responses.length,
            anonymous: issue.anonymous,
            location: issue.location,
            tags: issue.tags
        }));

        res.json({
            success: true,
            issues: publicIssues,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(filteredIssues.length / limit),
                totalIssues: filteredIssues.length,
                hasNextPage: endIndex < filteredIssues.length,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Legal issues fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching legal issues'
        });
    }
});

// Get a specific legal issue
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const issue = legalIssues.find(i => i.id === id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Legal issue not found'
            });
        }

        // Increment view count
        issue.views += 1;
        issue.updatedAt = new Date().toISOString();

        // Return issue with sensitive information removed for anonymous posts
        const publicIssue = {
            id: issue.id,
            category: issue.category,
            title: issue.title,
            description: issue.description,
            urgency: issue.urgency,
            language: issue.language,
            status: issue.status,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            views: issue.views,
            responses: issue.responses,
            anonymous: issue.anonymous,
            location: issue.location,
            tags: issue.tags,
            assignedLawyer: issue.assignedLawyer
        };

        // Add personal info only if not anonymous
        if (!issue.anonymous) {
            publicIssue.personalInfo = issue.personalInfo;
        }

        res.json({
            success: true,
            issue: publicIssue
        });

    } catch (error) {
        console.error('Legal issue fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching legal issue'
        });
    }
});

// Add response to a legal issue
router.post('/:id/responses', [
    body('content').trim().isLength({ min: 10, max: 1000 }).withMessage('Response must be between 10 and 1000 characters'),
    body('responderType').isIn(['lawyer', 'citizen', 'admin']).withMessage('Valid responder type is required')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { content, responderType, responderId, responderName } = req.body;

        const issue = legalIssues.find(i => i.id === id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Legal issue not found'
            });
        }

        const newResponse = {
            id: `RES${Date.now().toString().slice(-6)}`,
            content,
            responderType,
            responderId,
            responderName,
            createdAt: new Date().toISOString(),
            helpful: 0,
            notHelpful: 0
        };

        issue.responses.push(newResponse);
        issue.updatedAt = new Date().toISOString();

        res.status(201).json({
            success: true,
            message: 'Response added successfully',
            response: newResponse
        });

    } catch (error) {
        console.error('Response creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while adding response'
        });
    }
});

// Update legal issue status
router.put('/:id/status', [
    body('status').isIn(['pending', 'in-progress', 'resolved', 'closed']).withMessage('Valid status is required')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { status, notes } = req.body;

        const issue = legalIssues.find(i => i.id === id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Legal issue not found'
            });
        }

        issue.status = status;
        issue.updatedAt = new Date().toISOString();

        if (notes) {
            issue.notes = notes;
        }

        res.json({
            success: true,
            message: 'Legal issue status updated successfully',
            issue: {
                id: issue.id,
                status: issue.status,
                updatedAt: issue.updatedAt
            }
        });

    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating status'
        });
    }
});

// Assign lawyer to legal issue
router.put('/:id/assign-lawyer', [
    body('lawyerId').notEmpty().withMessage('Lawyer ID is required'),
    body('lawyerName').notEmpty().withMessage('Lawyer name is required')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { lawyerId, lawyerName } = req.body;

        const issue = legalIssues.find(i => i.id === id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Legal issue not found'
            });
        }

        issue.assignedLawyer = {
            id: lawyerId,
            name: lawyerName,
            assignedAt: new Date().toISOString()
        };
        issue.status = 'in-progress';
        issue.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Lawyer assigned successfully',
            issue: {
                id: issue.id,
                assignedLawyer: issue.assignedLawyer,
                status: issue.status
            }
        });

    } catch (error) {
        console.error('Lawyer assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while assigning lawyer'
        });
    }
});

// Get statistics for legal issues
router.get('/stats/overview', (req, res) => {
    try {
        const totalIssues = legalIssues.length;
        const resolvedIssues = legalIssues.filter(i => i.status === 'resolved').length;
        const pendingIssues = legalIssues.filter(i => i.status === 'pending').length;
        const emergencyIssues = legalIssues.filter(i => i.urgency === 'emergency').length;

        const categoryStats = {};
        const languageStats = {};
        const urgencyStats = {};

        legalIssues.forEach(issue => {
            // Category stats
            categoryStats[issue.category] = (categoryStats[issue.category] || 0) + 1;
            
            // Language stats
            languageStats[issue.language] = (languageStats[issue.language] || 0) + 1;
            
            // Urgency stats
            urgencyStats[issue.urgency] = (urgencyStats[issue.urgency] || 0) + 1;
        });

        res.json({
            success: true,
            stats: {
                total: totalIssues,
                resolved: resolvedIssues,
                pending: pendingIssues,
                emergency: emergencyIssues,
                resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(2) : 0,
                categories: categoryStats,
                languages: languageStats,
                urgency: urgencyStats
            }
        });

    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching statistics'
        });
    }
});

