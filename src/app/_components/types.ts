export type StortingsPeriod = {
    id: string;
    years: string;
    isCurrent: boolean;
  };
  
  export const STORTINGS_PERIODS = [
    { id: "2021-2025", years: "2021-2025", isCurrent: true },
    { id: "2017-2021", years: "2017-2021", isCurrent: false },
    { id: "2013-2017", years: "2013-2017", isCurrent: false },
    { id: "all", years: "Alle perioder", isCurrent: false },
  ];
  