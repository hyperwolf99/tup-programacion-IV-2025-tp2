import express from 'express';
import { db } from './db.js';
import { validarId, validarTarea, verificarValidaciones } from './validaciones.js';

const router = express.Router();

// Obtener todos las tareas
router.get('/', async (req, res) => {
    const { completada } = req.query; 

    let query = 'SELECT * FROM tareas';
    let params = [];

    // Verificamos si el parámetro completada está presente
    if (completada !== undefined) {
        // Convertimos el string a 1 o 0
        const estado = completada === true || completada === 'true' ? 1 : 0;
        query += ' WHERE completada = ?';
        params.push(estado);
    }

    const [rows] = await db.execute(query, params);

    // Verificamos si hay tareas
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay tareas' });
    }

    // Convertimos 0/1 a true/false
    const tareas = rows.map(t => ({
        ...t,
        completada: !!t.completada
    }));

    return res.status(200).json({ success: true, data: tareas });
});

// Obtener tarea por ID
router.get('/:id', validarId(), verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;

    // Consulta
    const [rows] = await db.execute('SELECT * FROM tareas WHERE idtareas = ?', [id]);

    // Verificamos si la tarea existe
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

// Crear una nueva tarea
router.post('/', validarTarea, verificarValidaciones, async (req, res) => {
    const { nombre, completada = 0 } = req.body;

    // Verificar duplicado
    const [existe] = await db.execute('SELECT * FROM tareas WHERE nombre = ?', [nombre]);
    if (existe.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe esa tarea' });
    }

    // Insert
    const [result] = await db.execute(
        'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
        [nombre, completada]
    );

    return res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, completada: !!completada }
    });
});


// Eliminar una tarea por ID
router.delete('/:id', validarId(), verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;

    // Verificar si la tarea existe
    const [rows] = await db.execute('SELECT * FROM tareas WHERE idtareas = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    // Eliminar la tarea
    await db.execute('DELETE FROM tareas WHERE idtareas = ?', [id]);
    return res.status(200).json({ success: true, data: { id } });
});

// Actualizar una tarea por ID
router.put('/:id', validarId(), validarTarea, verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;
    const { nombre, completada } = req.body;

    // Verificar si la tarea existe
    const [rows] = await db.execute('SELECT * FROM tareas WHERE idtareas = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    // Actualizar la tarea
    await db.execute('UPDATE tareas SET nombre = ?, completada = ? WHERE idtareas = ?', [nombre, completada, id]);
    return res.status(200).json({ success: true, data: { id, nombre, completada } });
});


export default router;