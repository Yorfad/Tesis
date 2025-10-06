import { Router } from 'express';
import { pool } from '../db';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';
import { buildSumMixed } from '../engines/sumMixed';
import { buildSpatialExercises } from '../engines/spatialEngine';

export const router = Router();
router.use(verifyToken);

const GenerateSchema = z.object({
  id_subtopic: z.coerce.number().int().positive()
});

router.post('/build', async (req: AuthRequest, res) => {
  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'id_subtopic_required' });
  }

  try {
    const { id_subtopic } = parsed.data;

    // 1. Query mejorada: Obtenemos el 'outline' Y el código del tipo de ejercicio
    const [rows]: any[] = await pool.query(
      `SELECT es.outline, et.code as exercise_type_code
       FROM exercise_specs es
       JOIN exercise_types et ON es.id_type = et.id_type
       WHERE es.id_subtopic = ? AND es.active = 1
       ORDER BY es.created_at DESC LIMIT 1`,
      [id_subtopic]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Especificación de ejercicio no encontrada.' });
    }

    const spec = rows[0];
    const specOutline = typeof spec.outline === 'string' ? JSON.parse(spec.outline) : spec.outline;

    let exerciseSet;
    // 2. Usamos el 'code' del tipo de ejercicio para decidir qué motor usar. ¡Mucho más robusto!
    switch (spec.exercise_type_code) {
      case 'clickable_image':
        exerciseSet = buildSpatialExercises(specOutline);
        break;
      case 'composed': // Asumiendo que 'composed' es el tipo para sumas
        exerciseSet = buildSumMixed(specOutline);
        break;
      default:
        return res.status(500).json({ error: `Tipo de ejercicio '${spec.exercise_type_code}' no tiene un motor de generación asociado.` });
    }

    res.json(exerciseSet);

  } catch (e: any) {
    console.error("Error en /generator/build:", e);
    res.status(500).json({ error: 'Failed_to_build_exercises', details: e.message });
  }
});