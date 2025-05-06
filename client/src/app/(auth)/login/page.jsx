"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "../../../redux/services/api";
import Image from "next/image";
import loginImage from "../../../../public/login-illustrator.png";

const LoginPage = () => {
  console.log("Rendering LoginPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading, error: loginError }] = useLoginMutation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Check for error in URL params when component mounts
  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'user_not_found') {
      setError('User session expired or not found. Please login again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing errors
    console.log("Attempting login with:", {
      ...formData,
      password: "[HIDDEN]",
    });
    try {
      const result = await login(formData).unwrap();
      console.log("Login successful:", { ...result, token: "[HIDDEN]" });
      router.replace("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.data?.message || "Login failed. Please check your credentials.",
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-100 flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
        {/* Left Image Section */}
        <div className="flex items-center justify-center bg-white p-8">
          <Image
            src={loginImage}
            alt="Login Illustration"
            className="h-auto w-3/4"
          />
        </div>

        {/* Right Form Section */}
        <div className="flex flex-col justify-center px-8 py-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Login</h2>

          {(error || loginError) && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error || loginError?.data?.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 12A4 4 0 118 12a4 4 0 018 0zM12 14v2m0 4h.01"
                  />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full rounded-full bg-gray-100 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11c1.5 0 3-1 3-3s-1.5-3-3-3-3 1-3 3 1.5 3 3 3zm0 2c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"
                  />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full rounded-full bg-gray-100 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-blue-500 py-3 font-semibold text-white transition hover:bg-blue-600"
            >
              {isLoading ? "Signing in..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <a href="/register" className="hover:underline">
              Create your Account →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
