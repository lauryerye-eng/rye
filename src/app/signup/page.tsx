"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/app/actions";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-100">Grade Tracker</h1>
          <p className="text-pink-400 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-900/50 border border-rose-800 text-rose-300 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1.5">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full bg-pink-950 border border-pink-800 text-pink-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-pink-600 text-pink-100 text-sm font-medium hover:bg-pink-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-pink-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-300 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}