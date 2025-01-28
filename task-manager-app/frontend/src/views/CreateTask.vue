<template>
  <div v-if="auth.state.authenticated" class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Create Task</h1>
    <div class="bg-white p-4 rounded-lg shadow">
      <form @submit.prevent="createTask">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="team">Team</label>
          <select
              v-model="task.teamId"
              class="input-field"
              id="team"
              required
          >
            <option disabled value="">Select a team</option>
            <option v-for="team in userTeams" :key="team.name" :value="team.name">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="task-title">Title</label>
          <input
              v-model="task.title"
              class="input-field"
              id="task-title"
              type="text"
              placeholder="Enter task title"
              required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="task-description">Description</label>
          <textarea
              v-model="task.description"
              class="input-field"
              id="task-description"
              placeholder="Enter task description"
              required
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="task-deadline">Deadline</label>
          <input
              v-model="task.dueDate"
              class="input-field"
              id="task-deadline"
              type="date"
              required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="task-priority">Priority</label>
          <select
              v-model="task.priority"
              class="input-field"
              id="task-priority"
              required
          >
            <option disabled value="">Select priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="task-responsible">Responsible Member</label>
          <select
              v-model="task.assignedTo"
              class="input-field"
              id="task-responsible"
              required
          >
            <option disabled value="">Select a member</option>
            <option v-for="member in selectedTeamMembers" :key="member.userId" :value="member.username">
              {{ member.username }}
            </option>
          </select>
        </div>
        <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
        >
          Create Task
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import config from "@/config";
import axios from "axios";

interface Team {
  name: string;
  members: Array<{
    userId: string;
    role: string;
    username: string;
  }>;
  joinCode: string;
}

interface Task {
  teamId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
}

const auth = useAuth();

// State for the task form
const task = ref<Task>({
  teamId: '',
  title: '',
  description: '',
  dueDate: '',
  priority: 'Low',
  assignedTo: '',
});

// List of all teams
const teams = ref<Array<Team>>([]);

// Fetch teams from backend
const fetchUserTeams = async () => {
  try {
    const response = await auth.authorizedRequest(`${config.backendUrl}/teams`);
    teams.value = response;
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
};

// Filtered teams where the user is a member
const filteredUserTeams = computed(() => {
  const userId = auth.getId();
  return teams.value.filter(team =>
      team.members.some(member => member.userId === userId)
  );
});
// Computed property to get user teams
/*const userTeams = computed(() => {
  return teams.value;
});*/
const userTeams = filteredUserTeams;

// Computed property to get members of the selected team
const selectedTeam = computed(() => {
  return teams.value.find(team => team.name === task.value.teamId) || null;
});

const selectedTeamMembers = computed(() => {
  return selectedTeam.value ? selectedTeam.value.members : [];
});

// Handle form submission
const createTask = async () => {
  try {
    if (!task.value.teamId) {
      alert('Please select a team.');
      return;
    }

    const payload = {
      teamId: task.value.teamId,
      name: task.value.title,
      description: task.value.description,
      status: 'Pending', // Default status
      priority: task.value.priority,
      assignedTo: task.value.assignedTo,
      createdBy: auth.getUsername(), // Assuming useAuth provides this method
      dueDate: task.value.dueDate,
      comments: [],
    };

    const response = await auth.authorizedRequest(`${config.backendUrl}/tasks`, {
      method: 'POST',
      data: payload,
    });

    alert('Task created successfully!');
    // Reset the form
    task.value = {
      teamId: '',
      title: '',
      description: '',
      dueDate: '',
      priority: 'Low',
      assignedTo: '',
    };
  } catch (error: any) {
    console.error('Error creating task:', error);
    alert(error.response?.data?.error || 'Failed to create task.');
  }
};

// Initialize by fetching user teams
onMounted(() => {
  fetchUserTeams();
});
</script>

<style scoped>

/* Ensure input fields, textareas, and labels don't overflow */
.input-field,
textarea,
label {
  max-width: 100%; /* Prevents overflowing horizontally */
  box-sizing: border-box; /* Includes padding and border in the width */
  word-wrap: break-word; /* Allows breaking long text inside inputs */
}

/* Prevent overflowing content for long text */
textarea {
  resize: vertical; /* Restrict resizing to vertical only */
  overflow: hidden; /* Prevent scrollbars unless needed */
}

/* Additional styling for labels to prevent overflowing */
label {
  display: block; /* Ensures labels take up full width */
  margin-bottom: 0.5rem; /* Adds spacing between label and input */
  text-overflow: ellipsis; /* Truncates long text with ellipsis */
  white-space: nowrap; /* Prevents text wrapping */
  overflow: hidden; /* Ensures text stays within the container */
}

/* Input field adjustments for smaller screens */
@media screen and (max-width: 600px) {
  .input-field,
  textarea {
    width: 100%; /* Ensures fields take the full width on smaller screens */
  }
}

.container {
  max-width: 600px;
  margin: 0 auto; /* Center horizontally */
  text-align: center; /* Center content */
  background-color: #f7fafc;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Style the main header to match previous styles */
h1 {
  margin-bottom: 20px; /* Add some space below the header */
  font-size: 2em; /* Match Team Management font size */
  color: #333; /* Match Team Management text color */
}

/* Input and Select Field Styles */
.input-field {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 100%;
  padding: 0.75rem 1rem; /* Slightly increase padding for better usability */
  font-size: 1rem; /* Increase font size for readability */
  line-height: 1.5rem;
  margin-bottom: 1rem; /* Add spacing between fields */
}

/* Input and Select Field Focus Styles */
.input-field:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.3);
}

/* Button Styles */
button {
  background-color: #3182ce;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem; /* Increase padding for larger button size */
  border-radius: 0.5rem; /* Rounded button corners */
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-size: 1rem; /* Increase font size for better visibility */
}

button:hover {
  background-color: #2b6cb0;
  transform: translateY(-2px); /* Subtle hover effect */
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.3);
}

/* Form container styling */
.bg-white {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

label {
  text-align: left; /* Align labels to the left */
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: bold;
}

textarea {
  resize: vertical; /* Allow resizing only vertically */
}

/* Adjustments for smaller screens */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5em;
  }

  button {
    font-size: 0.9rem;
  }

  .input-field {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

</style>
