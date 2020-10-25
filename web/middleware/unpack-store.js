export default function ({ req, store }) {
  if (req && req.headers && req.headers.cookie) {
    if (req.headers.cookie.includes('ads=true')) {
      store.state.cookiesAllowed = true
      store.state.adsAllowed = true
      store.state.consentPopupVisible = false
    }
    if (req.headers.cookie.includes('cookies=true')) {
      store.state.cookiesAllowed = true
      store.state.consentPopupVisible = false
    }
    if (req.headers.cookie.includes('usertag=')) {
      const cookie = RegExp('usertag=[^;]+').exec(req.headers.cookie)
      store.state.userTag = decodeURIComponent(!!cookie ? cookie.toString().replace(/^[^=]+./, '') : '')
    }
  }
}
