import z from 'zod'

export const tagWithoutHashType = z.string().regex(/^[0289PYLQGRJCUV]{3,}$/)
const uintType = z.number().nonnegative().lt(4294967295)
export const idType = uintType.gte(10000000)
