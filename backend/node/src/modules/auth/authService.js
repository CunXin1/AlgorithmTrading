// ------------------------------------------------------------
// authService.js
// ------------------------------------------------------------
// ------------------------------------------------------------

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../db/dbClient.js";
import dotenv from "dotenv";

dotenv.config();

export async function registerUser(email, password) {
  const exists = await db.user.findUnique({ where: { email } });

  if (exists) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      password: hashed,
    },
  });

  return { success: true, user: { id: user.id, email: user.email } };
}

export async function loginUser(email, password) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) throw new Error("User not found");

  const passOK = await bcrypt.compare(password, user.password);

  if (!passOK) throw new Error("Incorrect password");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    token,
    user: { id: user.id, email: user.email },
  };
}
