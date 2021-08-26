import {
    Application,
    CLItest as test,
    log_style,
    global_time,
    loadConfig,
} from "./deps.ts"

/**
 * Runs redirection server.
 */
export async function redirect_engine() {
    const serv_conf = await loadConfig()

    // Middleware instance
    const app = new Application()

    // Redirect handler
    app.use( (ctx) => {
        ctx.response.redirect("https://" + ctx.request.url.hostname + ctx.request.url.pathname)
    })

    try {
        app.addEventListener("listen", ({ hostname, port }) => {
            console.log(log_style.start.name, log_style.start.color, `Redirection server is running on: http://${hostname}:${port}`)

            // Calculating program start time
            const start_time = ((Date.now() - global_time) * 0.001).toFixed(3)
            console.log(log_style.status.name, log_style.status.color, `Program start time: ${start_time} s`)
        })

        await app.listen({
            hostname: serv_conf.conn.hostname,
            port: serv_conf.http.port
        })

    } catch (error) {
        if (serv_conf.displayLogs) console.log(log_style.error.name, log_style.error.color, `${error.name} ${error.message}`)
        return
    }
}