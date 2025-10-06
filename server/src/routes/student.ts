// srcServer/routes/student.ts
import { Router } from 'express';
import { pool } from '../db';
import { verifyToken, AuthRequest } from '../middleware/verifyToken'; // Importamos el tipo AuthRequest

export const router = Router();

// 1. Aplicamos el middleware UNA SOLA VEZ para todas las rutas del archivo.
router.use(verifyToken);

// GET /api/student/dashboard
// Ya no necesita el verifyToken aquí. Tampoco necesita recibir el userId en la URL.
router.get('/dashboard', async (req: AuthRequest, res) => { // Usamos el tipo AuthRequest
  
  // 2. OBTENEMOS EL ID DEL USUARIO DESDE EL TOKEN, no desde la URL. ¡Esto es más seguro!
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId no encontrado en el token' });
  }
  
  try {
    const [dashData]: any = await pool.query(`
      SELECT
        u.full_name,
        g.name as grade_name
      FROM users u
      JOIN students_grade sg ON u.id_user = sg.id_user
      JOIN grades g ON sg.id_grade = g.id_grade
      WHERE u.id_user = ? AND g.year = YEAR(CURDATE())
    `, [userId]); // Usamos el userId del token

    const [subjects]: any = await pool.query(`
      SELECT s.id_subject, s.name
      FROM subjects s
      JOIN grades g ON s.id_grade = g.id_grade
      JOIN students_grade sg ON g.id_grade = sg.id_grade
      WHERE sg.id_user = ? AND s.active = 1
    `, [userId]); // Usamos el userId del token

    if (dashData.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado o sin grado asignado para este año.' });

    res.json({
      fullName: dashData[0].full_name,
      gradeName: dashData[0].grade_name,
      subjects
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
});

// GET /api/student/subject/1/topics (Ya está protegido por router.use)
router.get('/subject/:id/topics', async (req, res) => {
  const { id } = req.params;
  const [topics] = await pool.query(
    'SELECT id_topic, name FROM topics WHERE id_subject = ? AND active = 1',
    [id]
  );
  res.json(topics);
});

// GET /api/student/topic/1/subtopics (Ya está protegido por router.use)
router.get('/topic/:id/subtopics', async (req, res) => {
  const { id } = req.params;
  const [subtopics] = await pool.query(
    'SELECT id_subtopic, name FROM subtopics WHERE id_topic = ? AND active = 1',
    [id]
  );
  res.json(subtopics);
});