// srcServer/routes/practice.ts

import { Router } from 'express';
import { pool } from '../db';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';

export const router = Router();

// 1. Aplicamos el middleware a todas las rutas de este archivo
router.use(verifyToken);

// 2. Quitamos 'id_user' del schema. Ya no lo aceptaremos desde el frontend.
const FinishSchema = z.object({
  id_subtopic: z.number().int().positive(),
  exercises_presented: z.number().int().positive(),
  correct: z.number().int().min(0),
  avg_time_sec: z.number().nonnegative(),
  score: z.number().int().min(0).max(100),
  issues: z.array(z.object({
    issue_key: z.string().min(1),
    attempts: z.number().int().min(1),
    errors: z.number().int().min(0)
  })).optional()
});

router.post('/finish', async (req: AuthRequest, res) => { // 3. Usamos AuthRequest
  // 4. Obtenemos el ID de usuario del token, la fuente segura
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: 'Token inválido, usuario no identificado.' });
  }

  const parsed = FinishSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_payload', details: parsed.error.flatten() });

  const p = parsed.data;
  const timeToAdd = p.avg_time_sec * p.exercises_presented;
  const percent = p.exercises_presented > 0 ? p.correct / p.exercises_presented : 0;
  const streakThreshold = 80;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const upsertSummary = `
      INSERT INTO user_subtopic_summary
      (/*...columnas...*/ id_user, id_subtopic, exercises_per_block, blocks_total, attempts_total, correct_total, percent_correct, last_score, last_avg_time_sec, total_time_sec, avg_time_sec, best_score, attempt_of_best, avg_time_best, current_streak, best_streak, times_mastered, first_mastered_at, last_mastered_at, mastery_percent, last_block_no, last_updated_at)
      VALUES
      (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, (CASE WHEN ?=100 THEN 1 ELSE 0 END), (CASE WHEN ?=100 THEN NOW() ELSE NULL END), (CASE WHEN ?=100 THEN NOW() ELSE NULL END), ?, 1, NOW())
      ON DUPLICATE KEY UPDATE
        blocks_total = blocks_total + 1, attempts_total = attempts_total + VALUES(attempts_total), correct_total = correct_total + VALUES(correct_total), percent_correct = (correct_total + VALUES(correct_total)) / (attempts_total + VALUES(attempts_total)), last_score = VALUES(last_score), last_avg_time_sec = VALUES(last_avg_time_sec), total_time_sec = total_time_sec + VALUES(total_time_sec), avg_time_sec = (total_time_sec + VALUES(total_time_sec)) / (attempts_total + VALUES(attempts_total)), best_score = GREATEST(best_score, VALUES(best_score)), attempt_of_best = CASE WHEN VALUES(best_score) > best_score THEN last_block_no + 1 ELSE attempt_of_best END, avg_time_best = CASE WHEN VALUES(best_score) > best_score THEN VALUES(avg_time_best) WHEN VALUES(best_score) = best_score AND VALUES(avg_time_best) < avg_time_best THEN VALUES(avg_time_best) ELSE avg_time_best END, current_streak = CASE WHEN VALUES(last_score) >= ? THEN current_streak + 1 ELSE 0 END, best_streak = GREATEST(best_streak, CASE WHEN VALUES(last_score) >= ? THEN current_streak + 1 ELSE 0 END), times_mastered = times_mastered + CASE WHEN VALUES(last_score) = 100 THEN 1 ELSE 0 END, first_mastered_at = COALESCE(first_mastered_at, CASE WHEN VALUES(last_score) = 100 THEN NOW() END), last_mastered_at = CASE WHEN VALUES(last_score) = 100 THEN NOW() ELSE last_mastered_at END, mastery_percent = VALUES(mastery_percent), last_block_no = last_block_no + 1, last_updated_at = NOW()
    `;

    // 5. Usamos el 'userId' del token en la consulta
    await conn.query(upsertSummary, [
      userId, p.id_subtopic, p.exercises_presented,
      p.exercises_presented, p.correct, percent,
      p.score, p.avg_time_sec, timeToAdd, timeToAdd / p.exercises_presented,
      p.score, p.avg_time_sec,
      p.score, p.score, p.score, p.score, p.score, p.score,
      p.score,
      streakThreshold, streakThreshold
    ]);

    if (p.issues?.length) {
      const issuesSQL = `
        INSERT INTO user_subtopic_issue_stats (id_user, id_subtopic, issue_key, attempts, errors, last_seen_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE attempts = attempts + VALUES(attempts), errors = errors + VALUES(errors), last_seen_at = NOW()
      `;
      for (const i of p.issues) {
        // 5. Usamos el 'userId' del token también aquí
        await conn.query(issuesSQL, [userId, p.id_subtopic, i.issue_key, i.attempts, i.errors]);
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'practice_finish_failed' });
  } finally {
    conn.release();
  }
});