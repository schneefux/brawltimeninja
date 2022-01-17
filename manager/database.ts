import knex from 'knex'
import objectionService from 'feathers-objection'
import { Application } from '@feathersjs/express'
import { authenticate } from '@feathersjs/authentication'
import hooks from 'feathers-hooks-common'
import { Model } from 'objection'
import { migrate as migrateUserModel, UserModel } from './model/User.model.js'
import { migrate as migrateGridModel, GridModel } from './model/Grid.model.js'
import { migrate as migrateReportModel, ReportModel } from './model/Report.model.js'

function onlyOwner(context: { query?: any, params: any }) {
  context.query = {
    ...context.query,
    user_id: context.params.user.id,
  }
}

function setOwner(context: { data?: any, params: any }) {
  context.data = {
    ...context.data,
    user_id: context.params.user.id,
  }
}

const readAllWriteOwner = {
  before: {
    create: [
      authenticate('jwt'),
      setOwner,
    ],
    update: [
      authenticate('jwt'),
      onlyOwner,
      setOwner,
    ],
    patch: [
      authenticate('jwt'),
      onlyOwner,
      setOwner,
    ],
    remove: [
      authenticate('jwt'),
      onlyOwner,
    ],
  }
}

export default async (app: Application) => {
  const db = knex(app.get('database'))

  await migrateUserModel(db)
  await migrateReportModel(db)
  await migrateGridModel(db)

  Model.knex(db)

  app.use('/users', objectionService({
    model: UserModel,
    whitelist: ['$eager'],
    allowedEager: '[reports,grids]',
  }))

  app.service('users').hooks({
    before: {
      create: <any> hooks.disallow('external'),
      update: <any> hooks.disallow('external'),
      patch: <any> hooks.disallow('external'),
      remove: <any> hooks.disallow('external'),
    },
  })

  app.use('/grids', objectionService({
    model: GridModel,
  }))

  app.service('grids').hooks(readAllWriteOwner)

  app.use('/reports', objectionService({
    model: ReportModel,
  }))

  app.service('reports').hooks(readAllWriteOwner)

  const errorHandler = (error: any) => {
    const symbol = (<any>objectionService).ERROR
    if (error.error != undefined && error.error[symbol] != undefined) {
      console.error(error.error[symbol])
    }
  }

  app.hooks({
    error: {
      all: [errorHandler],
    },
  })
}
