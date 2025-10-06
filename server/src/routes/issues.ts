// srcServer/routes/issues.ts

import { Router } from 'express';
import { pool } from '../db';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';

export const router = Router();

// 1. Aplicamos el middleware a toda la ruta
router.use(verifyToken);

// 2. Quitamos 'id_user' del schema
const IssuesSchema = z.object({
  id_subtopic: z.number().int().positive(),
  issues: z.array(z.object({
    issue_key: z.string().min(1),
    attempts: z.number().int().min(1),
    errors: z.number().int().min(0)
  }))
});

router.post('/upsert', async (req: AuthRequest, res) => { // 3. Usamos AuthRequest
  // 4. Obtenemos el ID de usuario del token
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: 'Token inválido, usuario no identificado.' });
  }

  const parsed = IssuesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_payload', details: parsed.error.flatten() });

  const { id_subtopic, issues } = parsed.data;
  const sql = `
    INSERT INTO user_subtopic_issue_stats
    (id_user, id_subtopic, issue_key, attempts, errors, last_seen_at)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      attempts = attempts + VALUES(attempts),
      errors   = errors   + VALUES(errors),
      last_seen_at = NOW()
  `;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const i of issues) {
      // 5. Usamos el 'userId' del token en la consulta
      await conn.query(sql, [userId, id_subtopic, i.issue_key, i.attempts, i.errors]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'issues_upsert_failed' });
  } finally {
    conn.release();
  }
});