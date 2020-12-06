export default function ({ res }) {
  if(res != undefined) {
    res.setHeader('Cache-Control', 'public, max-age=60')
  }
}
