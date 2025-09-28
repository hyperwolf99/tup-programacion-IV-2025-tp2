import { param, body, validationResult } from "express-validator";

export const validarId = () =>
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor a 0");

export const validarTarea = [
    body("nombre")
        .exists().withMessage("El nombre es obligatorio")
        .isString().withMessage("El nombre debe ser un texto")
        .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres")
        .trim(),
    body("completada")
        .optional()
        .isBoolean().withMessage("Completada debe ser true o false")
];

export const verificarValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Falla de validación",
            errors: validacion.array(),
        });
    }
    next();
};