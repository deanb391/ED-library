import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { argon2Verify } from 'hash-wasm';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const JWT_EXPIRES_IN = '30d';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;

    // Check if the hash is an Argon2 hash from Appwrite
    if (hash.startsWith('$argon2')) {
      try {
        const isValid = await argon2Verify({
          password,
          hash,
        });
        return isValid;
      } catch (err) {
        console.error('Argon2 verification failed:', err);
        return false;
      }
    }

    // Standard bcrypt verification
    try {
      return await bcrypt.compare(password, hash);
    } catch (err) {
      console.error('Bcrypt verification failed:', err);
      return false;
    }
  }

  static generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): { userId: string; email: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      return null;
    }
  }

  static async getUserFromRequest(req: Request | any): Promise<{ id: string; $id: string; userId: string; email: string } | null> {
    try {
      let token = "";
      if (req.headers) {
        const authHeader = typeof req.headers.get === 'function' ? req.headers.get('authorization') : req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }
      if (!token && typeof req.cookies?.get === 'function') {
        token = req.cookies.get('session')?.value || req.cookies.get('token')?.value || "";
      }
      if (!token) return null;
      const decoded = AuthService.verifyToken(token);
      if (!decoded) return null;
      return {
        id: decoded.userId,
        $id: decoded.userId,
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  }
}
