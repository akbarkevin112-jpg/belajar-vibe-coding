import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src";
import { resetDatabase } from "./utils";

describe("User API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST /api/users (Registration)", () => {
    it("should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.data).toBe("OK");
    });

    it("should fail to register with a duplicate email", async () => {
      // First registration
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );

      // Second registration with same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin Clone",
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.Error).toBe("Email sudah terdaftar");
    });

    it("should fail validation with invalid email format", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "invalid-email",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should fail validation with short password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "kevin@gmail.com",
            password: "short",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should fail validation with name exceeding 255 characters", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "A".repeat(300),
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Register a user to login with
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
    });

    it("should fail to login with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "kevin@gmail.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.Error).toBe("Email atau password salah");
    });

    it("should fail to login with non-existent email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "unknown@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/users/current", () => {
    let token: string;

    beforeEach(async () => {
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );

      const loginResponse = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "kevin@gmail.com",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginResponse.json();
      token = loginBody.data;
    });

    it("should fetch current user profile with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.name).toBe("Kevin");
      expect(body.data.email).toBe("kevin@gmail.com");
      expect(body.data.password).toBeUndefined();
    });

    it("should fail to fetch profile without authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer invalid-token`,
          },
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/logout", () => {
    let token: string;

    beforeEach(async () => {
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Kevin",
            email: "kevin@localhost",
            password: "password123",
          }),
        })
      );

      const loginResponse = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "kevin@localhost",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginResponse.json();
      token = loginBody.data;
    });

    it("should logout successfully and invalidate token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      expect((await response.json()).data).toBe("OK");

      // Verify token is invalidated
      const profileResponse = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(profileResponse.status).toBe(401);
    });
  });
});
