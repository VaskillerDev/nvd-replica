'use strict'

import { IncomingMessage, ServerResponse } from 'http'

const { trimParams, eqStr, extractParams } = require('./utils')

type Method = 'post' | 'get' | 'put' | 'delete'
type ResolveFuncSignature = (req: IncomingMessage, res: ServerResponse) => void
type Route = { path: string; method: Method; resolve: ResolveFuncSignature }

const routes: Array<Route> = [
    { path: '/getComponent', method: 'get', resolve: getComponent },
]

function getComponent(req: IncomingMessage, res: ServerResponse) {
    let { url } = req
    const { f, h, b } = extractParams(url)

    res.writeHead(200)
    res.end('ok.')
}

function resolve(req: IncomingMessage, res: ServerResponse) {
    let { method, url } = req
    url = trimParams(url)
    const maybeRoute = routes.find(
        route => eqStr(route.path, url) && eqStr(route.method, method)
    )

    if (!maybeRoute) {
        console.error(`route ${url} on method ${method} not found`)
        return // end
    }
    maybeRoute.resolve(req, res)
}

module.exports = {
    routes: routes,
    resolve: resolve,
}
