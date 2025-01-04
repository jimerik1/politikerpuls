import { CheckIcon } from '@heroicons/react/20/solid';

interface TimelineEvent {
  stepName: string;
  date: Date | null;
  documentUrl?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  // Deduplicate events - prefer events with dates over those without
  const deduplicatedEvents = events.reduce((acc: TimelineEvent[], event) => {
    const existingEventIndex = acc.findIndex(e => e.stepName === event.stepName);
    
    if (existingEventIndex === -1) {
      // No duplicate found, add the event
      acc.push(event);
    } else if (existingEventIndex >= 0) {
      // Duplicate found, keep the one with a date if possible
      const existingEvent = acc[existingEventIndex];
      // Explicitly check that existingEvent exists and compare dates
      if (existingEvent && !existingEvent.date && event.date) {
        // Replace the existing event without date with the new event that has a date
        acc[existingEventIndex] = event;
      }
      // If the existing event has a date and new event doesn't, keep the existing one
    }
    
    return acc;
  }, []);

  // Sort events to ensure specific order: "Forslag", "Komitebehandling", "Debatt og vedtak"
  // When events have the same date, place "Referat" after other events
  const eventOrder = ["Forslag", "Komitebehandling", "Debatt og vedtak"];
  const sortedEvents = [...deduplicatedEvents].sort((a, b) => {
    // First sort by the predefined order
    const aIndex = eventOrder.indexOf(a.stepName);
    const bIndex = eventOrder.indexOf(b.stepName);
    
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    
    // If dates are different, sort by date
    if (a.date && b.date && a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    
    // If dates are the same or both null, put Referat last
    const aHasReferat = a.stepName.includes('Referat');
    const bHasReferat = b.stepName.includes('Referat');
    if (aHasReferat && !bHasReferat) return 1;
    if (!aHasReferat && bHasReferat) return -1;
    
    return 0;
  });

  const getEventStatus = (event: TimelineEvent, index: number) => {
    const now = new Date();
    
    // Find the index of the last completed event
    const lastCompletedIndex = sortedEvents.reduce((lastIndex, currentEvent, currentIndex) => {
      if (currentEvent.date && currentEvent.date < now) {
        return currentIndex;
      }
      return lastIndex;
    }, -1);
    
    // The event immediately after the last completed one is the current event
    if (index === lastCompletedIndex + 1) {
      return 'current';
    }
    
    // Events before the current one are complete
    if (index <= lastCompletedIndex) {
      return 'complete';
    }
    
    // All other events are upcoming
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {sortedEvents.map((event, eventIdx) => {
          const status = getEventStatus(event, eventIdx);
          
          return (
            <li key={eventIdx} className={eventIdx !== sortedEvents.length - 1 ? 'pb-10 relative' : 'relative'}>
              {eventIdx !== sortedEvents.length - 1 && (
                <div 
                  aria-hidden="true" 
                  className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
                    status === 'complete' ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} 
                />
              )}
              <div className="group relative flex items-start">
                <span className="flex h-9 items-center">
                  {status === 'complete' ? (
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-indigo-600">
                      <CheckIcon className="size-5 text-white" />
                    </span>
                  ) : status === 'current' ? (
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                      <span className="relative z-10 flex size-4 items-center justify-center rounded-full bg-indigo-600" />
                    </span>
                  ) : (
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="size-2.5 rounded-full bg-transparent" />
                    </span>
                  )}
                </span>
                <span className="ml-4 flex min-w-0 flex-col">
                  <span className={`text-sm font-medium ${
                    status === 'current' ? 'text-indigo-600' : status === 'complete' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {event.stepName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {event.date ? event.date.toLocaleDateString('no') : 'Dato ikke satt'}
                  </span>
                  {event.documentUrl && (
                    <a
                      href={event.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mt-1"
                    >
                      Se dokument
                    </a>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Timeline;