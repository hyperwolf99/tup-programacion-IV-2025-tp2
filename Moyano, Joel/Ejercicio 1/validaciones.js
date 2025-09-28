import { param, body, validationResult } from "express-validator";

export const validarId = () =>
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor a 0");

export const validarCalculo = [
    body("base")
        .exists().withMessage("La base es obligatoria")
        .isFloat({ gt: 0 }).withMessage("La base debe ser un número mayor a 0"),
    body("altura")
        .exists().withMessage("La altura es obligatoria")
        .isFloat({ gt: 0 }).withMessage("La altura debe ser un número mayor a 0")
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