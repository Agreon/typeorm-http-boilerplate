import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { User } from "../entity/User";

export const createJwtToken = (user: User) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
};

export const verifyToken = (
  request: Request,
  response: Response,
  next: () => void
) => {
  const token = request.get("x-access-token");

  if (!token) {
    return response.status(403).send({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return response
        .status(500)
        .send({ message: "Failed to authenticate token" });
    }
    console.log(decoded);
    /*request.headers['x-user-id'] = decoded.id;
        request.user = decoded;*/
    next();
  });
};
