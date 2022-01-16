import { Params } from '@feathersjs/feathers'
import { expressOauth, OAuthProfile, OAuthStrategy } from "@feathersjs/authentication-oauth"
import { Application } from "@feathersjs/express/lib"
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import session from 'express-session'
import knexSession from 'connect-session-knex'
import knex from 'knex'

class GoogleStrategy extends OAuthStrategy {
  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    return {
      googleId: profile.sub,
    }
  }
}

export default (app: Application) => {
  const authentication = new AuthenticationService(app);
  authentication.register('jwt', new JWTStrategy());
  authentication.register('google', new GoogleStrategy());
  app.use('/authentication', authentication)
  app.configure(expressOauth({
    expressSession: session({
      secret: app.get('authentication')['secret'],
      resave: false,
      saveUninitialized: false,
      store: new (knexSession(session))({
        knex: knex(app.get('database')),
      })
    })
  }))
}
