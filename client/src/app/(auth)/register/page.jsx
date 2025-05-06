"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegisterMutation } from "../../../redux/services/api";

const RegisterPage = () => {
  console.log("Rendering RegisterPage");
  const router = useRouter();
  const [register, { isLoading, error: registerError }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    console.log("Attempting registration with:", {
      ...formData,
      password: "[HIDDEN]",
    });
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }).unwrap();
      console.log("Registration successful:", { ...result, token: "[HIDDEN]" });
      router.push("/");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.data?.message || "Registration failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>

        {(error || registerError) && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error || registerError?.data?.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.66 0 3-1.34 3-3S13.66 5 12 5 9 6.34 9 8s1.34 3 3 3zm0 2c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-full bg-gray-100 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12A4 4 0 118 12a4 4 0 018 0z"
                />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-full bg-gray-100 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.5 0 3-1 3-3s-1.5-3-3-3-3 1-3 3 1.5 3 3 3zm0 2c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"
                />
              </svg>
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full rounded-full bg-gray-100 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.5 0 3-1 3-3s-1.5-3-3-3-3 1-3 3 1.5 3 3 3zm0 2c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"
                />
              </svg>
            </span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-full bg-gray-100 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-full bg-blue-500 py-3 font-semibold text-white transition hover:bg-blue-600 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
