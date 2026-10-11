import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export default function SearchPage() {
  return <Suspense fallback={<main className="min-h-screen p-8 text-sm text-gray-400">Loading search...</main>}><SearchClient /></Suspense>;
}
