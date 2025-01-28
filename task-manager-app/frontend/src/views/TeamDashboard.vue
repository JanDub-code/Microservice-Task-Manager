<template>
  <div v-if="auth.state.authenticated" class="team-dashboard">
    <h1>Team Dashboard</h1>

    <!-- Horizontal Team List -->
    <div class="team-list">
      <button
          v-for="team in filteredTeams"
          :key="team.name"
          :class="['team-button', { active: team.name === activeTeamId }]"
          @click="toggleTeam(team.name)"
      >
        {{ team.name }}
      </button>
    </div>

    <!-- Conditional Team Content -->
    <div v-if="activeTeam" class="team-content">
      <div class="header">
        <h2>{{ activeTeam.name }} - Tasks</h2>
      </div>

      <div class="filters">
        <div>
          <label for="member-filter">Filter by Member</label>
          <select id="member-filter" v-model="selectedMember">
            <option>All Members</option>
            <option v-for="member in activeTeam.members" :key="member.userId" :value="member.username">
              {{ member.username }}
            </option>
          </select>
        </div>
        <div>
          <label for="status-filter">Filter by Status</label>
          <select id="status-filter" v-model="selectedStatus">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <!-- Tasks List -->
      <ul v-if="filteredTasks.length" class="tasks-list">
        <li v-for="task in filteredTasks" :key="task._id" class="task-item">
          <div class="task-details">
            <h3>{{ task.name }}</h3>
            <p>{{ task.description }}</p>
            <p>
              <strong>Status:</strong>
              <select v-model="task.status" @change="updateStatus(task._id, task.status)">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </p>
            <p><strong>Priority:</strong> {{ task.priority }}</p>
            <p><strong>Assigned To:</strong> {{ task.assignedTo }}</p>
            <p><strong>Due Date:</strong> {{ formatDate(task.dueDate) }}</p>
          </div>
          <div class="task-actions">
            <button class="delete-task-btn" @click="deleteTask(task._id)">Delete</button>
          </div>
          <!-- Comments Section -->
          <div class="comments-section">
            <h4>Comments</h4>
            <ul>
              <li v-for="comment in task.comments" :key="comment._id">
                <strong>{{ comment.userId }}:</strong> {{ comment.content }}
              </li>
            </ul>
            <div class="add-comment">
              <input v-model="newCommentContent" placeholder="Add a comment..." />
              <button @click="addComment(task._id)">Submit</button>
            </div>
          </div>
        </li>
      </ul>

      <!-- Placeholder for No Tasks -->
      <div v-else class="no-tasks">
        <p>No tasks available for this team.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from "@/composables/useAuth";
import config from "@/config";
import axios from 'axios';

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

interface Comment {
  _id: string;
  userId: string; // Username
  content: string;
}

interface Task {
  _id: string;
  teamId: string; // Team name
  name: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string; // Username
  createdBy: string; // Username
  dueDate: string; // ISO Date string
  comments: Comment[];
}

const auth = useAuth();
const teams = ref<Array<Team>>([]); // Teams will be fetched from backend
const activeTeamId = ref<string | null>(null);
const activeTeam = computed(() => teams.value.find(team => team.name === activeTeamId.value) || null);

const tasks = ref<Array<Task>>([]); // Tasks will be fetched based on active team

// Selected Filters
const selectedMember = ref('All Members');
const selectedStatus = ref('All Statuses');

// Task to Edit or Comment
const taskToEdit = ref<Task | null>(null);
const taskToComment = ref<Task | null>(null);

// Comment Content
const newCommentContent = ref('');

// Fetch Teams from Backend
const fetchTeams = async () => {
  try {
    const response = await auth.authorizedRequest(`${config.backendUrl}/teams`);
    teams.value = response;
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
};

const updateStatus = async (taskId: string, status: string) => {
  try {
    const payload = { status };
    await auth.authorizedRequest(`${config.backendUrl}/tasks/${taskId}/status`, {
      method: "PATCH",
      data: payload,
    });

    alert(`Task status updated to ${status}`);
  } catch (error: any) {
    console.error("Error updating task status:", error);
    alert(error.response?.data?.error || "Failed to update task status.");
  }
};

// Fetch Tasks from Backend based on active team
const fetchTasks = async () => {
  if (!activeTeamId.value) {
    tasks.value = [];
    return;
  }
  try {
    const response = await auth.authorizedRequest(`${config.backendUrl}/tasks?teamId=${encodeURIComponent(activeTeamId.value)}`);
    tasks.value = response;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

const deleteTask = async (taskId: string) => {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    await auth.authorizedRequest(`${config.backendUrl}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    alert('Task deleted successfully!');
    fetchTasks(); // Refresh tasks after deletion
  } catch (error: any) {
    console.error('Error deleting task:', error);
    alert(error.response?.data?.error || 'Failed to delete task.');
  }
};


// Computed Property for Filtered Teams (User is a member)
const filteredTeams = computed(() => {
  return teams.value.filter(team =>
      team.members.some(member => member.userId === auth.getId())
  );
});

// Computed Property for Filtered Tasks
const filteredTasks = computed(() => {
  if (!activeTeam.value) return [];

  return tasks.value.filter(task => {
    return (
        (selectedMember.value === 'All Members' || task.assignedTo === selectedMember.value) &&
        (selectedStatus.value === 'All Statuses' || task.status === selectedStatus.value)
    );
  });
});

// Toggle Active Team
const toggleTeam = (teamName: string) => {
  activeTeamId.value = activeTeamId.value === teamName ? null : teamName;
  if (activeTeamId.value) {
    fetchTasks();
  } else {
    tasks.value = [];
  }
};

// Add Comment Function
const addComment = async (taskId: string) => {
  if (!newCommentContent.value.trim()) {
    alert('Comment cannot be empty.');
    return;
  }

  try {
    const payload = {
      userId: auth.getUsername(), // Ensure this method exists
      content: newCommentContent.value.trim(),
    };

    await auth.authorizedRequest(`${config.backendUrl}/tasks/${taskId}/comments`, {
      method: 'POST',
      data: payload,
    });

    alert('Comment added successfully!');
    fetchTasks(); // Refresh tasks to show the new comment
  } catch (error: any) {
    console.error('Error adding comment:', error);
    alert(error.response?.data?.error || 'Failed to add comment.');
  }
};

// Format Date Function
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

// Initialize Component by Fetching Teams
onMounted(() => {
  fetchTeams();
});
</script>

<style scoped>

.delete-task-btn {
  background-color: #e53e3e; /* Red */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.delete-task-btn:hover {
  background-color: #c53030;
  transform: translateY(-2px);
}

/* Center the entire team dashboard */
.team-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f7fafc;
  min-height: 100vh;
}

/* Style the main header */
.team-dashboard h1 {
  margin-bottom: 20px;
  font-size: 2em; /* Match Team Management font size */
  color: #333; /* Match Team Management text color */
}

/* Horizontal Team List */
.team-list {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.team-button {
  background-color: #3182ce; /* Blue */
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

/* Team Content Section */
.team-content {
  width: 100%;
  max-width: 900px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header within Team Content */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 1.75rem;
  color: #2d3748;
}


/* Filters Section */
.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters div {
  display: flex;
  flex-direction: column;
}

.filters label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.filters select:focus {
  border-color: #3182ce;
}

/* Tasks List */
.tasks-list {
  list-style: none;
  padding: 0;
}

.task-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.task-details {
  margin-bottom: 1rem;
}

.task-details h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.task-details p {
  margin: 0.25rem 0;
  color: #4a5568;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Comments Section */
.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #cbd5e0;
}

.comments-section h4 {
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.comments-section ul {
  list-style: none;
  padding: 0;
  margin-bottom: 1rem;
}

.comments-section li {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.add-comment {
  display: flex;
  gap: 0.5rem;
}

.add-comment input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  outline: none;
}

.add-comment button {
  background-color: #38a169; /* Green */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.add-comment button:hover {
  background-color: #2f855a;
  transform: translateY(-2px);
}

/* No Tasks Placeholder */
.no-tasks {
  text-align: center;
  padding: 2rem;
  color: #a0aec0;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .team-list {
    flex-direction: column;
    align-items: center;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .team-content {
    padding: 1rem;
  }

  .task-item {
    padding: 1rem;
  }
}
</style>
