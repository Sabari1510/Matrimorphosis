import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers["x-user-role"] as string;

    if (!userRole) {
      return res.status(401).json({
        message: "User role not provided",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied for this role",
      });
    }

    next();
  };
};
