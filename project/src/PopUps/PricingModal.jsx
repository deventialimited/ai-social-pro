"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { CheckIcon, XIcon as XMarkIcon } from "lucide-react";
import { createCheckoutSession ,StartTrial} from "../libs/paymentService";
import toast, { Toaster } from "react-hot-toast";

// Prices matching Payment.js PRICE_IDS.prices
const PRICES = {
  starter: { monthly: 59, yearly: 500 },
  professional: { monthly: 99, yearly: 2000 },
};
export default function PricingModal({ onClose, isOpen }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null); // Track specific plan loading

  const starterFeatures = [
    "Unlimited businesses",
    "6 weekly unique posts",
    "180 unique post generations (per month)",
    "3 different visuals for each post",
    "4 connected socials",
    "No watermark",
    "24/7 chat support",
  ];

  const professionalFeatures = [
    "Unlimited businesses",
    "12 weekly unique posts",
    "360 unique post generations (per month)",
    "3 different visuals for each post",
    "4 connected socials",
    "No watermark",
    "24/7 chat support",
  ];
const handleStartTrial = async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  try {
    console.log("user id in the pricing modal", user._id);
    onClose(true);

    const res = await StartTrial(user._id); // ✅ await it
const userObject=res.user;
        localStorage.setItem("user", JSON.stringify(userObject));
    toast.success("Trial started! Ends on " + new Date(res.user.trialEndsAt).toLocaleDateString());
  } catch (err) {
    console.error("Trial start error:", err);

    const errorMsg =
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong while starting the trial.";

    toast.error(errorMsg);
  }
};


  const handleCheckout = async (planType) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      onClose(false); // Close modal
      setTimeout(() => {
        toast.error("Please log in to subscribe");
      }, 250); // Delay for modal exit animation
      return;
    }
    setLoadingPlan(`${planType}-${billingCycle}`);
    try {
      const { url } = await createCheckoutSession(planType, billingCycle, user);
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      onClose(false); // Close modal before showing toast
      setTimeout(() => {
        if (error.response?.status === 400 && error.response?.data?.error === "User already has an active subscription") {
          toast.error("You already have an active subscription. Visit subscription management to upgrade or cancel.", {
            duration: 5000,
          });
        } else if (error.response?.status === 404) {
          toast.error("User not found. Please log in again.");
        } else if (error.response?.status === 500) {
          toast.error("Something went wrong. Please try again later.");
        } else {
          toast.error("Failed to start subscription. Please try again.");
        }
      }, 250); // Delay for modal exit animation
    } finally {
      setLoadingPlan(null);
    }
  };

  // Calculate savings for yearly plans
  const getSavings = (planType) => {
    const monthlyTotal = PRICES[planType].monthly * 12;
    const yearly = PRICES[planType].yearly;
    const savingsPercent = Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100);
    return savingsPercent;
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            zIndex: 100000, // Ensure visibility above page elements
            background: "#333",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
          duration: 5000,
        }}
      />
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[99999]"
          onClose={() => onClose(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-zinc-900 p-6 text-center align-middle shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white focus:outline-none"
                    onClick={() => onClose(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <Dialog.Title
                    as="h2"
                    className="text-2xl font-semibold text-gray-900 dark:text-white mt-4"
                  >
                    Choose Your Plan
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select the perfect plan for your social media needs
                  </p>

                  <div className="mt-6 flex justify-center">
                    <RadioGroup
                      value={billingCycle}
                      onChange={setBillingCycle}
                      className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1"
                    >
                      <RadioGroup.Option value="monthly">
                        {({ checked }) => (
                          <div
                            className={`cursor-pointer rounded-md py-1.5 px-6 text-sm font-medium transition-colors ${
                              checked
                                ? "bg-blue-500 text-white dark:bg-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                          >
                            Monthly
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option value="yearly">
                        {({ checked }) => (
                          <div
                            className={`cursor-pointer rounded-md py-1.5 px-6 text-sm font-medium transition-colors ${
                              checked
                                ? "bg-blue-500 text-white dark:bg-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                          >
                            Yearly{" "}
                            <span className="dark:text-green-400">
                              (Save {getSavings("starter")}%)
                            </span>
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {/* Starter Plan */}
                    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 text-left shadow-sm">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Starter
                      </h4>
                      <p className="mt-4">
                        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                          ${PRICES.starter[billingCycle]}
                        </span>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {" "}
                          / {billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </p>
                      <ul className="mt-6 space-y-3">
                        {starterFeatures.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <div className="flex-shrink-0">
                              <CheckIcon
                                className="h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                            </div>
                            <p className="ml-3 text-sm text-gray-500 dark:text-gray-300">
                              {feature}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <button
                          disabled={loadingPlan === `starter-${billingCycle}`}
                          type="button"
                          onClick={() => handleCheckout("starter")}
                          className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                        >
                          {loadingPlan === `starter-${billingCycle}` ? "Redirecting..." : "Get Started"}
                        </button>
                      </div>
                    </div>

                    {/* Professional Plan */}
                    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 text-left shadow-sm">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Professional
                      </h4>
                      <p className="mt-4">
                        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                          ${PRICES.professional[billingCycle]}
                        </span>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {" "}
                          / {billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </p>
                      <ul className="mt-6 space-y-3">
                        {professionalFeatures.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <div className="flex-shrink-0">
                              <CheckIcon
                                className="h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                            </div>
                            <p className="ml-3 text-sm text-gray-500 dark:text-gray-300">
                              {feature}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <button
                          disabled={loadingPlan === `professional-${billingCycle}`}
                          type="button"
                          onClick={() => handleCheckout("professional")}
                          className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                        >
                          {loadingPlan === `professional-${billingCycle}` ? "Redirecting..." : "Get Started"}
                        </button>
                      </div>
                    </div>
                  </div>

                 <button
  className="underline text-blue-500 mt-4"
  onClick={handleStartTrial}
>
  Try 14-day free trial. No credit card required.
</button>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}