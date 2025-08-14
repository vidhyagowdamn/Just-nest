const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// In-memory user storage (replace with database in production)
let users = [];

// Validation middleware
const validateRegistration = [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('userType').isIn(['citizen', 'lawyer', 'student', 'other']).withMessage('Valid user type is required')
];

const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, phone, password, userType, preferredLanguage = 'en' } = req.body;

        // Check if user already exists
        const existingUser = users.find(user => user.email === email || user.phone === phone);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            userType,
            preferredLanguage,
            isVerified: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                location: '',
                languages: [preferredLanguage],
                interests: [],
                emergencyContacts: []
            }
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'justnest-secret-key',
            { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userResponse } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, rememberMe = false } = req.body;

        // Find user by email or phone
        const user = users.find(u => u.email === email || u.phone === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/phone or password'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/phone or password'
            });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();

        // Generate JWT token
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'justnest-secret-key',
            { expiresIn: tokenExpiry }
        );

        // Remove password from response
        const { password: _, ...userResponse } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password: _, ...userResponse } = user;
        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile'
        });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { firstName, lastName, phone, preferredLanguage, profile } = req.body;
        const user = users[userIndex];

        // Update allowed fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (preferredLanguage) user.preferredLanguage = preferredLanguage;
        if (profile) user.profile = { ...user.profile, ...profile };

        users[userIndex] = user;

        const { password: _, ...userResponse } = user;
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile'
        });
    }
});

// Change password
router.put('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const userIndex = users.findIndex(u => u.id === req.user.userId);

        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[userIndex];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;

        users[userIndex] = user;

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password'
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
    // In a real application, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Forgot password
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
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

        const { email } = req.body;
        const user = users.find(u => u.email === email);

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent'
            });
        }

        // Generate reset token (in production, send email with reset link)
        const resetToken = jwt.sign(
            { userId: user.id, type: 'password-reset' },
            process.env.JWT_SECRET || 'justnest-secret-key',
            { expiresIn: '1h' }
        );

        // In production, send email with reset link
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            success: true,
            message: 'If an account with this email exists, a password reset link has been sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during password reset request'
        });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'justnest-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = router; 
