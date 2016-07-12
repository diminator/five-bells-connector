'use strict'

const co = require('co')
const log = require('../common').log('routes')
const requestUtil = require('five-bells-shared/utils/request')
const routingTables = require('../services/routing-tables')

exports.post = function * () {
  const routes = yield requestUtil.validateBody(this, 'Routes')
  let gotNewRoute = false

  // TODO verify that POSTer of these routes matches route.connector.
  for (const route of routes) {
    gotNewRoute = routingTables.addRoute(route) || gotNewRoute
  }

  if (routes[0].connector) {
    this.routeBroadcaster.addConnector(routes[0].connector)
  }

  if (gotNewRoute) {
    co(this.routeBroadcaster.broadcast.bind(this.routeBroadcaster))
      .catch(function (err) {
        log.warn('error broadcasting routes: ' + err.message)
      })
  }

  this.status = 200
}
