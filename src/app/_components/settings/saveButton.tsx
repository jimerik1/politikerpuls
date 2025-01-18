import { useEffect, useState } from "react";

export const SaveButton = ({ isSaving }: { isSaving: boolean }) => {
    const [dots, setDots] = useState('.');
    
    useEffect(() => {
      if (isSaving) {
        const interval = setInterval(() => {
          setDots(current => {
            if (current === '...') return '.';
            return current + '.';
          });
        }, 500);
        
        return () => clearInterval(interval);
      } else {
        setDots('.');
      }
    }, [isSaving]);
  
    return (
      <button
        type="submit"
        className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors duration-200 ${
          isSaving 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-purple-600 hover:bg-purple-500'
        }`}
        disabled={isSaving}
      >
        {isSaving ? `Lagrer${dots}` : "Lagre endringer"}
      </button>
    );
  };