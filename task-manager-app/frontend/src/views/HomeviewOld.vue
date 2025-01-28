<script setup lang="ts">
import {type Aircraft} from "@/model/Aircraft";
import {onMounted, ref} from "vue";
import config from "@/config";
import {useStatusService} from "@/composables/useStatusService";
import type {AircraftStatus} from "@/model/AircraftStatus";
import {useAuth} from "@/composables/useAuth";

const aircrafts = ref<Array<Aircraft>>([])
const statuses = ref<Map<string, AircraftStatus>>(new Map())
const statusService = useStatusService()
const auth = useAuth()

async function fetchData() {
  const response = await auth.authorizedRequest(config.backendUrl + "/aircrafts")
  aircrafts.value = response
}

function processStatus(status: AircraftStatus) {
  console.log('Received new status:', status)
  statuses.value.set(status.aircraftId, status)
}

function test(){
  const log = auth.getId()

  console.log('userid', auth.state.user.userId)
  console.log('userid', log)
}

onMounted(async () => {
  test()
  await fetchData()
  await statusService.init()
  aircrafts.value.forEach(aircraft => {
    statusService.subscribeToAircraft(aircraft._id, processStatus)
  })
})
</script>

<template>
  <main v-if="auth.state.authenticated">
    <h1>Aircrafts</h1>
    <div v-for="aircraft in aircrafts" :key="aircraft.name">
      <h3>{{ aircraft.name }}</h3>
      <p>{{ aircraft.model}}, {{ aircraft.capacity }} seats, {{ aircraft.rangeKm }} km</p>
      <p v-if="statuses.has(aircraft._id)">
        Current location:
        {{ statuses.get(aircraft._id)!.latitude }}
        {{ statuses.get(aircraft._id)!.longitude }}
        ({{ new Date(statuses.get(aircraft._id)!.timestamp).toLocaleString() }})
      </p>
    </div>
    <hr/>
    <button @click="statusService.send('Hi, backend!')">Send test message</button>
  </main>
</template>