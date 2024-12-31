import { ChevronDownIcon } from '@heroicons/react/24/solid';
import type { StortingsPeriod } from './types';
import { STORTINGS_PERIODS } from './types';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="grid grid-cols-1">
      <select
        id="period"
        name="period"
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      >
        {STORTINGS_PERIODS.map((period) => (
          <option key={period.id} value={period.id}>
            {period.years} {period.isCurrent ? "(Nåværende)" : ""}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 mr-2 h-5 w-5 self-center justify-self-end text-gray-500 sm:h-4 sm:w-4"
      />
    </div>
  );
}