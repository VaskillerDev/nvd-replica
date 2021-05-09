import * as scheduler from 'node-schedule'
import fs from 'fs'
import https, { ServerOptions } from 'https'
import http, { IncomingMessage, ServerResponse } from 'http'
// @ts-ignore
import dotenv from 'dotenv'
dotenv.config()

import syncWithNVD from './src/syncWithNVD'
import * as Routes from './src/routes'

type SchedulerContainer = {
    [key: string]: string
}
type MaybeBuffer = Buffer | string

const time: SchedulerContainer = Object.create(null) as SchedulerContainer
time['00:00:50'] = '50 * * * * *'
time['00:02:50'] = '50 2 * * * *'
time['04:00:30'] = '30 * 4 * * *'

if (!process.env.APP_SKIP_SYNC_WITH_NVD)
    syncWithNVD().catch(e => console.log(e))
scheduler.scheduleJob(time['00:02:50'], syncWithNVD)

const port = 3000
const key: MaybeBuffer = (fs.existsSync(process.env.PATH_TO_KEY as string) &&
    fs.readFileSync(process.env.PATH_TO_KEY as string)) as MaybeBuffer
const cert: MaybeBuffer = (fs.existsSync(process.env.PATH_TO_CERT as string) &&
    fs.readFileSync(process.env.PATH_TO_CERT as string)) as MaybeBuffer

const options: ServerOptions = { cert, key }
const useHttps = key && cert

function onStartCallback() {
    console.log(
        'Skip sync with NVD: ' + process.env.APP_SKIP_SYNC_WITH_NVD,
        '\nPort: ' + port,
        '\nHttps: ' + useHttps
    )
}

const server = useHttps ? https.createServer(options) : http.createServer()
server.on('request', function (req: IncomingMessage, res: ServerResponse) {
    Routes.resolve(req, res)
})
server.listen(port, onStartCallback)
