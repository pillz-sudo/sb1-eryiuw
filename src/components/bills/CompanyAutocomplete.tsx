import React, { useState, useEffect, useRef } from 'react';
import { CompanySuggestion, debouncedFetchSuggestions } from '../../utils/companyService';
import { Search } from 'lucide-react';

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: CompanySuggestion) => void;
  onBlur?: () => void;
}

export function CompanyAutocomplete({ value, onChange, onBlur }: CompanyAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchCompanies() {
      if (!value || value.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await debouncedFetchSuggestions(value);
        
        if (isMounted) {
          setSuggestions(results || []);
          setIsOpen(Boolean(results?.length));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (isMounted) {
          setSuggestions([]);
          setLoading(false);
        }
      }
    }

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [value]);

  const handleSuggestionClick = (suggestion: CompanySuggestion) => {
    onChange(suggestion.name, suggestion);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (value.length >= 2 && suggestions && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={() => setTimeout(() => onBlur?.(), 200)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter company name..."
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && suggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.domain}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
            >
              <img
                src={suggestion.logo}
                alt={`${suggestion.name} logo`}
                className="w-6 h-6 rounded-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
                <div className="text-xs text-gray-500">{suggestion.domain}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}