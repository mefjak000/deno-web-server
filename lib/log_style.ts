import {
    ServerLog
} from "../lib/deps.ts"

export const log_style = {
    "start": new ServerLog("[SERVER ENGINE]", "#00cc66"),
    "resp": new ServerLog("[SERVER RESPONSE]", "#fff"),
    "info": new ServerLog("[SERVER INFO]", "#0099ff"),
    "status": new ServerLog("[SERVER STATUS]", "#fff"),
    "warrning": new ServerLog("[SERVER WARRNING]", "#fcc603"),
    "error": new ServerLog("[SERVER ERROR]", "#f00"),
    "test": new ServerLog("[SERVER TEST]", "#9b34eb")
}