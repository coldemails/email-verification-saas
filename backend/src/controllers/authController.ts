import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

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