// src/controllers/auth.controller.ts
import { RequestHandler } from "express";
import { createResponse } from "../../utils/apiResponseUtils";
import { User } from "../../models/user.model";
import bcrypt from "bcrypt";
import { clerkClient } from "@clerk/clerk-sdk-node";

const signUpUser: RequestHandler = async (req, res) => {
  let clerkUser;
  try {
    const { fullname, email, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !password) {
      return createResponse(res, 400, null, "All fields are required");
    }

    // Check if user already exists in our DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createResponse(res, 409, null, "Email already in use");
    }

    const firstName = fullname.split(" ")[0];
    const lastName = fullname.split(" ").slice(1).join(" ") || "";

    // Create user in Clerk first
    try {
      clerkUser = await clerkClient.users.createUser({
        firstName,
        lastName,
        emailAddress: [email],
        password,
        publicMetadata: {
          email,
          firstName,
          lastName,
        },
      });
    } catch (clerkError) {
      console.error("Clerk user creation failed:", clerkError);
      return createResponse(
        res,
        500,
        null,
        "Failed to create user authentication",
        "Could not complete registration"
      );
    }

    // Hash password for our database (separate from Clerk's hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const newUser = await User.create({
      _id: clerkUser.id,
      fullname,
      email,
      password: hashedPassword,
    });

    const userResponse = {
      id: newUser._id,
      clerkId: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    return createResponse(
      res,
      201,
      userResponse,
      null,
      "User created successfully"
    );
  } catch (error) {
    console.error("Signup error:", error);

    // Attempt to clean up Clerk user if MongoDB creation failed
    if (clerkUser?.id) {
      try {
        await clerkClient.users.deleteUser(clerkUser.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup Clerk user:", cleanupError);
      }
    }

    return createResponse(
      res,
      500,
      null,
      "Internal server error",
      "Something went wrong during registration"
    );
  }
};

export const authController = {
  signUpUser,
};
