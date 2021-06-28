import {
    server_config
} from "./interfaces.ts"

import {
    Application,
    isHttpError,
    HttpServerStd,
    Status,
    getHTMLindexFile,
    getJSONfile,
    getFileInfo,
    CLItest as test,
    Router,
    send,
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
        if (displayMoreInfo) console.log(log_style.error.name, log_style.error.color, `Config load FAIL. ${error.name}`)
        writeLogToFile(6, log_style.error.name, `Config load FAIL. ${error.name}`)
        return
    }

    let requested_files: any[] = []
    let requested_files_str: string

    // Default behavior off
    const app = new Application({ serverConstructor: HttpServerStd })
    const router = new Router()

    // Manages requests and responses, function is from "Oak framework"
    app.use(async (ctx, next) => {
        try {
            let file: any
            // Checks if route is registered
            if (!serv_conf.routes_register.includes(ctx.request.url.pathname)) {
                // Sets folder for static webpages
                file = await send(ctx, ctx.request.url.pathname, {
                    root: `${Deno.cwd()}/${serv_conf.public.public_dir}`,
                    index: `${serv_conf.public.index_file}`,
                    extensions: serv_conf.public.hide_file_exts
                })

                // Gets info about requested file and saves in array
                const file_info = getFileInfo(file)
                if (!requested_files.includes(file_info.base)) requested_files.push(file_info.base)
                requested_files_str = requested_files.join(', ')

                // Displays information about responsed file whether is true
                if (displayMoreInfo) console.log(log_style.resp.name, log_style.resp.color, `Requested file ${file_info.base} in ${file_info.dir}`)
                writeLogToFile(4, log_style.resp.name, `Requested file ${file_info.base} in ${file_info.dir}`)
            }
        } catch (error) {
            if (isHttpError(error)) {
                switch (error.status) {
                    case Status.NotFound:
                        // Displays error name whether is true
                        if (displayMoreInfo) console.log(log_style.warrning.name, log_style.warrning.color, `File not found. ${error.name}`)
                        writeLogToFile(5, log_style.warrning.name, `File not found. ${error.name}`)

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
        .get("/test/api", (ctx) => {
            ctx.response.body = "test api"
        })

    // Return middleware that will do all the route processing that the router has been configured to handle.
    app.use(router.routes())
    // Middleware that handles requests for HTTP methods registered with the router.
    app.use(router.allowedMethods())


    try {
        app.addEventListener("listen", ({ hostname, port, secure}) => {
            if (secure) {
                console.log(log_style.start.name, log_style.start.color, `Server is running on: "https://"${hostname}:${port}`)
                writeLogToFile(0, log_style.start.name, `Server is running on: "http://"${hostname}:${port}`)
            } else {
                console.log(log_style.start.name, log_style.start.color, `Server is running on: "http://"${hostname}:${port}`)
                writeLogToFile(0, log_style.start.name, `Server is running on: "http://"${hostname}:${port}`)
            }

            // Displays more info whether is true
            if (displayMoreInfo) console.log(log_style.info.name, log_style.info.color, `Working in ${Deno.cwd()}`)
            writeLogToFile(1, log_style.info.name, `Working in ${Deno.cwd()}`)
        })



        if (serv_conf.conn.secure) {
            await app.listen({
                hostname: serv_conf.conn.hostname,
                port: serv_conf.conn.port,
                secure: serv_conf.conn.secure,
                certFile: serv_conf.conn.certFile,
                keyFile: serv_conf.conn.keyFile
            })
        }

        await app.listen({
            hostname: serv_conf.conn.hostname,
            port: serv_conf.conn.port
        })
    } catch (error) {
        if (displayMoreInfo) console.log(log_style.error.name, log_style.error.color, `Error: ${error}`)
        writeLogToFile(6, log_style.error.name, `Error: ${error}`)
        return
    }
}