import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject, ZodType } from "zod";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodObject;
  query?: ZodObject;
};

const formatZodError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

export const validate = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: formatZodError(error),
        });
        return;
      }

      next(error);
    }
  };
};
