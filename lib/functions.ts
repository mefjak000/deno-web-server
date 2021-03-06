import {
    parse,
    log_style,
    testing as test,
    rand_sid as sid,
} from "../lib/deps.ts";

export const global_time: number = Date.now()

/**
 * Used in testing.
 * @param { any } test_instance - Used to display parameter and type in console.
 * @param { boolean } display_type - //TODO.
 */
export function CLItest(test_instance: any, display_type: boolean = false) {
    if (display_type) console.log(log_style.test.name, log_style.test.color, test_instance, typeof test_instance)
    console.log(log_style.test.name, log_style.test.color, test_instance)
}

/**
 * Gets info about specific file.
 * @param { string } file_path - Pases path to "parse()" function from "Oak framework".
 */
export function getFileInfo(file_path: string) {
    const path = parse(file_path)
    return path
}

/**
 * Parsing number to two digits length if one.
 * @param { number } num - parsed number.
 */
export function formatNumberInLog(num: number, indexOf: number = -2): string {
    return ("0" + num).slice(indexOf)
}

/**
 * Writes log to .log file.
 * @param { string } name - Server log label.
 * @param { string } message - Server log message.
 * @param { boolean } add - Variable enables appending to the .log file instead of overwrite it.
 */
export async function writeLogToFile(type_id: number = 0, name: string, message: string, add: boolean = true) {
    const date = new Date()
    const date_str: string = `${formatNumberInLog(date.getFullYear(), -4)}/${formatNumberInLog(date.getMonth())}/${formatNumberInLog(date.getDate())} ${formatNumberInLog(date.getHours())}:${formatNumberInLog(date.getMinutes())}:${formatNumberInLog(date.getSeconds())}`
    name = name.slice(2) // Delete %c prefix for color in console
    let log: string

    if (type_id == 0) {
        log = `SERVER START id: ${sid}\n[${date_str}] ${name} ${message}\n`
    } else {
        log = `[${date_str}] ${name} ${message}\n`
    }

    await Deno.writeTextFile(`${Deno.cwd()}/logs/server_logs.log`, log, { append: add, create: true })
}

/**
 * Gets content from .html file.
 * @param { string } file_path - Path of file from which we getting data.
 * @param { boolean } log_file_path - Optional argument which enable displaying path in console.log.
 */
export async function getHTMLfile(file_path: string, log_file_path: boolean = false) {
    const HTMLfilePath = getFileInfo(file_path)
    if (log_file_path) console.log(HTMLfilePath)
    return await Deno.readTextFile(file_path)
}

/**
 * Gets content from .json file.
 * @param { string } file_path - Path of file from which we getting data.
 * @param { boolean } log_file_path - Optional argument which enable displaying path in console.log.
 */
export async function getJSONfile(file_path: string, log_file_path: boolean = false) {
    const JSONfilePath = getFileInfo(file_path)
    if (log_file_path) console.log(JSONfilePath)
    const json = await Deno.readTextFile(file_path)
    if (typeof json != "object") return JSON.parse(json)
    return json
}

/**
 * Validates arguments passed in command line.
 * @param { string[] } args - Takes arguments passed in command line.
 */
export function argsValidation(args: string = "") {
    // First argument must be true, type boolean
    switch (args) {
        case "true":
            // Logs will NOT be displayed in console
            return true
        case "undefined":
            console.log(log_style.warrning.name, log_style.warrning.color, `Wrong parameter passed`)
        // Logs will be displayed in console
        default:
            return false
    }
}

/**
 *
 * @param { any } ctx
 * @param { any } next
 */
export const displayMoreInfoInLog = async (
    { response, request }: { response: any; request: any },
    next: Function,
) => {
    await next()
    const responseTimeHeader = response.headers.get("X-Response-Time")
    const UserAgentHeader = request.headers.get("User-Agent")
    const statusNumber: number = response.status
    const log: string = `${request.ip} ${request.method} "${request.url.pathname}" ${String(statusNumber)} ${UserAgentHeader} ${responseTimeHeader}`
    writeLogToFile(4, log_style.resp.name, log)
    console.log(log_style.resp.name, log_style.resp.color, log)
};

/**
 *
 * @param { any } ctx
 * @param { any } next
 */
export const SetResponseTimeInHeader = async (
    { response }: { response: any },
    next: Function,
) => {
    const start = Date.now()
    await next()
    const ms: number = Date.now() - start
    response.headers.set("X-Response-Time", `${ms}ms`)
}

export async function loadConfig() {
    let config: any
    try {
        config = await getJSONfile(`${Deno.cwd()}/config/server.config.json`)
        return config
    } catch (error) {
        if (config.displayLogs) console.log(log_style.error.name, log_style.error.color, `Config load FAIL. ${error.name}`)
        writeLogToFile(6, log_style.error.name, `Config load FAIL. ${error.name}`)
        return
    }
}