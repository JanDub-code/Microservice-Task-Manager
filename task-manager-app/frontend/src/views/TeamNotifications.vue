<template>
  <div v-if="auth.state.authenticated" class="team-notification">
    <h1>Team Notifications</h1>

    <!-- Tlačítka s výpisem týmů -->
    <div class="team-list">
      <button
          v-for="team in filteredTeams"
          :key="team.name"
          :class="['team-button', { active: team.name === activeTeamId }]"
          @click="toggleTeam(team.name)"
      >
        {{ team.name }}
        <span v-if="notificationCounts[team.name]" class="badge">
          {{ notificationCounts[team.name] }}
        </span>
      </button>
    </div>

    <!-- Notifikace pro vybraný tým -->
    <div v-if="activeTeam" class="team-content">
      <div class="header">
        <h2>{{ activeTeam.name }} - Notifications</h2>
      </div>

      <!-- Seznam notifikací -->
      <ul v-if="notifications.length" class="notifications-list">
        <li
            v-for="notification in notifications"
            :key="notification._id"
            class="notification-item"
        >
          <div class="notification-details">
            <p>{{ notification.text }}</p>
            <span class="timestamp">{{ formatDate(notification.timestamp) }}</span>
          </div>
        </li>
      </ul>

      <!-- Placeholder, pokud nejsou notifikace -->
      <div v-else class="no-notifications">
        <p>No notifications for this team.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAuth } from "@/composables/useAuth";
import config from "@/config";
// náš Socket.IO composable
import { useNotificationService } from "@/composables/useNotificationService";

interface Member {
  userId: string;
  username: string;
  role: string;
}

interface Team {
  name: string;
  members: Member[];
  joinCode: string;
}

interface Notification {
  _id: string;
  teamId: string;
  userId: string;
  text: string;
  timestamp: string; // ISO Date string
}

const auth = useAuth();
const teams = ref<Array<Team>>([]);             // Seznam týmů z backendu
const activeTeamId = ref<string | null>(null);  // Aktuálně vybraný tým (název)
const notifications = ref<Array<Notification>>([]);

// Počty "nepřečtených" notifikací pro každý tým
const notificationCounts = ref<{ [key: string]: number }>({});

// Vrátí tým, který je právě aktivní (podle `activeTeamId`)
const activeTeam = computed(() => teams.value.find(team => team.name === activeTeamId.value) || null);

// Načtení Socket.IO service
const notificationService = useNotificationService();

/**
 * 1) Načíst seznam týmů (REST, typicky jenom kvůli zobrazení)
 */
async function fetchTeams() {
  try {
    const response = await auth.authorizedRequest(`${config.backendUrl}/teams`);
    teams.value = response;
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
}

/**
 * Při kliknutí na týmové tlačítko toggle
 */
function toggleTeam(teamName: string) {
  if (activeTeamId.value === teamName) {
    // pokud kliknul na už aktivní tým, "zavřeme" ho
    activeTeamId.value = null;
    notifications.value = [];
  } else {
    activeTeamId.value = teamName;
  }
}

/**
 * Reakce na přihlášení k odběru notifikací pro daný team
 *  - obdržíme "historii" (pole notifikací)
 *  - dále dorazí "nové" notifikace po jedné
 */
function subscribeToTeamNotifications(teamId: string) {
  notificationService.subscribeToTeam(
      teamId,
      // Callback pro historické notifikace (event "notificationHistory")
      (history: Notification[]) => {
        console.log("History for team", teamId, history);
        notifications.value = history;  // přepíšeme seznam
        notificationCounts.value[teamId] = 0; // vynulovat "badge"
      },
      // Callback pro novou notifikaci (event "notification")
      (newNotif: Notification) => {
        console.log("New notification for team", teamId, newNotif);
        notifications.value.unshift(newNotif);
        // navýšit "badge" jen pokud není daný tým aktuálně zobrazen?
        if (activeTeamId.value !== teamId) {
          notificationCounts.value[teamId] = (notificationCounts.value[teamId] || 0) + 1;
        }
      }
  );
}

/**
 * Sledujeme změnu `activeTeamId`. Kdykoliv se změní:
 *  - přihlásíme se k Socket.IO (pokud to ještě není),
 *  - získáme historické notifikace,
 *  - a budeme přijímat nové notifikace.
 */
watch(activeTeamId, (newTeamId, oldTeamId) => {
  if (newTeamId) {
    subscribeToTeamNotifications(newTeamId);
  }
});

/**
 * Formát datumu
 */
function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleString();
}

/**
 * Filtrované týmy: jen ty, kde je uživatel členem
 */
const filteredTeams = computed(() => {
  return teams.value.filter(team =>
      team.members.some(member => member.userId === auth.getId())
  );
});

/**
 * onMounted:
 *  - Načteme seznam týmů přes REST
 *  - Připojíme se k Socket.IO
 */
onMounted(async () => {
  await fetchTeams();
  await notificationService.init();
});

/**
 * Při opuštění stránky/komponenty se odpojíme
 */
onBeforeUnmount(() => {
  notificationService.disconnect();
});
</script>

<style scoped>
.team-notification {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f7fafc;
  min-height: 100vh;
}

.team-notification h1 {
  margin-bottom: 20px;
  font-size: 2em;
  color: #333;
  text-align: center;
}

.team-list {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.team-button {
  position: relative;
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.team-button:hover {
  background-color: #2b6cb0;
  transform: translateY(-2px);
}

.team-button.active {
  background-color: #2c5282;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e53e3e;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
}

.team-content {
  width: 100%;
  max-width: 900px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 1.75rem;
  color: #2d3748;
  text-align: center;
}

.notifications-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.notification-item {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.notification-details {
  flex: 1;
  text-align: center;
}

.notification-details p {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
}

.timestamp {
  font-size: 0.85rem;
  color: #a0aec0;
}

.no-notifications {
  text-align: center;
  padding: 2rem;
  color: #a0aec0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .team-list {
    flex-direction: column;
    align-items: center;
  }
  .header {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .team-content {
    padding: 1rem;
  }
  .notification-item {
    flex-direction: column;
    align-items: center;
  }
}
</style>
