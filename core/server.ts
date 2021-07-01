import {
    engine,
    argsValidation
} from "../lib/deps.ts"

export const global_time: number = Date.now()

const args_from_cli: string[] = Deno.args
const isSecure: boolean = argsValidation(args_from_cli[0])

engine(isSecure)
