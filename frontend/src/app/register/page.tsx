"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <main className="min-h-screen bg-[#faf6f2] flex items-center justify-center px-4 py-10" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-md shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/MULBERRIES.png" alt="Mulberries" width={140} height={36} className="h-9 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-gray-500 text-sm mt-3">Create your account</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 px-3 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={set("name")}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input type="email" required value={form.email} onChange={set("email")}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="tel" value={form.phone} onChange={set("phone")}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="+971 50 000 0000" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input type="password" required value={form.password} onChange={set("password")}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
            <input type="password" required value={form.confirm} onChange={set("confirm")}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#5c1a52] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#4a1543] transition-colors disabled:opacity-60 mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5c1a52] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
