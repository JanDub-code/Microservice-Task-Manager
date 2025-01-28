<template>
  <div class="container">
    <h1>Login Successful</h1>
    <p v-if="auth.error">{{ auth.error }}</p>
    <p v-if="auth.state.authenticated">Welcome, {{ auth.getUsername() }}!</p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { onMounted } from 'vue';

const auth = useAuth();

onMounted(async () => {
  const currentUrl = window.location.href;
  await auth.handleCallback(currentUrl);
});
</script>

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
  margin-bottom: 10px;
}
</style>
