<template>
  <page title="Account">
    <div v-if="user != undefined">
      <h2 class="mt-3 text-xl font-semibold">Your Reports</h2>
      <b-button
        to="/report-designer"
        class="ml-1 mt-2"
        primary
        md
      >Create new Report</b-button>
      <div class="mt-2 flex flex-wrap">
        <b-card
          v-for="report in user.reports"
          :key="report.id"
          :title="report.title"
          xs
        >
          <img
            slot="content"
            :src="`${renderUrl}/embed/report?id=${report.id}&t=${report.updated_at}`"
          >
          <div
            slot="actions"
            class="w-full flex justify-between"
          >
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
        </b-card>
      </div>

      <h2 class="mt-4 text-xl font-semibold">Your Dashboards</h2>
      <b-button
        to="/dashboard-designer"
        class="ml-1 mt-2"
        primary
        md
      >Create new Dashboard</b-button>
      <div class="mt-2 flex flex-wrap">
        <b-card
          v-for="grid in user.grids"
          :key="grid.id"
          :title="grid.title"
          xs
        >
          <img
            slot="content"
            :src="`${renderUrl}/embed/dashboard?id=${grid.id}&t=${grid.updated_at}`"
          >
          <div
            slot="actions"
            class="w-full flex justify-between"
          >
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
        </b-card>
      </div>
    </div>

    <div v-else class="mt-3">
      <login-button></login-button>
    </div>
  </page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, useContext, watch } from "@nuxtjs/composition-api"
import useFeathers from 'klicker/composables/feathers'
import { Grid, Report, User } from "klicker/types"

export default defineComponent({
  setup() {
    const { $config } = useContext()
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
