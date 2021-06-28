import {
    server_config
} from "./interfaces.ts"

import {
    Application,
    isHttpError,
    Status,
    getHTMLindexFile,
    getJSONfile,
    getFileInfo,
    CLItest as test,
    Router,
    send,
    argsValidation,
    log_style,
    writeLogToFile
} from "./deps.ts"

/**
 * Takes arguments from command line and runs server.
 * @param { boolean } displayMoreInfo - If true then server will display logs in console, default = true.
 */

// 1. config | next
// 2. Check registered route | next if route is registered
export async function engine(displayMoreInfo: boolean = true) {
    let serv_conf: any
    try {
        serv_conf = await getJSONfile(`${Deno.cwd()}/config/server.config.json`)
    } catch (error) {
        // TODO
        // return ERROR
    }

    let requested_files: any[] = []
    let requested_files_str: string

    const app = new Application()
    const router = new Router()

    // Manages requests and responses, function is from "Oak framework"
    app.use(async (ctx, next) => {
        const request_start_time_ms = Date.now()

        try {

            // Checks if route is registered
            let file: any
            if (!serv_conf.routes_register.includes(ctx.request.url.pathname)) {
                // Sets folder for static webpages
                file = await send(ctx, ctx.request.url.pathname, {
                    root: `${Deno.cwd()}/${serv_conf.public_file.public_dir}`,
                    index: `${serv_conf.public_file.index_file}`,
                    extensions: serv_conf.public_file.file_exts
                })

                // Gets info about requested file and saves in array
                const file_info = getFileInfo(file)
                if (!requested_files.includes(file_info.base)) requested_files.push(file_info.base)
                requested_files_str = requested_files.join(', ')

                // Response time
                const request_end_time_ms = Date.now()
                const response_time = request_end_time_ms - request_start_time_ms

                // Displays information about responsed file whether is true
                if (displayMoreInfo) console.log(log_style.resp.name, log_style.resp.color, `Requested file ${file_info.base} in ${file_info.dir} ${response_time} ms`)
                writeLogToFile(log_style.resp.name, `Requested file ${file_info.base} in ${file_info.dir}`)
            }
        } catch (error) {
            if (isHttpError(error)) {
                switch (error.status) {
                    case Status.NotFound:
                        // Displays error name whether is true
                        if (displayMoreInfo) console.log(log_style.error.name, log_style.error.color, `File not found. ${error.name}`)
                        writeLogToFile(log_style.warrning.name, `File not found. ${error.name}`)

                        const body: string = await getHTMLindexFile(`${Deno.cwd()}/err/404_not_found.html`)
                        ctx.response.body = body
                    default:
                        break
                }
            } else {
                throw error
            }
        }
        await next()
    })

    // Set route with get method, function is from "Oak framework"
    router
        .get("/home", async (ctx) => {
            test("Redirecting to")
            ctx.response.redirect("/")
        })
        .get("/test/api", (ctx) => {
            test("test api")
            ctx.response.body = "test api"
        })


    // Return middleware that will do all the route processing that the router has been configured to handle.
    app.use(router.routes())
    // Middleware that handles requests for HTTP methods registered with the router.
    app.use(router.allowedMethods())

    try {
        console.log(log_style.start.name, log_style.start.color, `Starting on port ${serv_conf.port_obj.port}`)
        writeLogToFile(log_style.start.name, `Starting on port ${serv_conf.port_obj.port}`)

        // Displays more info whether is true
        if (displayMoreInfo) console.log(log_style.info.name, log_style.info.color, `Working in ${Deno.cwd()}`)
        writeLogToFile(log_style.info.name, `Working in ${Deno.cwd()}`)

        await app.listen(serv_conf.port_obj);
    } catch (error) {
        if (displayMoreInfo) console.log(log_style.error.name, log_style.error.color, `Error: ${error}`)
        writeLogToFile(log_style.error.name, `Error: ${error}`)
        return error
    }
}