const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// In-memory storage for lawyers (replace with database in production)
let lawyers = [];

// Validation middleware
const validateLawyerRegistration = [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('barCouncilNumber').notEmpty().withMessage('Bar Council number is required'),
    body('specializations').isArray({ min: 1 }).withMessage('At least one specialization is required'),
    body('languages').isArray({ min: 1 }).withMessage('At least one language is required'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('location').notEmpty().withMessage('Location is required')
];

// Register new lawyer
router.post('/register', validateLawyerRegistration, (req, res) => {
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
            firstName,
            lastName,
            email,
            phone,
            barCouncilNumber,
            specializations,
            languages,
            experience,
            location,
            bio,
            consultationFee,
            availability = 'available'
        } = req.body;

        // Check if lawyer already exists
        const existingLawyer = lawyers.find(lawyer => 
            lawyer.email === email || 
            lawyer.phone === phone || 
            lawyer.barCouncilNumber === barCouncilNumber
        );
        
        if (existingLawyer) {
            return res.status(409).json({
                success: false,
                message: 'Lawyer with this email, phone, or bar council number already exists'
            });
        }

        const newLawyer = {
            id: `LAW${Date.now().toString().slice(-6)}`,
            firstName,
            lastName,
            email,
            phone,
            barCouncilNumber,
            specializations,
            languages,
            experience,
            location,
            bio,
            consultationFee,
            availability,
            isVerified: false,
            rating: 0,
            totalCases: 0,
            successfulCases: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            documents: [],
            reviews: []
        };

        lawyers.push(newLawyer);

        res.status(201).json({
            success: true,
            message: 'Lawyer registration submitted successfully. Pending verification.',
            lawyer: {
                id: newLawyer.id,
                name: `${firstName} ${lastName}`,
                specializations: newLawyer.specializations,
                location: newLawyer.location,
                isVerified: newLawyer.isVerified
            }
        });

    } catch (error) {
        console.error('Lawyer registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during lawyer registration'
        });
    }
});

// Get all lawyers with filteringrouter.get('/', (req, res) => {
    try {
        const {
            specialization,
            language,
            location,
            verified,
            availability,
            page = 1,
            limit = 10
        } = req.query;

        let filteredLawyers = [...lawyers];

        // Apply filters
        if (specialization) {
            filteredLawyers = filteredLawyers.filter(lawyer => 
                lawyer.specializations.includes(specialization)
            );
        }
        if (language) {
            filteredLawyers = filteredLawyers.filter(lawyer => 
                lawyer.languages.includes(language)
            );
        }
        if (location) {
            filteredLawyers = filteredLawyers.filter(lawyer => 
                lawyer.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        if (verified !== undefined) {
            filteredLawyers = filteredLawyers.filter(lawyer => 
                lawyer.isVerified === (verified === 'true')
            );
        }
        if (availability) {
            filteredLawyers = filteredLawyers.filter(lawyer => 
                lawyer.availability === availability
            );
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedLawyers = filteredLawyers.slice(startIndex, endIndex);

        // Remove sensitive information
        const publicLawyers = paginatedLawyers.map(lawyer => ({
            id: lawyer.id,
            name: `${lawyer.firstName} ${lawyer.lastName}`,
            specializations: lawyer.specializations,
            languages: lawyer.languages,
            experience: lawyer.experience,
            location: lawyer.location,
            bio: lawyer.bio,
            consultationFee: lawyer.consultationFee,
            availability: lawyer.availability,
            isVerified: lawyer.isVerified,
            rating: lawyer.rating,
            totalCases: lawyer.totalCases,
            successfulCases: lawyer.successfulCases
        }));
