import express from 'express';
import { db } from './db.js';
import { validarId, validarMateria, verificarValidaciones } from './validaciones.js';

const router = express.Router();

// Obtener todas las materias
router.get('/', async (req, res) => {
    const { nombre } = req.query; 

    let query = 'SELECT * FROM materias';
    let params = [];

    // Verificamos si el parámetro nombre está presente
    if (nombre !== undefined) {
        query += ' WHERE nombre LIKE ?';
        params.push(`%${nombre}%`);
    }

    const [rows] = await db.execute(query, params);

    // Verificamos si hay materias
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay materias' });
    }

    return res.status(200).json({ success: true, data: rows });
});

// Obtener materia por ID
router.get('/:id', validarId(), verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;

    // Consulta
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);

    // Verificamos si la materia existe
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

// Crear una nueva materia
router.post('/', validarMateria, verificarValidaciones, async (req, res) => {
    const { nombre } = req.body;

    // Verificar duplicado
    const [existe] = await db.execute('SELECT * FROM materias WHERE nombre = ?', [nombre]);
    if (existe.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe esa materia' });
    }

    // Insert
    const [result] = await db.execute(
        'INSERT INTO materias (nombre) VALUES (?)',
        [nombre]
    );

    return res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre }
    });
});


// Eliminar una materia por ID
router.delete('/:id', validarId(), verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;

    // Verificar si la materia existe
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }

    // Eliminar la materia
    await db.execute('DELETE FROM materias WHERE id_materia = ?', [id]);
    return res.status(200).json({ success: true, data: { id } });
});

// Actualizar una materia por ID
router.put('/:id', validarId(), validarMateria, verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;
    const { nombre } = req.body;

    // Verificar si la materia existe
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }

    // Actualizar la materia
    await db.execute('UPDATE materias SET nombre = ? WHERE id_materia = ?', [nombre, id]);
    return res.status(200).json({ success: true, data: { id, nombre } });
});


export default router;