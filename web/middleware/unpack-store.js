export default function ({ req, store }) {
  if (req && req.headers && req.headers.cookie && req.headers.cookie.includes('ads=true')) {
    store.state.cookiesAllowed = true
    store.state.adsAllowed = true
  }
}
