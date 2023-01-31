<template>
  <b-card
    :loading="loading"
    class="max-w-lg"
  >
    <template v-slot:content>
      <div
        v-if="editing"
        class="
          grid grid-cols-1
          md:grid-cols-[auto,minmax(0,1fr)]
          items-center
          gap-x-6 gap-y-2
          md:gap-y-4
          mb-8
        "
      >
        <label :for="`${prefix}-brawler`" class="mt-4 md:mt-0">Brawler</label>
        <b-select
          v-model="selectedBrawlerId"
          :id="`${prefix}-brawler`"
          dark
          sm
        >
          <option
            v-for="(name, id) of brawlers"
            :key="id"
            :value="id"
          >{{ name }}</option>
        </b-select>

        <label :for="`${prefix}-background`" class="mt-4 md:mt-0">
          Background
        </label>
        <b-scrolling-list
          :id="`${prefix}-background`"
          :items="backgrounds"
          :cell-rows="1"
          :cell-columns="2"
          :render-at-least="1"
          key-id="id"
          render-placeholder
        >
          <template v-slot:item="{ id, path }">
            <div class="relative">
              <img
                :src="path"
                class="h-28 w-full object-cover rounded-2xl"
                @click="selectedBackground = id"
              />
              <font-awesome-icon
                v-if="selectedBackground == id"
                :icon="faCheck"
                class="
                  absolute
                  bottom-0
                  right-0
                  text-xl text-contrast
                  bg-background
                  rounded-full
                  p-1
                  m-1
                "
              ></font-awesome-icon>
            </div>
          </template>
        </b-scrolling-list>
      </div>

      <div>
        <span v-if="error != ''">{{ error }}</span>
        <img
          :src="picUrl"
          class="mt-2 rounded-2xl"
          width="1200"
          height="630"
          loading="lazy"
          @load="loading = false"
          @error="onError"
        >
      </div>
    </template>

    <template v-slot:actions>
      <div class="w-full flex flex-wrap gap-2">
        <b-button
          class="mr-auto"
          dark
          md
          @click="onClickEdit"
        >{{ $t('action.edit') }}</b-button>

        <b-button
          tag="a"
          :href="picUrl"
          dark
          md
          download
          @click="onDownload"
        >{{ $t('action.download') }}</b-button>

        <share-render-button
          :render-url="picUrl"
          primary
          md
          @share="onShare"
        ></share-render-button>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { Player } from '@/model/Api'
import { event } from 'vue-gtag'
import { computed, defineComponent, PropType, ref, watchEffect, watch, toRef } from 'vue'
import { useConfig, useSelfOrigin } from '@/composables/compat'
import { capitalizeWords } from '@/lib/util'
import { BCard, BSelect, BButton, BScrollingList } from '@schneefux/klicker/components'
import { usePlayerRender } from '@/composables/player'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { useUniqueId } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'

const backgroundIds = [
  'BlueSkull_Default.jpg',
  'Brawloween2020.jpg',
  'HolidayGetaway.jpg',
  'Lyn21OX_background.jpg',
  'StarrForce.jpg',
  'StarrPark.jpg',
  'background_GW22_2.jpg',
  'background_brawlywood.jpg',
  'background_cyberweek.jpg',
  'bg_biodome.jpg',
  'bg_bt21.jpg',
  'bg_deepsea.jpg',
  'bg_easter2022.jpg',
  'bg_lantern2022.jpg',
  'bg_starrforce_villains.jpg',
  'bg_stuntshow.jpg',
  'brawlball.jpg',
  'brawlentines_bg.jpg',
  'brawlidays2021_bg.jpg',
  'clashroyale.jpg',
  'goldenweek.jpg',
  'goldenweek2.jpg',
  'halloween.jpg',
  'lny2022_bg.jpg',
  'maplebarley.jpg',
  'moonfestival_2021.jpg',
  'onceuponabrawl.jpg',
  'pirate.jpg',
  'robots.jpg',
  'season1-taras-bazaar.jpg',
  'season2-summer-of-monsters.jpg',
  'summer_2021.jpg',
  'supercell.jpg',
  'yearofthepig.jpg',
  'yearoftherat.jpg',
]

export default defineComponent({
  components: {
    BCard,
    BSelect,
    BButton,
    BScrollingList,
    FontAwesomeIcon,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  setup(props, { emit }) {
    const $config = useConfig()
    const mediaUrl = computed(() => $config.mediaUrl)
    const backgrounds = computed(() => backgroundIds
      .map((filename) => ({
        id: filename,
        path: `${mediaUrl.value}/backgrounds/${filename}?size=300`,
      }))
    )

    const { bestBrawlerId } = usePlayerRender(toRef(props, 'player'))
    const selectedBackground = ref(backgroundIds[0])
    const selectedBrawlerId = ref<string>()

    watchEffect(() => {
      if (selectedBrawlerId.value == undefined) {
        selectedBrawlerId.value = bestBrawlerId.value
      }
    })

    const onClickEdit = () => {
      emit('interact')
      editing.value = !editing.value
    }

    const origin = useSelfOrigin()
    const playerUrl = computed(() => `${origin}/player/${props.player.tag}?utm_source=share&utm_medium=image&utm_campaign=hype-stats`)

    const onShare = () => {
      emit('interact')
      event('click', {
        'event_category': 'profile',
        'event_label': 'share',
      })
    }

    const onDownload = () => {
      emit('interact')
      event('click', {
        'event_category': 'profile',
        'event_label': 'download',
      })
    }

    const i18n = useI18n()
    const picUrl = computed(() => `/api/render/profile/${props.player.tag.substring(1)}/${selectedBrawlerId.value}?background=${selectedBackground.value}`)
    const error = ref('')
    const loading = ref(false)
    const onError = () => {
      error.value = i18n.t('error.misc')
    }
    watch(picUrl, () => {
      error.value = ''
      loading.value = true
    })

    const brawlers = computed(() => Object.fromEntries(
      Object.entries(props.player.brawlers)
        .map(([id, brawler]) => [id, capitalizeWords(brawler.name.toLowerCase())])
    ))

    const { id: prefix } = useUniqueId()

    const editing = ref(false)

    return {
      onClickEdit,
      editing,
      picUrl,
      error,
      loading,
      onError,
      mediaUrl,
      playerUrl,
      selectedBackground,
      selectedBrawlerId,
      onShare,
      onDownload,
      backgrounds,
      brawlers,
      faCheck,
      prefix,
    }
  },
})
</script>
