"use client";
export default function StripeCancel() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-extrabold text-red-600 mb-4">
        Payment Cancelled
      </h1>
      <p className="text-lg text-gray-600">
        Your subscription was not processed. You can try again anytime.
      </p>
      <div className="mt-10">
        <a
          href="/pricing"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Pricing
        </a>
      </div>
    </div>
  );
}
