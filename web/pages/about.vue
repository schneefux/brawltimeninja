<template>
  <div class="light">
    <split-page title="About">
      <div class="m-4 lg:mx-0 prose prose-sm sm:prose lg:prose-lg">
        <p>
          Brawl Time Ninja allows you to check competitive and fun statistics for your Brawl Stars account.
          It uses the following APIs:
        </p>

        <ul>
          <li>Official Brawl Stars API (<a href="https://developer.brawlstars.com" rel="nofollow">homepage</a>)</li>
          <li>BrawlAPI by Henry (<a href="https://brawlapi.com/" rel="nofollow">homepage</a>)</li>
          <li>BrawlAPI by RemoteAccess (<a href="https://api.rnt.dev/discord" rel="nofollow">Discord</a>)</li>
          <li>Brawl Stars Fandom's API (<a href="https://brawlstars.fandom.com/" rel="nofollow">homepage</a>)</li>
        </ul>

        <p>
          Their uptime is not guaranteed so some data may be unavailable at times. <br>
          You can view this site's source code <a href="https://github.com/schneefux/brawltimeninja">on GitHub</a>.
        </p>

        <copyright light></copyright>

        <h2>Contact</h2>

        <p>
          Send questions, feedback or advertising inquiries to <client-only><span>dev (at) {{ domain }}</span></client-only>.
        </p>

        <p>
        Legal inquiries: <br>
        </p>
        <p class="leading-tight">
          Timo Haumann <br>
          c/o Postflex #6063 <br>
          Emsdettener Str. 10 <br>
          48268 Greven <br>
          Germany <br>
          <i>No parcels - delivery will be refused.</i>
        </p>

        <hr>

        <h1>Privacy Policy</h1>

        <p>
          With your consent, this site shares visitor data with some partners. You can withdraw consent by deleting this site's settings in your browser or by clicking <a @click="manageConsent()">here</a>.
        </p>

        <p>If you choose to use our Service, then you agree to the collection and use of information in relation with this policy. The Personal Information that we collect are used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.</p>
        <p>Our Privacy Policy was created with the help of the Privacy Policy Template (privacypolicytemplate.net).</p>
        <h2>Information Collection and Use</h2>
        <p>No personally identifiable information is collected.</p>
        <h2>Cookies</h2>
        <p>Cookies are files with small amount of data that is commonly used an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your computer’s hard drive.</p>
        <p>Our website uses these "cookies" to collection information and to improve our Service. You have the option to either accept or refuse these cookies, and know when a cookie is being sent to your computer. If you choose to refuse our cookies, you may not be able to use some portions of our Service.</p>
        <h2>Advertisements</h2>
        <p>Ads appearing on our website may be delivered to users by Venatus Media, who may set cookies. These cookies allow the ad server to recognize your computer each time they send you an online advertisement to compile information about you or others who use your computer. This information allows ad networks to, among other things, deliver targeted advertisements that they believe will be of most interest to you.</p>
        <p>Please refer to the <a href="https://www.venatus.com/privacy-policy" rel="nofollow">Venatus Media Privacy Policy</a> for more information.</p>
        <h2>Google Analytics</h2>
        <p>We use a tool called "Google Analytics" to collect information about use of this site. Google Analytics collects information such as how often users visit this site, what pages they visit when they do so, and what other sites they used prior to coming to this site. We use the information we get from Google Analytics only to improve this site. Google Analytics collects only the IP address assigned to you on the date you visit this site, rather than your name or other identifying information. We do not combine the information collected through the use of Google Analytics with personally identifiable information. Although Google Analytics plants a permanent cookie on your web browser to identify you as a unique user the next time you visit this site, the cookie cannot be used by anyone but Google. Google’s ability to use and share information collected by Google Analytics about your visits to this site is restricted by the <a href="http://www.google.com/analytics/tos.html" class="underline">Google Analytics Terms of Use</a> and the <a href="http://www.google.com/privacypolicy.html" class="underline">Google Privacy Policy</a>.</p>
        <h2>Service Providers</h2>
        <p>We may employ third-party companies and individuals due to the following reasons:</p>
        <ul>
          <li>To facilitate our Service;</li>
          <li>To provide the Service on our behalf;</li>
          <li>To perform Service-related services; or</li>
          <li>To assist us in analyzing how our Service is used.</li>
        </ul>
        <p>We want to inform our Service users that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.</p>
        <h2>Security</h2>
        <p>We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.</p>
        <h2>Children’s Privacy</h2>
        <p>Our Services do not address anyone under the age of 13. We do not knowingly collect personal identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.</p>
        <h2>Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.</p>
        <h2>Contact Us</h2>
        <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>

        <hr>

        <h1>Miscellaneous</h1>
        <p>Icons by <a href="https://icons8.com/" rel="nofollow">Icons8</a> and <a href="https://fontawesome.com/" rel="nofollow">Font Awesome</a>.</p>
      </div>
    </split-page>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useCacheHeaders, useMeta } from '~/composables/compat';

export default defineComponent({
  setup() {
    const domain = computed(() => {
      if (!import.meta.env.SSR) {
        return window.location.hostname
      }

      return ''
    })

    const manageConsent = () => googlefc.callbackQueue.push({
      'CONSENT_DATA_READY': () => googlefc.showRevocationMessage()
    })

    useCacheHeaders()
    useMeta(() => ({
      title: 'Privacy',
    }))

    return {
      domain,
      manageConsent,
    }
  },
})
</script>
