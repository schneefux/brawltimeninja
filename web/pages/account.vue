<template>
  <b-page title="Account">
    <b-page-section
      v-if="user != undefined"
      title="Your Reports"
    >
      <b-button
        to="/report-designer"
        class="mt-4"
        primary
        md
      >Create new Report</b-button>
      <div class="mt-4 flex flex-wrap">
        <b-card
          v-for="report in user.reports"
          :key="report.id"
          :title="report.title"
          class="w-full max-w-xs"
        >
          <template v-slot:content>
            <img
              :src="`${renderUrl}/embed/report?id=${report.id}&t=${report.updated_at}`"
            >
          </template>

          <template v-slot:actions>
            <div class="w-full flex justify-between">
              <b-button
                dark
                sm
                @click="deleteReport(report)"
              >Delete</b-button>
              <b-button
                :to="`/report-designer?id=${report.id}`"
                primary
                sm
              >Open</b-button>
            </div>
          </template>
        </b-card>
      </div>
    </b-page-section>

    <b-page-section
      v-if="user != undefined"
      title="Your Dashboards"
    >
      <b-button
        to="/dashboard-designer"
        class="mt-4"
        primary
        md
      >Create new Dashboard</b-button>
      <div class="mt-4 flex flex-wrap">
        <b-card
          v-for="grid in user.grids"
          :key="grid.id"
          :title="grid.title"
          class="w-full max-w-xs"
        >
          <template v-slot:content>
            <img
              :src="`${renderUrl}/embed/dashboard?id=${grid.id}&t=${grid.updated_at}`"
            >
          </template>

          <template v-slot:actions>
            <div class="w-full flex justify-between">
              <b-button
                dark
                sm
                @click="deleteGrid(grid)"
              >Delete</b-button>
              <b-button
                :to="`/dashboard-designer?id=${grid.id}`"
                primary
                sm
              >Open</b-button>
            </div>
          </template>
        </b-card>
      </div>
    </b-page-section>

    <div v-if="user == undefined" class="mt-4">
      <login-button></login-button>
    </div>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue"
import useFeathers from '@schneefux/klicker/composables/feathers'
import { Grid, Report, User } from "@schneefux/klicker/types"
import { useConfig } from "@/composables/compat"

export default defineComponent({
  setup() {
    const $config = useConfig()
    const { isLoggedIn, client } = useFeathers()

    onMounted(async () => {
      const token = await client.authentication.getFromLocation(window.location)
      if (token != null) {
        await client.authentication.setAccessToken(token)
        isLoggedIn.value = true
      }
    })

    const user = ref<User>()
    const updateUser = async () => {
      if (isLoggedIn.value) {
        const users = await client.service('users').find({
          query: {
            $eager: '[reports,grids]',
          },
        })
        user.value = users[0]
      }
    }
    watch(isLoggedIn, updateUser)

    const deleteReport = async (report: Report) => {
      await client.service('reports').remove(report.id!)
      await updateUser()
    }

    const deleteGrid = async (grid: Grid) => {
      await client.service('reports').remove(grid.id!)
      await updateUser()
    }

    const renderUrl = $config.renderUrl

    return {
      user,
      isLoggedIn,
      deleteReport,
      deleteGrid,
      renderUrl,
    }
  },
})
</script>
