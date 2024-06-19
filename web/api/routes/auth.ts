import AuthService from '../services/AuthService'
import { publicProcedure, router } from '../trpc'

const authService = new AuthService()

export const authRouter = router({
  getToken: publicProcedure
    .mutation(async () => {
      // not cached by CDN
      return authService.getToken()
    }),
})
