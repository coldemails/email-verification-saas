import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import emailService from '../services/emailService';

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // ✅ VALIDATE: Email and password required
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    

    // ✅ VALIDATE: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // ✅ VALIDATE: Email length (prevent extremely long emails)
    if (email.length > 254) { // RFC 5321 max email length
      return res.status(400).json({ error: 'Email is too long' });
    }

    // ✅ VALIDATE: Password strength (match frontend requirements)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must include an uppercase letter' });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must include a lowercase letter' });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must include a number' });
    }

    if (password.length > 128) { // Prevent extremely long passwords
      return res.status(400).json({ error: 'Password is too long (max 128 characters)' });
    }

    // ✅ VALIDATE: Name (if provided)
    if (name) {
      // Remove leading/trailing whitespace
      const trimmedName = name.trim();
      
      // Check length
      if (trimmedName.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }
      
      if (trimmedName.length > 100) {
        return res.status(400).json({ error: 'Name is too long (max 100 characters)' });
      }
      
      // Remove potentially dangerous characters
      const sanitizedName = trimmedName.replace(/[<>\"\']/g, '');
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with sanitized name
      const user = await prisma.user.create({
        data: {
          name: sanitizedName,
          email: email.toLowerCase(),
          password: hashedPassword,
          credits: 100
        },
        
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          createdAt: true
        }
      });
        // 🆕 ADD THIS: Send welcome email
          try {
            await emailService.sendWelcomeEmail(user.email, user.name || 'User');
            console.log(`✅ Welcome email sent to ${user.email}`);
          } catch (emailError) {
            // Log error but don't fail registration
            console.error('❌ Failed to send welcome email:', emailError);
          }

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        message: 'Registration successful',
        user,
        token
      });
    } else {
      // No name provided
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name: null,
          email: email.toLowerCase(),
          password: hashedPassword,
          credits: 100
        },
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          createdAt: true
        }
      });

              // 🆕 ADD THIS: Send welcome email
        try {
          await emailService.sendWelcomeEmail(user.email, 'User');
          console.log(`✅ Welcome email sent to ${user.email}`);
        } catch (emailError) {
          console.error('❌ Failed to send welcome email:', emailError);
        }


      const token = generateToken(user.id);

      res.status(201).json({
        message: 'Registration successful',
        user,
        token
      });
    }

  } catch (error) {
    console.error('Register error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ✅ VALIDATE: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Will be set by auth middleware

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};


/**
 * Forgot Password - Send reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('🔍 Forgot password request for:', email); // 🆕 ADD THIS

    // Validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
        console.log('🔍 User found:', !!user); // 🆕 ADD THIS


    // IMPORTANT: Don't reveal if email exists (security best practice)
    if (!user) {
      return res.json({ 
        message: 'If that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token (JWT with 1 hour expiry)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

          console.log('🔍 Reset token generated'); // 🆕 ADD THIS

          
    // Send email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`✅ Password reset email sent to ${user.email}`);

    res.json({ 
      message: 'If that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

/**
 * Reset Password - Verify token and update password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Check if it's a password reset token
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({ error: 'Invalid reset token' });
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
      }
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`✅ Password reset successful for ${user.email}`);

    res.json({ 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

/**
 * Change Password (for logged-in users)
 * PUT /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    console.log(`✅ Password changed successfully for ${user.email}`);

    res.json({ 
      message: 'Password changed successfully. Please login again with your new password.' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const testEmailDebug = async (req: Request, res: Response) => {
  try {
    console.log('\n🔍 ========== EMAIL SERVICE DEBUG ==========');
    console.log('📧 Testing email service configuration...');
    console.log('✅ RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('✅ RESEND_API_KEY valid:', process.env.RESEND_API_KEY?.startsWith('re_'));
    console.log('✅ FROM_EMAIL:', process.env.FROM_EMAIL);
    
    // Test password reset email
    const testToken = jwt.sign(
      { userId: 'test-id', type: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );
    
    await emailService.sendPasswordResetEmail('test@example.com', testToken);
    console.log('✅ Password reset email sent!');
    
    res.json({ success: true, message: 'Email test passed!' });
  } catch (error: any) {
    console.error('❌ Email test failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};