"use client";

import { type FC } from "react";
import { 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  icon: typeof BarChart3;
}

const features: Feature[] = [
  {
    name: "Transparent Politisk Sporing",
    description:
      "Undersøk hvordan stortingsrepresentanter faktisk stemmer, ikke bare hva de sier. Vår database sporer hver eneste votering og sammenligner det med politikernes offentlige uttalelser, så du kan se hvem som holder det de lover.",
    icon: BarChart3,
  },
  {
    name: "Faktabasert Ansvarliggjøring",
    description:
      "Med vår database kan du enkelt finne dokumentasjon på politikernes stemmehistorikk og uttalelser. Dette gir velgere et solid grunnlag for å holde politikere ansvarlige for deres valg og løfter.",
    icon: PieChart,
  },
  {
    name: "AI-drevet Troverdighetsindeks",
    description:
      "Få analysert  sammenhengen mellom politikeres løfter, uttalelser og faktiske stemmegivning ved å bruke ChatGPT, Claude eller andre kunstig intelligens-modeller.",
    icon: TrendingUp,
  },
  {
    name: "Demokratisk Innsyn",
    description:
      "Få tilgang til hvordan din representant stemmer i saker som er viktige for deg. Vårt verktøy gjør kompleks politisk data forståelig og tilgjengelig for velgere.",
    icon: Users,
  },
];

export const Features: FC = () => {
  return (
    <div id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Funksjoner
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Når løfter møter virkelighet
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
          Utforsk stortingsrepresentantenes stemmehistorikk og få innsikt i hvordan dine folkevalgte faktisk stemmer i sakene som betyr noe for deg.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon
                    className="h-5 w-5 flex-none text-indigo-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};