import jwt from 'jsonwebtoken'

const cubeSecret = process.env.CUBEJS_API_SECRET || 'changeme'

export default class AuthService {
  // TODO cache token

  public async getToken() {
    // TODO: verify identity, e.g. by captcha
    return jwt.sign({}, cubeSecret, {
      expiresIn: '1h',
    })
  }
}
