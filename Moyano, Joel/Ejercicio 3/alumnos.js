import express from "express";
import { db } from "./db.js";
import {
    validarAlumno,
    validarId,
    verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Obtener todos los alumnos
router.get("/", async (req, res) => {
    let query =
        "SELECT a.id_alumno, a.nombre, m.nombre AS materia, a.nota1, a.nota2, a.nota3 FROM alumnos a JOIN materias m ON a.id_materia = m.id_materia";

    const [rows] = await db.execute(query);

    // Verificamos si hay alumnos
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No hay alumnos" });
    }

    return res.status(200).json({ success: true, data: rows });
});

// Obtener alumno por ID
router.get("/:id", validarId(), verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;

    // Consulta
    const [rows] = await db.execute(
        "SELECT a.id_alumno, a.nombre, m.nombre AS materia, a.nota1, a.nota2, a.nota3 FROM alumnos a JOIN materias m ON a.id_materia = m.id_materia WHERE a.id_alumno = ?",
        [id]
    );

    // Verificamos si el alumno existe
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Alumno no encontrado" });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

// Crear un nuevo alumno
router.post("/", validarAlumno, verificarValidaciones, async (req, res) => {
    const { nombre, nota1, nota2, nota3, id_materia } = req.body;

    // Verificar duplicado
    const [rows] = await db.execute(
        "SELECT * FROM alumnos WHERE nombre = ? AND id_materia = ?",
        [nombre, id_materia]
    );
    if (rows.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Ya existe ese alumno en esa materia",
        });
    }

    // Insert
    const [result] = await db.execute(
        "INSERT INTO alumnos (nombre, nota1, nota2, nota3, id_materia) VALUES (?, ?, ?, ?, ?)",
        [nombre, nota1, nota2, nota3, id_materia]
    );

    return res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, nota1, nota2, nota3, id_materia },
    });
});

// Eliminar un alumno por ID
router.delete("/:id", validarId(), verificarValidaciones, async (req, res) => {
    // Obtener el ID
    const { id } = req.params;

    // Verificar si el alumno existe
    const [rows] = await db.execute(
        "SELECT * FROM alumnos WHERE id_alumno = ?",
        [id]
    );
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Alumno no encontrado" });
    }

    // Eliminar el alumno
    await db.execute("DELETE FROM alumnos WHERE id_alumno = ?", [id]);
    return res.status(200).json({ success: true, data: { id } });
});

// Actualizar un alumno por ID
router.put("/:id", validarId(), validarAlumno, verificarValidaciones, async (req, res) => {
        // Obtener el ID
        const { id } = req.params;
        const { nombre, nota1, nota2, nota3, id_materia } = req.body;

        // Verificar duplicado (nombre + materia)
        const [duplicado] = await db.execute(
            "SELECT * FROM alumnos WHERE nombre = ? AND id_materia = ? AND id_alumno <> ?",
            [nombre, id_materia, id]
        );
        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Ya existe ese alumno en esa materia",
            });
        }

        // Verificar si el alumno existe
        const [rows] = await db.execute(
            "SELECT * FROM alumnos WHERE id_alumno = ?",
            [id]
        );
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Alumno no encontrado" });
        }

        // Actualizar el alumno
        await db.execute(
            "UPDATE alumnos SET nombre = ?, nota1 = ?, nota2 = ?, nota3 = ?, id_materia = ? WHERE id_alumno = ?",
            [nombre, nota1, nota2, nota3, id_materia, id]
        );
        return res
            .status(200)
            .json({
                success: true,
                data: { id, nombre, nota1, nota2, nota3, id_materia },
            });
    }
);

export default router;
