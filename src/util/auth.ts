import { Request, Response } from "express";
import { getRepository } from "typeorm";
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
  const token = request.get("Authorization");

  if (!token || !token.split(" ").length) {
    return response.status(403).send({ message: "No valid token provided" });
  }

  const tokenData = token.split(" ")[1];

  jwt.verify(tokenData, JWT_SECRET, (err, decoded: { id: string }) => {
    if (err) {
      return response
        .status(500)
        .send({ message: "Failed to authenticate token" });
    }
    getRepository(User)
      .findOne(parseInt(decoded.id))
      .then(user => {
        request.params["user"] = user;
        next();
      })
      .catch(err => {
        console.log(err);
        return response.status(403).send({ message: "User not found!" });
      });
  });
};
