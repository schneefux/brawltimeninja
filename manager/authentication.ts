import { Params } from '@feathersjs/feathers'
import { expressOauth, OAuthProfile, OAuthStrategy } from "@feathersjs/authentication-oauth"
import { Application } from "@feathersjs/express/lib"
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'

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
  app.configure(expressOauth())
}
