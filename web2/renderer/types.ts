// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: any
  pageProps?: Record<string, unknown>
  exports: {
    documentProps?: {
      title: string
    }
  }
  documentProps?: {
    title: string
  }
  urlPathname: string
  urlParsed: {
    origin: null | string
    pathname: string
    pathnameOriginal: string
    search: Record<string, string>
    searchAll: Record<string, string[]>
    searchOriginal: null | string
    hash: string
    hashOriginal: null | string
  }
}
