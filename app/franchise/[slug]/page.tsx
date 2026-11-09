import {permanentRedirect} from 'next/navigation';
import {legacyBrandDestination} from '../../../lib/brand-routes.mjs';

export default async function LegacyBrand({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [{slug},query]=await Promise.all([params,searchParams]);
 permanentRedirect(legacyBrandDestination(slug,query,false));
}
