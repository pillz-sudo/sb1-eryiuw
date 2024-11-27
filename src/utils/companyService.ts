import { debounce } from 'lodash-es';

export interface CompanySuggestion {
  name: string;
  domain: string;
  logo: string;
}

const CLEARBIT_API_URL = 'https://autocomplete.clearbit.com/v1/companies/suggest';

async function fetchSuggestions(query: string): Promise<CompanySuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(`${CLEARBIT_API_URL}?query=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching company suggestions:', error);
    return [];
  }
}

export const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);