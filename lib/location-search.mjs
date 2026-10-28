export const locationSearchKey = value => String(value || '').normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
export function matchingCities(cities, query) {
 const term = locationSearchKey(query);
 if(term.length < 2) return [];
 return cities.filter(city => [city.name, ...(city.aliases || [])].some(name => locationSearchKey(name).includes(term))).slice(0, 12);
}
