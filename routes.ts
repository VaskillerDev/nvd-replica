'use strict'

import { IncomingMessage, ServerResponse } from 'http'
import { trimParams, eqStr, extractParams } from './utils'

type Method = 'post' | 'get' | 'put' | 'delete'
type ResolveFuncSignature = (req: IncomingMessage, res: ServerResponse) => void
type Route = { path: string; method: Method; resolve: ResolveFuncSignature }

const routes: Array<Route> = [
    { path: '/getComponent', method: 'get', resolve: getComponent },
]

function getComponent(req: IncomingMessage, res: ServerResponse) {
    let { url } = req
    const { f, h, b } = extractParams(url as string)

    res.writeHead(200)
    res.end('ok.')
}

export function resolve(req: IncomingMessage, res: ServerResponse) {
    let { method, url } = req
    url = trimParams(url as string) as string
    const maybeRoute = routes.find(
        route =>
            eqStr(route.path, url as string) &&
            eqStr(route.method, method as string)
    )

    if (!maybeRoute) {
        console.error(`route ${url} on method ${method} not found`)
        return // end
    }
    maybeRoute.resolve(req, res)
}
