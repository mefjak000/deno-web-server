import {
    ServerLog
} from "../lib/deps.ts"

export const log_style = {
    "start": new ServerLog(0, "[SERVER ENGINE]", "#00cc66"),
    "info": new ServerLog(1, "[SERVER INFO]", "#0099ff"),
    "status": new ServerLog(2, "[SERVER STATUS]", "#cc9e6a"),
    "test": new ServerLog(3, "[SERVER TEST]", "#9b34eb"),
    "resp": new ServerLog(4, "[SERVER RESPONSE]", "#fff"),
    "warrning": new ServerLog(5, "[SERVER WARRNING]", "#fcc603"),
    "error": new ServerLog(6, "[SERVER FAIL]", "#f00"),
}