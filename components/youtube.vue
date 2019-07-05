<script>
const player = require('youtube-player')

const UNSTARTED = -1
const ENDED = 0
const PLAYING = 1
const PAUSED = 2
const BUFFERING = 3
const CUED = 5

export default {
  name: 'Youtube',
  props: {
    videoId: String,
    autoplay: Boolean,
    mute: Boolean,
    height: {
      type: [Number, String],
      default: 360
    },
    width: {
      type: [Number, String],
      default: 640
    },
  },
  data() {
    return {
      player: {},
      events: {
        [UNSTARTED]: 'unstarted',
        [PLAYING]: 'playing',
        [PAUSED]: 'paused',
        [ENDED]: 'ended',
        [BUFFERING]: 'buffering',
        [CUED]: 'cued'
      },
    }
  },
  methods: {
    playerReady(e) {
      this.$emit('ready', e.target)
    },
    playerStateChange(e) {
      if (e.data !== null && e.data !== UNSTARTED) {
        this.$emit(this.events[e.data], e.target)
      }
    },
  },
  beforeDestroy() {
    if (this.player !== null && this.player.destroy) {
      this.player.destroy()
      delete this.player
    }
  },
  mounted() {
    window.YTConfig = {
      host: 'https://www.youtube-nocookie.com/iframe_api'
    }

    this.player = player(this.$el, {
      width: this.width,
      height: this.height,
      videoId: this.videoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: this.autoplay ? 1 : 0 },
    })

    this.player.on('ready', this.playerReady)
    this.player.on('stateChange', this.playerStateChange)

    this.player.setSize(this.width, this.height)

    if (this.mute) {
      this.player.mute()
    }
  },
  render(h) {
    return h('div')
  },
}
</script>
