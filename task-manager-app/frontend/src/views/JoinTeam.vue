<template>
  <div v-if="auth.state.authenticated" class="join-team">
    <h2>Join a Team</h2>
    <label for="invite-code">Invite Code</label>
    <input
        id="invite-code"
        class="team-input"
        type="text"
        v-model="joinCode"
        placeholder="Enter invite code"
    />
    <button class="team-btn" type="button" @click="handleJoinClick">Join Team</button>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import axios from "axios";
import config from "@/config";

const auth = useAuth();
const joinCode = ref<string>("");
const error = ref<string | null>(null);
const userid = auth.getId();
const username = auth.getUsername();

const handleJoinClick = async () => {
  if (joinCode.value.trim() === "") {
    error.value = "Invite code cannot be empty.";
    return;
  }

  try {
    const member = {
      userId: userid,
      role: "Member",
      username: username,
    };

    await authorizedRequest(config.backendUrl + "/jointeam", {
      method: "POST",
      data: { joinCode: joinCode.value, member },
    });

    joinCode.value = ""; // Reset po úspěšném připojení
    error.value = null;
    alert("Successfully joined the team!");
  } catch (err: any) {
    error.value = `Error joining team: Team member already exists.`;
  }
};

// Funkce pro autorizované požadavky (již definována)
const authorizedRequest = async (endpoint: string, options = {}) => {
  if (!auth.state.accessToken) {
    error.value = "Not authenticated";
    throw new Error(error.value);
  }

  const response = await axios({
    url: `${endpoint}`,
    headers: {
      Authorization: `Bearer ${auth.state.accessToken}`,
    },
    ...options,
  });
  return response.data;
};
</script>

<style scoped>
.join-team {
  text-align: center;
  margin: 2rem 0;
}

.join-team h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.join-team label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.team-input {
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  outline: none;
  font-size: 1rem;
}

.team-btn {
  background-color: #48bb78;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s;
}

.team-btn:hover {
  background-color: #38a169;
}

.error-message {
  color: red;
  font-size: 1rem;
  margin-top: 1rem;
}
</style>