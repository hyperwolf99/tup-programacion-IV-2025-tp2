import express from 'express';
import { db } from './db.js';
import { validarId, verificarValidaciones, validarCalculo } from './validaciones.js';

const router = express.Router();

// Obtener todos los cálculos
router.get('/', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM calculos');
    return res.status(200).json({ success: true, data: rows });
});

// Obtener un cálculo por ID
router.get('/:id', validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM calculos WHERE idcalculos = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Rectángulo no encontrado' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

// Crear un nuevo cálculo
router.post('/', validarCalculo, verificarValidaciones, async (req, res) => {
    const { base, altura } = req.body;
    const perimetro = 2 * (parseFloat(base) + parseFloat(altura));
    const superficie = parseFloat(base) * parseFloat(altura);
    const [result] = await db.execute(
        'INSERT INTO calculos (base, altura, perimetro, superficie) VALUES (?, ?, ?, ?)',
        [base, altura, perimetro, superficie]
    );
    return res.status(201).json({
        success: true,
        data: {
            id: result.insertId,
            base,
            altura,
            perimetro,
            superficie
        }
    });
});

// Eliminar un cálculo por ID
router.delete('/:id', validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM calculos WHERE idcalculos = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Rectángulo no encontrado' });
    }
    await db.execute('DELETE FROM calculos WHERE idcalculos = ?', [id]);
    return res.status(200).json({ success: true, message: 'Rectángulo eliminado' });
});

// Actualizar un cálculo por ID
router.put('/:id', validarId(), validarCalculo, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const { base, altura } = req.body;

    // Validar que base y altura estén presentes
    const [rows] = await db.execute('SELECT * FROM calculos WHERE idcalculos = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Rectángulo no encontrado' });
    }
    
    const perimetro = 2 * (parseFloat(base) + parseFloat(altura));
    const superficie = parseFloat(base) * parseFloat(altura);

    await db.execute(
        'UPDATE calculos SET base = ?, altura = ?, perimetro = ?, superficie = ? WHERE idcalculos = ?',
        [base, altura, perimetro, superficie, id]
    );

    return res.status(200).json({
        success: true,
        data: {
            id,
            base,
            altura,
            perimetro,
            superficie
        }
    });
});

export default router;