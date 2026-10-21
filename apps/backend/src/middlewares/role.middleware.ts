import { Request, Response, NextFunction } from "express";
import { RoleType } from "@ecommerce/shared-types";

/**
 * Middleware to enforce role-based access control. Only two roles exist: ADMIN and USER.
 */
export function requireRole(...allowedRoles: RoleType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to proceed",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(", ")}] roles`,
      });
    }

    next();
  };
}

/** Shorthand for routes that only platform administrators may call. */
export const requireAdmin = requireRole("ADMIN");
