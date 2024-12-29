"use client";

import { type FC } from "react";

interface Stat {
  id: number;
  name: string;
  value: string;
}

const stats: Stat[] = [
  { id: 1, name: 'Political Insights Generated', value: '1M+' },
  { id: 2, name: 'Active Politicians', value: '8,000+' },
  { id: 3, name: 'Policy Success Rate', value: '94%' },
  { id: 4, name: 'Citizen Engagement', value: '500K+' },
];

export const Hero: FC = () => {
  return (
    <div className="relative bg-white">
      <img
        alt="Political engagement"
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
        className="h-56 w-full bg-gray-50 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2"
      />
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="px-6 pb-24 pt-16 sm:pb-32 sm:pt-20 lg:col-start-2 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
            <h2 className="text-base font-semibold leading-8 text-indigo-600">
              Track Record
            </h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Empowering Political Engagement Worldwide
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform political engagement with real-time insights, comprehensive analytics, 
              and data-driven decision making tools designed for modern democracy.
            </p>
            <dl className="mt-16 grid max-w-xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 xl:mt-16">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6"
                >
                  <dt className="text-sm leading-6 text-gray-600">{stat.name}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};