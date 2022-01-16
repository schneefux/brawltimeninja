import { feathers } from '@feathersjs/feathers'
import { default as express, json, urlencoded } from '@feathersjs/express'
import { notFound, errorHandler } from '@feathersjs/express/lib/handlers.js'
import { rest } from '@feathersjs/express/lib/rest.js'
import configuration from '@feathersjs/configuration'
import authentication from './authentication.js'
import database from './database.js'
import cors from 'cors'

const app = express(feathers())
app.configure(configuration())

app.use(cors({ origin: true })) // TODO only for development
app.use(json())
app.use(urlencoded({ extended: true }))
app.configure(rest())
app.configure(authentication)

await database(app)

app.use(notFound())
app.use(errorHandler())

const port = app.get('port')
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
