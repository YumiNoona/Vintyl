import { Suspense } from "react";
import { AuthForm } from "./AuthForm";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <AuthForm />
    </Suspense>
  );
}
