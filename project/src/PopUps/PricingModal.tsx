"use client"

import { Fragment, useState } from "react"
import { Dialog, Transition, RadioGroup } from "@headlessui/react"
import { CheckIcon, XIcon as XMarkIcon } from "lucide-react"
import React from "react"

type BillingCycle = "monthly" | "yearly"

interface PricingModalProps {
  onClose: (value: boolean) => void;
  isOpen: boolean;
}

export default function PricingModal({ onClose, isOpen }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
        
  const starterFeatures = [
    "Unlimited businesses",
    "6 weekly unique posts",
    "180 unique post generations (per month)",
    "3 different visuals for each post",
    "4 connected socials",
    "No watermark",
    "24/7 chat support",
  ]

  const professionalFeatures = [
    "Unlimited businesses",
    "12 weekly unique posts",
    "360 unique post generations (per month)",
    "3 different visuals for each post",
    "4 connected socials",
    "No watermark",
    "24/7 chat support",
  ]

  return (
      <Transition appear show={isOpen } as={Fragment}>
      <Dialog as="div" className="relative z-[99999]" onClose={() => onClose(false)}>
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all relative ">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white focus:outline-none"
                    onClick={() => onClose(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white py-12">
                  Choose Your Plan
                </Dialog.Title>
                <div className="mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select the perfect plan for your social media needs
                  </p>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-zinc-700 pt-6">
                  <div className="flex justify-center">
                    <RadioGroup
                      value={billingCycle}
                      onChange={setBillingCycle}
                      className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 dark:bg-zinc-800 p-1 w-64"
                    >
                      <RadioGroup.Option value="monthly">
                        {({ checked }) => (
                          <div
                            className={`cursor-pointer rounded-md py-1 px-3 text-sm font-medium ${
                              checked
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            Monthly
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option value="yearly">
                        {({ checked }) => (
                          <div
                            className={`cursor-pointer rounded-md py-1 px-3 text-sm font-medium ${
                              checked
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            Yearly <span className="text-green-500 dark:text-green-400">(Save 20%)</span>
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Starter Plan */}
                  <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Starter</h4>
                    <p className="mt-4">
                      <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">$59</span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400"> / month</span>
                    </p>
                    <ul className="mt-6 space-y-4">
                      {starterFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="flex-shrink-0">
                            <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                          </div>
                          <p className="ml-3 text-sm text-gray-500 dark:text-gray-300">{feature}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <button
                        type="button"
                        className="w-full rounded-md bg-blue-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>

                  {/* Professional Plan */}
                  <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Professional</h4>
                    <p className="mt-4">
                      <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">$99</span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400"> / month</span>
                    </p>
                    <ul className="mt-6 space-y-4">
                      {professionalFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="flex-shrink-0">
                            <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                          </div>
                          <p className="ml-3 text-sm text-gray-500 dark:text-gray-300">{feature}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <button
                        type="button"
                        className="w-full rounded-md bg-blue-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  All plans include a 14-day free trial. No credit card required.
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
