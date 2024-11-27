import { Bill } from '../types';

function extractDomain(name: string): string {
  // Remove common words and clean the name
  const cleanName = name.toLowerCase()
    .replace(/\b(bill|payment|service|inc|llc|corp|corporation)\b/g, '')
    .trim()
    .replace(/[^a-z0-9]/g, '');

  // Common company domains mapping
  const commonDomains: Record<string, string> = {
    'netflix': 'netflix.com',
    'spotify': 'spotify.com',
    'amazon': 'amazon.com',
    'hulu': 'hulu.com',
    'att': 'att.com',
    'verizon': 'verizon.com',
    'tmobile': 't-mobile.com',
    'comcast': 'xfinity.com',
    'spectrum': 'spectrum.com',
    'progressive': 'progressive.com',
    'geico': 'geico.com',
    'statefarm': 'statefarm.com',
    'chase': 'chase.com',
    'bankofamerica': 'bankofamerica.com',
    'wellsfargo': 'wellsfargo.com',
    'capitalone': 'capitalone.com',
    'discover': 'discover.com',
    'amex': 'americanexpress.com',
  };

  return commonDomains[cleanName] || `${cleanName}.com`;
}

export function getLogoUrl(bill: Bill): string {
  if (bill.logoUrl) {
    return bill.logoUrl;
  }

  const domain = bill.companyDomain || extractDomain(bill.name);
  return `https://logo.clearbit.com/${domain}`;
}