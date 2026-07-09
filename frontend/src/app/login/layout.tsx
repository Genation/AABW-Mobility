import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Tasco",
  description: "Sign in to access the Tasco AI Hackathon Dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
