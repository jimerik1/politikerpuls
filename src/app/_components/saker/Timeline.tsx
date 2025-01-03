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
  const getEventStatus = (eventDate: Date | null, index: number) => {
    if (!eventDate) return 'upcoming';
    
    const now = new Date();
    const previousEvent = index > 0 ? events[index - 1] : null;
    const previousDate = previousEvent?.date;

    if (eventDate < now) return 'complete';
    if (previousDate && previousDate < now && eventDate >= now) return 'current';
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {events.map((event, eventIdx) => {
          const status = getEventStatus(event.date, eventIdx);
          
          return (
            <li key={eventIdx} className={eventIdx !== events.length - 1 ? 'pb-10 relative' : 'relative'}>
              {eventIdx !== events.length - 1 && (
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
                      <span className="size-2.5 rounded-full bg-indigo-600" />
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