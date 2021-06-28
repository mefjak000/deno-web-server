/**
 * Styles logs in console.log.
 * @var { string } this.name - Server log label.
 * @var { color } this.color - Server log label color.
 * @var { DateConstructor } date - Date when log happen.
 */
export class ServerLog {
    name: string
    color: string
    date = Date.now()

    constructor(type_id: number, label: string = '[SERVER LOG]:', color: string = '#0099ff') {
        // Regular expression for console name
        const pattern1 = /\[SERVER [A-Z]{2,10}\]/gmi
        if (pattern1.test(label)) this.name = `%c${label}:`
        else this.name = `%c[SERVER LOG]`

        // Regular expression for console color
        const pattern2 = /^#(?:[0-9a-f]{3}){1,2}$/gmi
        if (pattern2.test(color)) this.color = "color: " + color
        else this.color = 'color: #fcc603'
    }
}