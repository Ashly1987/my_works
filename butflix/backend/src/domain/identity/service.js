const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const { env } = require("../../config/env");

function createIdentityService(store) {
  async function register({ email, password }) {
    const db = store.read();
    const exists = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      throw { status: 409, message: "Email already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    store.write(db);

    return buildSession(user);
  }

  async function login({ email, password }) {
    const db = store.read();
    const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw { status: 401, message: "Invalid email or password" };
    }

    return buildSession(user);
  }

  function validateSession(token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      return { valid: true, user: payload };
    } catch (_err) {
      return { valid: false };
    }
  }

  function buildSession(user) {
    const authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(authUser, env.jwtSecret, { expiresIn: "7d" });
    return { user: authUser, token };
  }

  return {
    register,
    login,
    validateSession,
  };
}

module.exports = { createIdentityService };
