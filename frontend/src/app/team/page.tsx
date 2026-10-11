import type { Metadata } from "next";
import TeamPageClient from "@/components/TeamPageClient";

export const metadata: Metadata = {
  title: "Meet Our Team & Values | Mulberries Boutique UAE",
  description:
    "Meet the passionate team, regional managers, and values behind Mulberries Boutique in Dubai, Abu Dhabi, and Sharjah.",
};

export default function TeamPage() {
  return <TeamPageClient />;
}
