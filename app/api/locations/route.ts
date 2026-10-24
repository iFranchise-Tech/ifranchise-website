import {citiesForState} from '../../../lib/location-cities.mjs';
export async function GET(request:Request){
 try{return Response.json({cities:citiesForState(new URL(request.url).searchParams.get('state'))},{headers:{'Cache-Control':'public, max-age=86400','Link':'</data/india-locations.provenance.json>; rel="describedby"'}})}
 catch{return Response.json({error:'Choose a state or union territory.'},{status:400})}
}
