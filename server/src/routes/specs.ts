// srcServer/routes/specs.ts

import { Router } from 'express';
import { pool } from '../db';
import { z } from 'zod';
// Importamos AuthRequest aunque no lo usemos todavía
import { verifyToken, AuthRequest } from '../middleware/verifyToken';

export const router = Router();

// Aplicamos el middleware a todas las rutas de este archivo
router.use(verifyToken);

// Usamos AuthRequest para mantener la consistencia
router.get('/', async (req: AuthRequest, res) => {
  const schema = z.object({ subtopic: z.coerce.number().int().positive() });
  const parse = schema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'subtopic_required' });

  const id = parse.data.subtopic;
  
  // Opcional: En el futuro podrías añadir un log aquí
  // console.log(`Usuario ${req.user?.userId} está solicitando specs para el subtema ${id}`);

  const [rows] = await pool.query(
    `SELECT es.id_spec, es.id_type, es.title, es.outline, es.active,
            es.created_at, es.created_by,
            u.username AS creator_username, u.full_name AS creator_name
     FROM exercise_specs es
     JOIN users u ON u.id_user = es.created_by
     WHERE es.id_subtopic = ? AND es.active = 1
     ORDER BY es.created_at DESC`,
    [id]
  );

  const parsed = (rows as any[]).map(r => ({
    ...r,
    outline: typeof r.outline === 'string' ? JSON.parse(r.outline) : r.outline
  }));

  res.json(parsed);
});