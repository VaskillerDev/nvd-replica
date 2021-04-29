'use strict'
const { trimParams, eqStr, extractParams } = require('./utils')

const routes = [{ path: '/getComponent', method: 'get', resolve: getComponent }]

function getComponent(req, res) {
    let { url } = req
    const { f, h, b } = extractParams(url)

    res.writeHead(200)
    res.end('ok.')
}

function resolve(req, res) {
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
