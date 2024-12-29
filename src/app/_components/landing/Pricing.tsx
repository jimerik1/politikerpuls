"use client";

import { type FC, useState } from "react";
import { Check } from "lucide-react";
import clsx from 'clsx';

interface PricingTier {
  name: string;
  id: string;
  href: string;
  price: { monthly: string; annually: string };
  description: string;
  features: string[];
  mostPopular: boolean;
}

interface PricingFrequency {
  value: "monthly" | "annually";
  label: string;
}

const frequencies: PricingFrequency[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

const tiers: PricingTier[] = [
    {
      name: "Basic",
      id: "tier-basic",
      href: "#",
      price: { monthly: "$29", annually: "$290" },
      description: "Essential tools for political engagement.",
      features: [
        "Basic analytics dashboard",
        "Daily data updates",
        "Up to 1,000 constituent profiles",
        "Email support",
      ],
      mostPopular: false,
    },
    {
      name: "Professional",
      id: "tier-professional",
      href: "#",
      price: { monthly: "$99", annually: "$990" },
      description: "Advanced tools for growing political impact.",
      features: [
        "Advanced analytics dashboard",
        "Real-time data updates",
        "Up to 10,000 constituent profiles", // Changed from > to "Up to"
        "Priority support",
        "Custom reports",
        "API access",
      ],
      mostPopular: true,
    },
    {
      name: "Enterprise",
      id: "tier-enterprise",
      href: "#",
      price: { monthly: "$499", annually: "$4990" },
      description: "Maximum impact for large organizations.",
      features: [
        "Full analytics suite",
        "Real-time data with historical analysis",
        "Unlimited constituent profiles",
        "24/7 priority support",
        "Custom development",
        "Dedicated account manager",
        "Advanced API access",
      ],
      mostPopular: false,
    },
  ];
  

  export const Pricing: FC = () => {
    const [frequency, setFrequency] = useState<PricingFrequency>(frequencies[0]!);
  
    return (
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Plans for campaigns of all sizes
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
            Choose the perfect plan to help you reach your political goals. All plans
            include core analytics and engagement features.
          </p>
  
          {/* Pricing tiers */}
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={clsx(
                  "flex flex-col justify-between rounded-3xl bg-white/5 p-8 ring-1",
                  tier.mostPopular ? "ring-indigo-500" : "ring-white/10"
                )}
              >
                <div>
                  <h3
                    className={clsx(
                      "text-lg font-semibold leading-8",
                      tier.mostPopular ? "text-indigo-400" : "text-white"
                    )}
                  >
                    {tier.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-x-2">
                    <span className="text-4xl font-bold tracking-tight text-white">
                      {tier.price[frequency.value]}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-300">
                      /month
                    </span>
                  </div>
                  <p className="mt-6 text-base leading-7 text-gray-300">
                    {tier.description}
                  </p>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-300"
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-400"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className={clsx(
                    "mt-8 block w-full rounded-md px-3.5 py-2 text-center text-sm font-semibold leading-6",
                    tier.mostPopular
                      ? "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  