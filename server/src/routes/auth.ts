import { Router } from 'express';
import { pool } from '../db';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const router = Router();

router.post('/login', async (req, res) => {
  const parsed = z.object({ username: z.string(), password: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
  }

  const { username, password } = parsed.data;

  try {
    // Query mejorada: Ahora también obtenemos el rol del usuario
    const [rows]: any[] = await pool.query(
      `SELECT u.id_user, u.full_name, u.password, r.code as role_code
       FROM users u
       JOIN user_roles ur ON u.id_user = ur.id_user
       JOIN roles r ON ur.id_role = r.id_role
       WHERE u.username = ? AND u.active = 1`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id_user, name: user.full_name, role: user.role_code },
      process.env.JWT_SECRET || 'tu_secreto_super_secreto',
      { expiresIn: '8h' }
    );
    
    // Devolvemos el rol en la respuesta para la redirección inmediata
    res.json({ token, id_user: user.id_user, role: user.role_code });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});