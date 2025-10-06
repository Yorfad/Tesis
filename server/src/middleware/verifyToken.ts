import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos el tipo Request para poder añadirle datos del usuario
export interface AuthRequest extends Request {
  user?: { userId: number; name: string };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_secreto', (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden (token inválido)
    }
    req.user = user as { userId: number; name: string };
    next(); // El token es válido, permite que la petición continúe
  });
}