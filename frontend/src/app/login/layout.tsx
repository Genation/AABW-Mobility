import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — AABW Mobility",
  description: "Sign in to access the AABW Mobility AI Hackathon Dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
