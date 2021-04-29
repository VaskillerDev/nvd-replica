const scheduler = require('node-schedule')
const fs = require('fs')
const https = require('https')
const http = require('http')

const { syncWithNVD } = require('./syncWithNVD')
const routes = require('./routes')

const time: any = []
time['00:00:30'] = '30 * * * * *'
time['04:00:30'] = '30 * 4 * * *'

scheduler.scheduleJob(time['04:00:30'], syncWithNVD) // download cve archives in this time

const port = 3000
const key =
    fs.existsSync(process.env.PATH_TO_KEY) &&
    fs.readFileSync(process.env.PATH_TO_KEY)
const cert =
    fs.existsSync(process.env.PATH_TO_CERT) &&
    fs.readFileSync(process.env.PATH_TO_CERT)
const options = { cert, key }
const useHttps = key && cert
function onStartCallback() {
    console.log('Port: ' + port, '\nHttps: ' + useHttps)
}
const server = useHttps ? https.createServer(options) : http.createServer()

server.on('request', function (req: any, res: any) {
    routes.resolve(req, res)
})

server.listen(port, onStartCallback)
