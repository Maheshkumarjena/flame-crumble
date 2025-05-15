import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { connectToDatabase } from './db';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password) {
  return await hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

export function createToken(user) {
  return sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export async function verifyToken(token) {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = verify(token, JWT_SECRET);
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function authenticateUser(email, password) {
  await connectToDatabase();
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid password');
  }
  
  return user;
}

export async function createOrFindUserFromOAuth(profile) {
  await connectToDatabase();
  
  let user = await User.findOne({ email: profile.email });
  
  if (!user) {
    user = new User({
      name: profile.name,
      email: profile.email,
      oauthProvider: profile.provider,
      oauthId: profile.id,
    });
    
    await user.save();
  }
  
  return user;
}