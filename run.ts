import {
    engine,
    argsValidation
} from "../deno/lib/deps.ts"

export const global_time: number = Date.now()
const args_from_cli: string[] = Deno.args
const displayMoreInfo: boolean = argsValidation(args_from_cli)

engine(displayMoreInfo)
