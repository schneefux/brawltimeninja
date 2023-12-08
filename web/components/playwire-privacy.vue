<template>
  <div>
    <h2>Common ID Cookie</h2>
    <p id="cookieP">
      This site uses cookies and similar tracking technologies such as the Common ID cookie to provide its services. Cookies are important devices for measuring advertising effectiveness and ensuring a robust online advertising industry. The Common ID cookie stores a unique user id in the first party domain and is accessible to our ad partners. This simple ID that can be utilized to improve user matching, especially for delivering ads to iOS and MacOS browsers.
      Users can opt out of the Common ID tracking cookie by clicking <a onclick="window.setCookie('_pubcid_optout', '1', 1825);" href="#opt-out">here</a>.
    </p>
    <h2>Advertising Privacy Settings</h2>
    <p>
      When you use our site, pre-selected companies may access and use certain information on your device and about your interests to serve ads or personalized content. You may revisit or change consent-choices at any time by clicking
      <a href="#cmp" onclick="window.__tcfapi('displayConsentUi', 2, function() {} );">here</a>.
    </p>
  </div>
</template>

<script lang="ts">
import { useMeta } from '~/composables/compat'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    useMeta(() => ({
      title: 'Privacy',
      script: [ {
        innerHTML: `let optOutCounter = 0; function setCookie(cname,cvalue,exdays){var d = new Date();d.setTime(d.getTime()+(exdays*24*60*60*1000));var expires='expires='+d.toUTCString();document.cookie=cname+'='+cvalue+';'+expires+';path=/'; if(optOutCounter==0){ let cookieP = document.getElementById('cookieP'); var successCookie = document.createElement('h3'); successCookie.innerHTML = 'Optout Success!'; successCookie.setAttribute('style','color:green'); cookieP.appendChild(successCookie); optOutCounter ++ } };`,
      } ],
    }))
  },
})
</script>
