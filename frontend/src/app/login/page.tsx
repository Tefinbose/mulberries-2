"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf6f2] flex items-center justify-center px-4" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-md shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/MULBERRIES.png" alt="Mulberries" width={140} height={36} className="h-9 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-gray-500 text-sm mt-3">Sign in to your account</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 px-3 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5c1a52] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#4a1543] transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#5c1a52] font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </main>
  );
}
