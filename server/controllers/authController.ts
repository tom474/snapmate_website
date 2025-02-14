import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Admin from '../models/admin';
import User from '../models/user';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, displayName, email, password } = req.body;
    const profileImageFile = req.file;

    // Validate input
    if (!username || !displayName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    console.log(existingUser);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }

    // Hash the password
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Handle profile image if provided
    let profileImage = undefined;
    if (profileImageFile) {
      profileImage = {
        data: profileImageFile.buffer,
        contentType: profileImageFile.mimetype,
      };
    }

    // Create and save the new user
    const newUser = new User({
      username,
      displayName,
      email,
      password: hashedPassword,
      profileImage,
      createdAt: new Date(),
    });
    await newUser.save();

    // Return the new user data
    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Check if the user is an admin
    let user = await Admin.findOne({ username });
    let isAdmin = false;

    if (!user) {
      // If not an admin, check if they are a regular user
      user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username' });
      }

      // Check if the user is suspended
      if ((user as any).status === 'Suspended') {
        return res.status(403).json({
          message:
            'Account is suspended. Please contact the Admin to get support.',
        });
      }
    } else {
      isAdmin = true;
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Set session data
    req.session.userId = user._id;
    req.session.username = user.username as String;
    req.session.isAdmin = isAdmin;

    // Return success response
    return res.status(200).json({
      message: 'User logged in successfully',
      userId: req.session.userId,
      username: req.session.username,
      isAdmin: req.session.isAdmin,
      // @ts-ignore
      virtualProfileImage: user.virtualProfileImage || '',
    });
  } catch (error: any) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Clear the cookie
      res.clearCookie('connect.sid'); // Assuming you're using the default session cookie name

      // Return success response
      return res.status(200).json({ message: 'Logout successful' });
    });
  } catch (error: any) {
    console.error('Error logging out user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
