"use client";

import { type FC } from "react";
import Image from "next/image";

interface InfoCard {
  title: string;
  description: string;
  subheading: string;
  heading: string;
  imageSrc: string;
}

const infoCards: InfoCard[] = [
  {
    title: "Performance",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In gravida justo et nulla efficitur, maximus egestas sem pellentesque.",
    subheading: "Lightning-fast builds",
    heading: "Performance",
    imageSrc: "/api/placeholder/800/600",
  },
  {
    title: "Releases",
    description: "Curabitur auctor, ex quis auctor venenatis, eros arcu rhoncus massa, laoreet dapibus ex elit vitae odio.",
    subheading: "Push to deploy",
    heading: "Releases",
    imageSrc: "/api/placeholder/800/600",
  },
  {
    title: "Speed",
    description: "Sed congue eros non finibus molestie. Vestibulum euismod augue.",
    subheading: "Built for power users",
    heading: "Speed",
    imageSrc: "/api/placeholder/800/600",
  },
  {
    title: "Integrations",
    description: "Maecenas at augue sed elit dictum vulputate, in nisi aliquam maximus arcu.",
    subheading: "Connect your favorite tools",
    heading: "Integrations",
    imageSrc: "/api/placeholder/800/600",
  },
  {
    title: "Network",
    description: "Aenean vulputate justo commodo auctor vehicula in malesuada semper.",
    subheading: "Globally distributed CDN",
    heading: "Network",
    imageSrc: "/api/placeholder/800/600",
  },
];

export const AIInfo: FC = () => {
  return (
    <div id="aivurd" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-indigo-600">AI drevet troverdighetsindex</h2>
        <p className="mt-2 max-w-lg text-pretty text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
          Finn hvem du kan stole på eller om noen holder deg for narr.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {/* First card - spans 3 columns */}
          <div className="relative lg:col-span-3">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
              <div className="h-80 relative">
                <Image
                  alt=""
                  src={infoCards[0]?.imageSrc ?? ""}
                  fill
                  className="object-cover object-left"
                />
              </div>
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600">{infoCards[0]?.heading}</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{infoCards[0]?.subheading}</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{infoCards[0]?.description}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
          </div>

          {/* Second card - spans 3 columns */}
          <div className="relative lg:col-span-3">
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-tr-[2rem]" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
              <div className="h-80 relative">
                <Image
                  alt=""
                  src={infoCards[1]?.imageSrc ?? ""}
                  fill
                  className="object-cover object-left lg:object-right"
                />
              </div>
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600">{infoCards[1]?.heading}</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{infoCards[1]?.subheading}</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{infoCards[1]?.description}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[2rem]" />
          </div>

          {/* Third card - spans 2 columns */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-bl-[2rem]" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-bl-[calc(2rem+1px)]">
              <div className="h-80 relative">
                <Image
                  alt=""
                  src={infoCards[2]?.imageSrc ?? ""}
                  fill
                  className="object-cover object-left"
                />
              </div>
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600">{infoCards[2]?.heading}</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{infoCards[2]?.subheading}</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{infoCards[2]?.description}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-bl-[2rem]" />
          </div>

          {/* Fourth card - spans 2 columns */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-px rounded-lg bg-white" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
              <div className="h-80 relative">
                <Image
                  alt=""
                  src={infoCards[3]?.imageSrc ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600">{infoCards[3]?.heading}</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{infoCards[3]?.subheading}</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{infoCards[3]?.description}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
          </div>

          {/* Fifth card - spans 2 columns */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]">
              <div className="h-80 relative">
                <Image
                  alt=""
                  src={infoCards[4]?.imageSrc ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600">{infoCards[4]?.heading}</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{infoCards[4]?.subheading}</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{infoCards[4]?.description}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInfo;