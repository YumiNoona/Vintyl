import React from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">You&apos;re All Set!</h1>
        <p className="text-neutral-400 mb-8">
          Vintyl is completely free — all features are unlocked.
        </p>

        <Link href="/dashboard">
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
