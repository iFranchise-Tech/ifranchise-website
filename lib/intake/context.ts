import {AsyncLocalStorage} from 'node:async_hooks';
const contexts=new AsyncLocalStorage<ExecutionContext>();
export function withIntakeContext<T>(ctx:ExecutionContext,run:()=>T){return contexts.run(ctx,run)}
export async function finishDelivery(work:Promise<unknown>){const ctx=contexts.getStore();if(ctx)ctx.waitUntil(work.catch(()=>{}));else await work;}
