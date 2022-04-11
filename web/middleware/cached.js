export default function ({ res }) {
  if (res != undefined) {
    res.setHeader('Vary', 'Cookie') // cache every variation of cookies
    res.setHeader('Cache-Control', 'public, max-age=60')
  }
}
