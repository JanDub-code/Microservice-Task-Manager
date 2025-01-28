<template>
  <div v-if="auth.state.authenticated" class="team-management">
    <h1>Team Management</h1>
    <ul>
      <li v-for="team in filteredTeams" :key="team.name" class="team-item">
        <button class="team-name" @click="toggleTeam(team.name)">
          {{ team.name }}
        </button>
        <div v-if="team.name === activeTeamId" class="team-details">
          <div class="members-section">
            <h2>Team Members</h2>
            <ul>
              <li v-for="member in team.members" :key="member.username" class="member-item">
                <span>{{ member.username + ' ' + member.role }}</span>
                <div class="actions" v-if="isAdmin(team)">
                  <select v-model="member.role" @change="updateRole(team.name, member.userId, member.role)">
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
                  <button class="remove-button" @click="removeMember(team.name, member.userId)">Remove</button>
                </div>
              </li>
            </ul>
          </div>
          <hr />
          <div class="invite-section">
            <h2>Invite Code</h2>
            <div class="invite-controls">
              <input v-model="team.joinCode" readonly />
              <button class="copy-button" @click="copyInviteCode(team.joinCode)">Copy</button>
            </div>
          </div>
          <div v-if="isAdmin(team)">
            <button class="delete-team-btn" @click="deleteTeam(team.name)">Delete Team</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import config from "@/config";


// Definování modelu pro tým
interface Team {
  name: string;
  members: { userId: string; role: string,username : string}[];  // Array členů s userId a role
  joinCode: string;
}

const auth = useAuth();
const teams = ref<Array<Team>>([]); // Týmy budou uloženy sem
const activeTeamId = ref<string | null>(null);
const userid = auth.getId();

// Funkce pro načtení týmů z backendu
async function fetchTeams() {
  try {
    const response = await auth.authorizedRequest(config.backendUrl + "/teams");
    teams.value = response; // Uložení týmů do reaktivní proměnné
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
}

// Filtrování týmů podle přihlášeného uživatele
const filteredTeams = computed(() => {
  return teams.value.filter(team =>
      team.members.some(member => member.userId === auth.getId())
  );
});

const isAdmin = (team: Team) => {
  return team.members.some(member => member.userId === userid && member.role === 'Admin');
};

const getAdminUserIds = computed(() => {
  const adminUserIds: string[] = [];

  // Projdeme všechny filtrované týmy
  filteredTeams.value.forEach(team => {
    // Pro každý tým projdeme jeho členy
    team.members.forEach(member => {
      if (member.role === 'Admin') {
        adminUserIds.push(member.userId); // Přidáme userId administrátora
      }
    });
  });

  return adminUserIds;
});
// Funkce pro přepnutí aktivního týmu
const toggleTeam = (teamName: string) => {
  activeTeamId.value = activeTeamId.value === teamName ? null : teamName;
};

const copyInviteCode = (code: string) => {
  navigator.clipboard.writeText(code);
  alert('Invite code copied to clipboard!');
};

// Funkce pro změnu role člena v týmu
const updateRole = async (teamName: string, userId: string, newRole: string) => {
  const DATA1 = { teamName: teamName,userId:userId,newRole: newRole}
  try {
    // Odeslání požadavku na backend s daty pro změnu role
    const response = await auth.authorizedRequest(`${config.backendUrl}/changeRoleInTeam`, {
      method: 'PATCH',
      data: DATA1

    });

    // Po úspěchu, aktualizujeme roli člena na frontendu
    const team = teams.value.find(t => t.name === teamName);
    if (team) {
      const member = team.members.find(m => m.userId === userId);
      if (member) {
        member.role = newRole; // Aktualizujeme roli člena
      }
    }

    console.log(`Role of user ${userId} updated to ${newRole} in team ${teamName}`);
  } catch (error) {
    console.error('Error updating role:', error);
    alert('Error updating role');
  }
};


// Funkce pro odstranění člena z týmu
const removeMember = async (teamName: string, userId: string) => {
  const DATA = { teamName: teamName,userId:userId}
  try {
    // Odeslání požadavku na backend s daty
    const response = await auth.authorizedRequest(`${config.backendUrl}/deleteUserFromTeam`, {
      method: 'DELETE',
      data: DATA,
      //body: JSON.stringify({ teamName, userId }), // Posíláme data ve formátu JSON
    });

    // Po úspěchu, odebereme člena z frontendu
    const team = teams.value.find(t => t.name === teamName);
    if (team) {
      team.members = team.members.filter(member => member.userId !== userId);
    }

    console.log(`Member ${userId} removed from team ${teamName}`);
  } catch (error) {
    console.error('Error removing member:', error);
    alert('Error removing member');
  }
};

const deleteTeam = async (teamName: string) => {
  const DATA = {teamName:teamName}
  try {
    // Odeslání požadavku na backend pro smazání týmu
    const response = await auth.authorizedRequest(`${config.backendUrl}/deleteTeam`, {
      method: 'DELETE',
      data: DATA,
    });

    // Po úspěchu, odstraníme tým z frontendu
    teams.value = teams.value.filter(team => team.name !== teamName);
    console.log(`Team ${teamName} deleted successfully`);

    alert('Team deleted successfully!');
  } catch (error) {
    console.error('Error deleting team:', error);
    alert('Error deleting team');
  }
};


// Načítání dat při inicializaci komponenty
onMounted(() => {
  fetchTeams(); // Načteme týmy z backendu
});
</script>

<style scoped>
/* Center the entire team management section */
.team-management {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* Style the header */
.team-management h1 {
  margin-bottom: 20px;
  font-size: 2em;
  color: #333;
}

/* Style the team list */
.team-management ul {
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 800px;
}

/* Style each team item */
.team-item {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Style the team name button */
.team-name {
  background-color: #4CAF50; /* Green */
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 1.1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  text-align: left;
}

.team-name:hover {
  background-color: #45a049;
}

/* Style the team details section */
.team-details {
  margin-top: 15px;
  padding-left: 10px;
}

/* Style the members section */
.members-section, .invite-section {
  margin-bottom: 20px;
}

/* Style member items */
.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.member-item:last-child {
  border-bottom: none;
}

/* Style the actions within member items */
.actions {
  display: flex;
  gap: 10px;
}

/* General button styles */
button {
  padding: 8px 16px;
  font-size: 0.9em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s;
}

button:hover {
  opacity: 0.8;
}

/* Specific button styles */
.copy-button {
  background-color: #2196F3; /* Blue */
  color: white;
}

.delete-team-btn {
  background-color: #f44336; /* Red */
  color: white;
}

.remove-button {
  background-color: #f44336; /* Red */
  color: white;
}

.update-role-button {
  background-color: #FFC107; /* Amber */
  color: white;
}

/* Style the invite controls */
.invite-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.invite-controls input {
  flex: 1;
  padding: 8px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .team-name {
    font-size: 1em;
    padding: 10px 15px;
  }

  button {
    font-size: 0.8em;
    padding: 6px 12px;
  }
}
</style>
