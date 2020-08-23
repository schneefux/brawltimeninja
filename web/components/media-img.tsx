import Vue from 'vue'

function encodeQuery(data: { [key: string]: number|string }) {
   const ret = [] as string[]
   for (let d in data) {
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
   }
   return ret.join('&')
}

export default Vue.extend({
  name: 'MediaImg',
  functional: true,
  props: {
    clazz: {
      type: String,
      default: ''
    },
    ztyle: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      required: false
    },
    transparent: {
      type: Boolean,
      default: true
    },
    mediaUrl: {
      type: String,
      default() {
        return process.env.mediaUrl
      }
    },
  },
  render(h, { props, data }) {
    function query({ size }: { size: string|number|undefined }): string {
      const opts = {}
      if (size) {
        opts['size'] = size
      }
      return '?' + encodeQuery(opts)
    }
    return <picture>
      <source srcset={props.mediaUrl + props.path + '.webp' + query(props)} type="image/webp" />
      <img
        src={props.mediaUrl + props.path + (props.transparent ? '.png': '.jpg') + query(props)}
        class={props.clazz}
        style={props.ztyle}
        {... { attrs: data.attrs } } />
    </picture>
  },
})
