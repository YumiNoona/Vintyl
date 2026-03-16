import React from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = !!params.session_id;
  const isCancelled = !!params.cancelled;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-6">
      <div className="max-w-md text-center">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Payment Successful! 🎉</h1>
            <p className="text-neutral-400 mb-8">
              Welcome to Vintyl Pro! You now have access to unlimited
              workspaces, AI features, and team collaboration.
            </p>
          </>
        ) : isCancelled ? (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>
            <p className="text-neutral-400 mb-8">
              No worries! You can upgrade to Pro anytime from your billing
              page.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-3">Processing...</h1>
            <p className="text-neutral-400 mb-8">
              Please wait while we process your payment.
            </p>
          </>
        )}

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
