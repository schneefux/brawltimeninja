<template>
  <b-card
    :loading="loading"
    class="max-w-md"
  >
    <template v-slot:content>
      <div
        v-if="editing"
        class="
          grid grid-cols-1
          md:grid-cols-[auto_minmax(0,1fr)]
          items-center
          gap-x-6 gap-y-2
          md:gap-y-4
          mb-8
        "
      >
        <label
          :for="`${prefix}-brawler`"
          class="mt-4 md:mt-0"
        >
          Brawler
        </label>
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

        <label
          :for="`${prefix}-background`"
          class="mt-4 md:mt-0"
        >
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
                loading="lazy"
                @click="selectedBackground = id"
              />
              <fa
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
              ></fa>
            </div>
          </template>
        </b-scrolling-list>
      </div>

      <div
        class="w-full relative"
        @click="lightboxOpen = true"
      >
        <b-lightbox v-model="lightboxOpen">
          <img
            :src="playerRenderUrl"
            class="mt-2 rounded-2xl"
            width="1200"
            height="630"
            loading="lazy"
            @load="loading = false"
            @error="onError"
          >
        </b-lightbox>

        <span v-if="error != ''">{{ error }}</span>
        <img
          :src="playerRenderUrl"
          class="mt-2 rounded-2xl"
          width="1200"
          height="630"
          loading="lazy"
          @load="loading = false"
          @error="onError"
        >

        <b-button
          v-if="error == ''"
          class="absolute bottom-2 right-2"
          dark
          sm
        >
          <fa :icon="faExpand"></fa>
        </b-button>
      </div>
    </template>

    <template v-slot:actions>
      <div class="w-full flex flex-wrap gap-2">
        <b-button
          class="mr-auto"
          dark
          md
          @click="onClickEdit"
        >{{ $t('action.customize') }}</b-button>

        <b-button
          tag="a"
          :href="playerRenderUrl"
          dark
          md
          download
          @click="onDownload"
        >{{ $t('action.download') }}</b-button>

        <share-render-button
          :render-url="playerRenderUrl"
          primary
          md
          @share="onShare"
          @cancel="onShareCancel"
        ></share-render-button>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { Player } from '~/model/Api'
import { event } from 'vue-gtag'
import { computed, defineComponent, PropType, ref, useId, watch } from 'vue'
import { useConfig, useSelfOrigin } from '~/composables/compat'
import { capitalizeWords } from '~/lib/util'
import { BCard, BSelect, BButton, BScrollingList, BLightbox, Fa } from '@schneefux/klicker/components'
import { usePlayerRender } from '~/composables/player'
import { faCheck, faExpand } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

// TODO add this to update_assets.sh
/*
// visit https://fankit.supercell.com/d/YvtsWV4pUQVm/game-assets?asset-type18=Lobby+Backgrounds
// sort by most recent, scroll to bottom
  const backgrounds = [...document.querySelectorAll("[data-test-id='image-preview']")].map(img => ({ url: img.src.replace(/\?width=\d+/, ''), name: img.alt }))
  console.log(backgrounds.map(o => `curl "${o.url}" -o "${o.name}.png"`).join('\n'))
// execute it
// fix filenames
find . -type f -name "*.png" -exec file {} \; | grep -i "jpeg" | awk -F: '{print $1}' | while read -r file; do
    new_name="${file%.png}.jpg"
    mv "$file" "$new_name"
    echo "Renamed $file to $new_name"
done

// update ids:
  console.log(JSON.stringify(backgrounds.map(o => `${o.name}.jpg`)))
// put brawl_stars_lobby first
*/

const backgroundIds = ["brawl_stars_lobby.jpg","university_lobby.jpg","moon_festival_lobby.jpg","starr_force_lobby.jpg","once_upon_a_brawl_lobby.jpg","golden_week_lobby.jpg","clashroyale_lobby.jpg","golden_week_2_lobby.jpg","cyber_week_lobby.jpg","moon_festival_2022_lobby.jpg","mystery_at_the_hub_lobby.jpg","cursed_pirates_lobby.jpg","warriorsjourney_lobby.jpg","carnaval_lobby.jpg","ragnarok_lobby.jpg","swampoflove_lobby.jpg","mecha_leon_lobby.jpg","babyshark_lobby.jpg","biodome_lobby.jpg","supercell_lobby.jpg","lantern_brawl_lobby.jpg","summer_of_monsters_lobby.jpg","brawlentines_lobby.jpg","tara_bazaar_lobby.jpg","starr_park_lobby.jpg","deepsea_lobby.jpg","circus_lobby.jpg","mechaedgar_lobby.jpg","brawliversary4_lobby.jpg","lny2023_lobby.jpg","bt21_lobby.jpg","masks_lobby.jpg","golden_week_lobby.jpg","velocirapids_2023_lobby.jpg","worst_bunch_lobby.jpg","maple_barley_lobby.jpg","brawl_ball_lobby.jpg","brawlidays2021_lobby.jpg","robots_lobby.jpg","lunar_new_year_bull_lobby.jpg","pirate_lobby.jpg","mortis_mecha_lobby.jpg","action_heroes_lobby.jpg","ghost_station_lobby.jpg","easter_2023_lobby.jpg","lantern_2023_lobby.jpg","stuntshow_lobby.jpg","luner_new_year_pig_lobby.jpg","brawlidays2023_lobby.jpg","lny24_lobby.jpg","superbrawl_lobby.jpg","melodie_lobby.jpg","sandsoftime_lobby.jpg","lunar_new_year_rat.jpg","summer_lobby.jpg","brawloween02_lobby.jpg","brawloween_2022_lobby.jpg","enchanted_forest_lobby.jpg","football2023_lobby.jpg","popstar_lobby.jpg","olympus_lobby.jpg","rumble_jungle_lobby.jpg","biodome_lobby.jpg","candyland_lobby.jpg","phoenix_lobby.jpg","cartoon_lobby.jpg","brawloween_lobby.jpg","godzilla_lobby.jpg","draco_lobby.jpg","robot_factory_season_lobby.jpg","backdrop_screen.jpg","brawlywood_lobby.jpg","winter_lobby.jpg","brawloween01_lobby.jpg","lunar_new_year_lobby.jpg","darkmas_lobby.jpg","brawlentines2023_lobby.jpg","easter_lobby.jpg","candyland_rainbow_lobby.jpg","enchanted_lobby.jpg","cyberbrawl_lobby.jpg"]

export default defineComponent({
  components: {
    BCard,
    BSelect,
    BButton,
    BLightbox,
    BScrollingList,
    Fa,
  },
  props: {
    playerTag: {
      type: String,
      required: true
    },
    player: {
      type: Object as PropType<Player>,
      required: false
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

    const selectedBackground = ref(backgroundIds[0])
    const selectedBrawlerId = ref<string>()
    const playerTag = computed(() => props.playerTag)
    const playerRenderUrl = usePlayerRender(playerTag, selectedBrawlerId, selectedBackground)

    watch(playerTag, () => selectedBrawlerId.value = undefined)

    const onClickEdit = () => {
      emit('interact')
      editing.value = !editing.value
    }

    const origin = useSelfOrigin()
    const playerUrl = computed(() => `${origin}/player/${playerTag.value}?utm_source=share&utm_medium=image&utm_campaign=hype-stats`)

    const onShare = () => {
      emit('interact')
      event('share', {
        'content_type': 'profile',
      })
    }
    const onShareCancel = () => {
      emit('interact')
      event('cancel_share_sharepic', {})
    }

    const onDownload = () => {
      emit('interact')
      event('download_sharepic', {})
    }

    const i18n = useI18n()
    const error = ref('')
    const loading = ref(false)
    const onError = () => {
      error.value = i18n.t('error.misc')
    }
    watch(playerRenderUrl, () => {
      error.value = ''
      loading.value = true
    })

    const brawlers = computed(() => Object.fromEntries(
      Object.entries(props.player?.brawlers ?? {})
        .map(([id, brawler]) => [id, capitalizeWords(brawler.name.toLowerCase())])
    ))

    const editing = ref(false)
    const lightboxOpen = ref(false)

    const prefix = useId()

    return {
      lightboxOpen,
      onClickEdit,
      editing,
      playerRenderUrl,
      error,
      loading,
      onError,
      mediaUrl,
      playerUrl,
      selectedBackground,
      selectedBrawlerId,
      onShare,
      onShareCancel,
      onDownload,
      backgrounds,
      brawlers,
      faCheck,
      faExpand,
      prefix,
    }
  },
})
</script>
