import type { Metadata } from "next";
import Smista from "@/components/dashboard/smista/Smista";

export const metadata: Metadata = { title: "Smista | BrainDump" };

export default function SmistaPage() {
  return <Smista />;
}
