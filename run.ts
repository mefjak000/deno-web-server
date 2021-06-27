import {
    engine,
    argsValidation,
    getJSONfile,
    log_style,
    writeLogToFile
} from "./lib/deps.ts"

const args_from_cli: string[] = Deno.args
const displayMoreInfo: boolean = argsValidation(args_from_cli)

try {
    await engine(displayMoreInfo)
} catch(e) {
    if (displayMoreInfo) console.log(log_style.error.name, log_style.error.color, `Error: ${e}`)
    writeLogToFile(log_style.error.name, `Error: ${e.name}`)
    Deno.exit()
}