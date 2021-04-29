import * as scheduler from 'node-schedule'
import fs from 'fs'
import https, { ServerOptions } from 'https'
import http, { IncomingMessage, ServerResponse } from 'http'

import syncWithNVD from './syncWithNVD'
import * as Routes from "./routes";

type SchedulerContainer = {
    [key: string]: string
}
type MaybeBuffer = Buffer | string

const time: SchedulerContainer = Object.create(null) as SchedulerContainer
time['00:00:50'] = '50 * * * * *'
time['04:00:30'] = '30 * 4 * * *'

scheduler.scheduleJob(time['00:00:50'], syncWithNVD) // download cve archives in this time

const port = 3000
const key: MaybeBuffer =
    (fs.existsSync(process.env.PATH_TO_KEY as string) &&
    fs.readFileSync(process.env.PATH_TO_KEY as string)) as MaybeBuffer
const cert: MaybeBuffer =
    (fs.existsSync(process.env.PATH_TO_CERT as string) &&
    fs.readFileSync(process.env.PATH_TO_CERT as string)) as MaybeBuffer

const options: ServerOptions = { cert , key }
const useHttps = key && cert

function onStartCallback() {
    console.log('Port: ' + port, '\nHttps: ' + useHttps)
}

const server = useHttps ? https.createServer(options) : http.createServer()
server.on('request', function (req: IncomingMessage, res: ServerResponse) {
    Routes.resolve(req, res)
})
server.listen(port, onStartCallback)