import jwt from 'jsonwebtoken'
import { publicProcedure, router } from '../trpc'

const cubeSecret = process.env.CUBEJS_API_SECRET || 'changeme'

export const authRouter = router({
  getToken: publicProcedure
    .mutation(async () => {
      // not cached by CDN
      // TODO: verify identity, e.g. by captcha
      return jwt.sign({}, cubeSecret, {
        expiresIn: '1h',
      })
    }),
})
