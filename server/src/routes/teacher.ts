import { Router } from 'express';
import { pool } from '../db';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';

export const router = Router();
router.use(verifyToken);

// Nueva ruta para obtener los datos del panel del maestro
router.get('/dashboard', async (req: AuthRequest, res) => {
    // Obtenemos el ID del maestro desde el token seguro
    const teacherId = req.user?.userId;
    if (!teacherId) {
        return res.status(403).json({ error: 'Usuario no identificado' });
    }

    try {
        // Buscamos el nombre del maestro y las materias/grados que tiene asignados
        const [teacherData]: any = await pool.query(`
            SELECT
                u.full_name,
                s.name AS subject_name,
                g.name AS grade_name,
                g.id_grade
            FROM users u
            JOIN teachers_subjects ts ON u.id_user = ts.id_user
            JOIN subjects s ON ts.id_subject = s.id_subject
            JOIN grades g ON s.id_grade = g.id_grade
            WHERE u.id_user = ?;
        `, [teacherId]);

        if (teacherData.length === 0) {
            return res.status(404).json({ error: 'No se encontraron datos o asignaciones para este maestro.' });
        }

        // Estructuramos los datos para enviarlos al frontend
        const response = {
            fullName: teacherData[0].full_name,
            classes: teacherData.map((cls: any) => ({
                subject_name: cls.subject_name,
                grade_name: cls.grade_name,
                grade_id: cls.id_grade
            }))
        };
        
        res.json(response);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al obtener los datos del maestro.' });
    }
});