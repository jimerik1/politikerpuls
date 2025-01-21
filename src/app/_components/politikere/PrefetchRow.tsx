import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from "~/trpc/react";

interface PrefetchLinkProps {
  politicianId: string;
  children: React.ReactNode;
  className?: string;
}

const PrefetchLink = ({ politicianId, children, className }: PrefetchLinkProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const utils = api.useUtils();
  
  useEffect(() => {
    if (!linkRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Prefetch the detailed data needed for the politician's page
            utils.politician.getById.prefetch({ id: politicianId });
            utils.biography.getWorkExperience.prefetch(politicianId);
            // Add any other data queries that the details page needs
            
            // Once we've started prefetching, we can stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '500px',
      }
    );
    
    observer.observe(linkRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [politicianId, utils]);
  
  return (
    <Link 
      ref={linkRef}
      href={`/politikere/${politicianId}`}
      className={className}
    >
      {children}
    </Link>
  );
};

export default PrefetchLink;