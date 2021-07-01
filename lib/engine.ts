import {
    Application,
    isHttpError,
    Status,
    getHTMLfile,
    getJSONfile,
    getFileInfo,
    CLItest as test,
    Router,
    send,
    log_style,
    writeLogToFile,
    global_time,
    CONF,
    displayMoreInfoInLog,
    SetResponseTimeInHeader,
} from "./deps.ts"

/**
 * Runs server engine.
 */
export async function engine(isSecure: boolean = false) {
    let serv_conf: any
    try {
        serv_conf = await getJSONfile(`${Deno.cwd()}/config/server.config.json`)
    } catch (error) {
        if (serv_conf.displayLogs) console.log(log_style.error.name, log_style.error.color, `Config load FAIL. ${error.name}`)
        writeLogToFile(6, log_style.error.name, `Config load FAIL. ${error.name}`)
        return
    }

    // Default behavior off
    const app = new Application()
    const router = new Router()

    if (serv_conf.displayLogs) {
        // Log and response time
        app.use(displayMoreInfoInLog)
        app.use(SetResponseTimeInHeader)
    }

    // Redirect handler
    app.use(async (ctx, next) => {
        if (ctx.request.url.protocol == "http:" && serv_conf.conn.redirect == true) {
            ctx.response.redirect("https://" + ctx.request.url.hostname + ctx.request.url.pathname)
        }
        await next()
    })

    // Manages requests and responses, function is from "Oak framework"
    app.use(async (ctx, next) => {
        try {
            // Sets server name in http headers
            ctx.response.headers.set("Server", CONF.name)

            let file: any
            // Checks if route is registered
            if (!serv_conf.routes_list.includes(ctx.request.url.pathname)) {
                // Sets folder for static webpages
                file = await send(ctx, ctx.request.url.pathname, {
                    root: `${Deno.cwd()}/${serv_conf.public.public_dir}`,
                    index: `${serv_conf.public.index_file}`,
                    extensions: serv_conf.public.hide_file_exts
                })

                // Gets info about requested file and saves in array
                const file_info = getFileInfo(file)
            }
        } catch (error) {
            if (isHttpError(error)) {
                switch (ctx.response.status) {
                    case Status.NotFound:
                        const body: string = await getHTMLfile(`${Deno.cwd()}/err/404_not_found.html`)
                        ctx.response.body = body
                }
            }
            // Displays error name whether serv_conf.displayLogs is true
            if (serv_conf.displayLogs) console.log(log_style.warrning.name, log_style.warrning.color, `${error.name} ${error.message}`)
            writeLogToFile(5, log_style.warrning.name, `${error.name} ${error.message}`)
        }
        await next()
    })

    // Set route with get method, function is from "Oak framework"
    router
        .get("/test/api", (ctx) => {
            try {
                ctx.response.body = {
                    status: "success",
                    message: "Hi there"
                }
            } catch (error) {
                if (isHttpError(error)) {
                    ctx.response.body = {
                        status: ctx.response.status,
                        message: error.name
                    }

                    // Displays URI error name whether is true
                    if (serv_conf.displayLogs) console.log(log_style.warrning.name, log_style.warrning.color, `${error.name} ${error.message}`)
                    writeLogToFile(5, log_style.warrning.name, `${error.name} ${error.message}`)
                }
            }
        })

    // Return middleware that will do all the route processing that the router has been configured to handle.
    app.use(router.routes())
    // Middleware that handles requests for HTTP methods registered with the router.
    app.use(router.allowedMethods())

    try {
        app.addEventListener("listen", ({ hostname, port, secure }) => {
            if (secure) {
                console.log(log_style.start.name, log_style.start.color, `Server is running on: https://${hostname}:${port}`)
                writeLogToFile(0, log_style.start.name, `Server is running on: http://${hostname}:${port}`)
            } else {
                console.log(log_style.start.name, log_style.start.color, `Server is running on: http://${hostname}:${port}`)
                writeLogToFile(0, log_style.start.name, `Server is running on: http://${hostname}:${port}`)
            }

            // Calculating program start time
            const start_time = ((Date.now() - global_time) * 0.001).toFixed(3)
            console.log(log_style.status.name, log_style.status.color, `Program start time: ${start_time} s`)
            writeLogToFile(3, log_style.status.name, `Program start time: ${start_time} s`)

            // Displays more info whether is true
            if (serv_conf.displayLogs) console.log(log_style.info.name, log_style.info.color, `Working in ${Deno.cwd()}`)
            writeLogToFile(1, log_style.info.name, `Working in ${Deno.cwd()}`)
        })

        if (isSecure) {
            await app.listen({
                secure: isSecure,
                certFile: serv_conf.https.certFile,
                keyFile: serv_conf.https.keyFile,
                hostname: serv_conf.conn.hostname,
                port: serv_conf.https.port,
                alpnProtocols: serv_conf.conn.alpnProtocols
            })
        } else {
            await app.listen({
                hostname: serv_conf.conn.hostname,
                port: serv_conf.http.port
            })
        }
    } catch (error) {
        if (serv_conf.displayLogs) console.log(log_style.error.name, log_style.error.color, `${error.name} ${error.message}`)
        writeLogToFile(5, log_style.error.name, `${error.name} ${error.message}`)
        return
    }
}