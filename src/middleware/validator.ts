import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any[] = [];
    errors.array().map((err: any) =>
      extractedErrors.push({ [err.path]: err.msg })
    );

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: extractedErrors,
    });
  };
};
