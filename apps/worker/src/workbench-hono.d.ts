declare module "workbench/hono" {
  import type { Queue } from "bullmq";
  import type { Hono } from "hono";

  export type WorkbenchOptions = {
    queues?: Queue[];
    auth?: { username: string; password: string };
    title?: string;
    logo?: string;
    basePath?: string;
    readonly?: boolean;
    tags?: string[];
  };

  export function workbench(options: WorkbenchOptions | Queue[]): Hono;
}
