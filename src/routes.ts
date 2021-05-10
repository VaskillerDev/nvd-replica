import { IncomingMessage, ServerResponse } from 'http'
import {lowerCaseDeepEqual, translateRequest, trimParams} from './utils'
import { Route, RouteResolve } from './types/HttpTypes'
import getCve from './http/getCve'
import { Method } from './types/HttpTypes'

const routes: Array<RouteResolve> = [
    { path: '/cve', method: Method.GET, resolve: getCve }, // ?soft=nginx
]

export function resolve(req: IncomingMessage, res: ServerResponse) {
    let incomingRoute: Route = translateRequest(req)
    incomingRoute.path = trimParams(incomingRoute.path) as string

    const maybeRoute = routes.find(recordedRoute =>
        matchRoutes(incomingRoute, recordedRoute)
    )

    if (!maybeRoute) {
        console.error(
            `route ${incomingRoute.path} on ${incomingRoute.method} not found`
        )
        return // end
    }

    maybeRoute.resolve(req, res)
}

function matchRoutes(incomingRoute: Route, recordedRoute: Route): boolean {
    return lowerCaseDeepEqual(incomingRoute, recordedRoute)
}
