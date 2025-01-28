<script setup lang="ts">
import {useAuth} from "@/composables/useAuth";


const auth = useAuth()
</script>

<template>
  <main v-if="auth.state.authenticated">
  <div class="container">
    <h1>Welcome to Application</h1>
    <p>For login, click on the button</p>
  </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>