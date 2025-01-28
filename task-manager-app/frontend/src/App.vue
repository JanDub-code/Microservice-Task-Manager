<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import {useAuth} from "@/composables/useAuth";
import {onMounted, ref} from "vue";

let loading = ref(true)

const auth = useAuth()

onMounted(async () => {
  await auth.init()
  loading.value = false
})
</script>
<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <header>
      <nav class="navbar">
        <RouterLink v-if="auth.state.authenticated" to="/createTeam">Create Team</RouterLink>
        <RouterLink v-if="auth.state.authenticated" to="/joinTeam">Join Team</RouterLink>

        <RouterLink v-if="auth.state.authenticated" to="/createTask">Create Task</RouterLink>

        <RouterLink v-if="auth.state.authenticated" to="/teamDashboard">Team Dashboard</RouterLink>
        <RouterLink v-if="auth.state.authenticated" to="/TeamNotifications">Team Notifications</RouterLink>
        <RouterLink v-if="auth.state.authenticated" to="/teamManagement">Team Management</RouterLink>
        <RouterLink v-if="auth.state.authenticated" to="/about">About</RouterLink>



        <!-- Přidání login button do navbaru -->
        <button v-if="!auth.state.authenticated" @click="auth.login()" class="login-button">Log in</button>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
/* Globální reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Body nastavení pro centrování */
body, html {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header styl */
header {
  background-color: #f8f9fa;
  padding: 20px 0;
  position: relative;
  width: 100%;
}

.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0 20px;
  text-align: center;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #333;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  z-index: 1000;
}

.navbar a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
}

.navbar a:hover {
  background-color: #575757;
}
.navbar .login-button {
  margin-left: auto; /* Tlačítko bude zarovnáno vpravo */
  margin-right: 16px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.navbar .login-button:hover {
  background-color: #45a049;
}
/* Hlavní obsah s centrováním */
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 80px); /* Adjust height to avoid navbar overlap */
  text-align: center;
  padding: 20px;
}

/* Ujistíme se, že RouterView také zůstane centrovaný */
.content > * {
  width: 100%;
  max-width: 800px; /* Max width to prevent large content overflow */
}
</style>