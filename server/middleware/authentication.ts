import type { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.session && req.session.userId) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    // User is not authenticated, return an error response
    return res
      .status(401)
      .json({ message: 'Unauthorized: Please log in to access this resource' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isAdmin) {
    // User is an admin, proceed to the next middleware or route handler
    return next();
  } else {
    // User is not an admin, return an error response
    return res
      .status(403)
      .json({ message: 'Forbidden: Only Admins can access this resource' });
  }
};
