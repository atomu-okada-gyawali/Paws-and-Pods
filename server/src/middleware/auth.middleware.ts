import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/jwt.js";

// req with the authed user attached
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "CUSTOMER" | "VET" | "ADMIN";
  };
}

// verify the jwt from the auth header
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access token required for this operation." });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Token not found on authorization payload." });
      return;
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ error: "Token verification failed or has expired." });
        return;
      }

      // attach the user to the request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    });
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    res.status(500).json({ error: "A server side authentication failure transpired." });
  }
}

// only let through users whose role is in the list
export function requireRoles(roles: ("CUSTOMER" | "VET" | "ADMIN")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication credentials required." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Insufficient privileges to perform requested command.",
      });
      return;
    }

    next();
  };
}
