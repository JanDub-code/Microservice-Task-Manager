<template>
  <div v-if="auth.state.authenticated" class="create-team">
    <h2>Create a New Team</h2>
    <div>
      <label for="team-name">Team Name</label>
      <input
          id="team-name"
          class="team-input"
          type="text"
          v-model="teamName"
          placeholder="Enter team name"
      />
      <button class="team-btn" @click="createTeam">Create Team</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import axios from "axios";
import config from "@/config";

const auth = useAuth();
const teamName = ref<string>("");
const error = ref<string | null>(null);
const userid = auth.getId();
const username = auth.getUsername();

// Funkce pro vytvoření týmu
const createTeam = async () => {
  if (teamName.value.trim() === "") {
    error.value = "Team name cannot be empty.";
    return;
  }

  try {
    const newTeam = {
      name: teamName.value,
      members: [
        {
          userId: userid, // userId získané z autentifikace
          role: "Admin",  // Vytvářející uživatel bude admin
          username: username,
        },
      ],
      joinCode: generateJoinCode(), // Generování kódu pro připojení
    };

    // Odeslání požadavku na backend
    await axios.post(`${config.backendUrl}/createteam`, newTeam, {
      headers: {
        Authorization: `Bearer ${auth.state.accessToken}`,
      },
    });

    teamName.value = ""; // Resetování inputu po úspěšném vytvoření týmu
    error.value = null;  // Resetování chybové zprávy
    alert("Team created successfully!");
  } catch (err: any) {
    error.value = `Error creating team: Team name already exists.`;
  }
};

// Funkce pro generování unikátního kódu pro připojení
const generateJoinCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let joinCode = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    joinCode += characters[randomIndex];
  }
  return joinCode;
};
</script>

<style scoped>
.create-team {
  text-align: center;
  margin: 2rem 0;
}

.create-team h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.create-team label {
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
