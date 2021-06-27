import { engine } from "./server.ts"

const ARGS: string[] = Deno.args

engine(ARGS)