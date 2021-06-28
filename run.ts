import {
    engine,
    argsValidation,
    getJSONfile,
    log_style,
    writeLogToFile
} from "../deno/lib/deps.ts"

const args_from_cli: string[] = Deno.args
const displayMoreInfo: boolean = argsValidation(args_from_cli)

engine(displayMoreInfo)
