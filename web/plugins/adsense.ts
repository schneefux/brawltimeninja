import Vue from 'vue'
import Ads from 'vue-google-adsense'
import VS2 from 'vue-script2'

Vue.use(VS2)
Vue.use(Ads.Adsense)
Vue.use(Ads.InArticleAdsense)
Vue.use(Ads.InFeedAdsense)
Vue.use(Ads.AutoAdsense, { adClient: 'ca-pub-6856963757796636' })
