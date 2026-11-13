'use client';
import {activateMeasurement} from '../lib/measurement.mjs';

export function TrackingBootstrap({config}:{config:{enabled:true;gtmId:string;gaMeasurementId:string}|null}){
  activateMeasurement(config);
  return null;
}
