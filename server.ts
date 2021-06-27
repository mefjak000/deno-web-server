import {
    server_config
} from "./lib/interfaces.ts"

import {
    Application,
    getHTMLindexFile,
    getJSONfile,
    getFileInfo,
    CLItest as test,
    Router,
    send,
    argsValidation,
    log_style,
    writeLogToFile
} from "./lib/deps.ts"

/**
 * Takes arguments from command line and runs server.
 * @param { string[] } args - First argument passed in command line will enable more info about traffic.
 */
export async function engine(args: string[] = Deno.args) {
    const validArg: boolean = argsValidation(args)

    const config: any = await getJSONfile(`${Deno.cwd()}/config/conf.server.json`)
    const conf: server_config = {
        arguments: args,
        server_conf: config
    }

    let requested_files: any[] = []
    let requested_files_str: string

    // Manages requests and responses, function is from "Oak framework"
    const app = new Application()
    app.use(async (context, next) => {
        try {
            // Sets folder for static webpages
            const public_file: any = await send(context, context.request.url.pathname, {
                root: `${Deno.cwd()}/${conf.server_conf.public_file.public_dir}`,
                index: `${conf.server_conf.public_file.index_file}`,
                extensions: conf.server_conf.public_file.file_exts
            })

            // Gets info about requested file and saves in array
            const file_info = getFileInfo(public_file)
            if (!requested_files.includes(file_info.base)) requested_files.push(file_info.base)
            requested_files_str = requested_files.join(', ')

            // Displays information about responsed file whether is true
            if (validArg) console.log(log_style.resp.name, log_style.resp.color, `Requested file ${file_info.base} in ${file_info.dir}`)
            writeLogToFile(log_style.resp.name, `Requested file ${file_info.base} in ${file_info.dir}`)
        } catch (e) {
            // Displays error name whether is true
            if (validArg) console.log(log_style.warrning.name, log_style.warrning.color, `Error name: ${e.name}`)
            writeLogToFile(log_style.warrning.name, `Error name: ${e.name}`)

            const body: string = await getHTMLindexFile(`${Deno.cwd()}/err/404_not_found.html`)
            context.response.body = body
        }
        await next()
    })

    // Set route with get method, function is from "Oak framework"
    const router = new Router()
    router
        .get("/home", async (context, next) => {
            const body: string = await getHTMLindexFile(`${Deno.cwd()}/public/index.html`)
            context.response.body = body
        })

    // Return middleware that will do all the route processing that the router has been configured to handle.
    app.use(router.routes())
    // Middleware that handles requests for HTTP methods registered with the router.
    app.use(router.allowedMethods())

    console.log(log_style.start.name, log_style.start.color, `Server is running on port ${config.port_obj.port}`)
    writeLogToFile(log_style.start.name, `Server is running on port ${config.port_obj.port}`)

    // Displays more info whether is true
    if (validArg) console.log(log_style.info.name, log_style.info.color, `Working in ${Deno.cwd()}`)
    writeLogToFile(log_style.info.name, `Working in ${Deno.cwd()}`)

    await app.listen(config.port_obj)
}