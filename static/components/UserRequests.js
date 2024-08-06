export default {
  template: `
        <div>
          <h1 class="display-1">User Requests</h1>
          <hr>
          <table v-if="requests.length > 0" class="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Book Name</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td>{{ request.user_id }}</td>
                <td>{{ request.username }}</td>
                <td>{{ request.book.name }}</td>
                <td>{{ request.book.author }}</td>
                <td>{{ request.book.date_issued }}</td>
                <td>{{ request.book.return_date }}</td>
                <td>
                  <button class="btn btn-success" @click="grantRequest(request.id)">
                    <i class="fas fa-plus"></i> Grant
                  </button>
                  <button class="btn btn-danger" @click="rejectRequest(request.id)">
                    <i class="fas fa-ban"></i> Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else>
            <h1 class="display-1">No User Requests Currently</h1>
            <hr>
          </div>
        </div>
      `,
  data() {
    return {
      requests: [],
    };
  },
  mounted() {
    this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      try {
        const response = await fetch("/requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          this.requests = data.requests;
        } else {
          console.error(
            "Error fetching requests:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    },
    async grantRequest(requestId) {
      try {
        const response = await fetch(`/api/requests/grant/${requestId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        if (response.ok) {
          alert("Request granted successfully");
          this.fetchRequests(); // Refresh the list
        } else {
          const data = await response.json();
          console.error(
            "Error granting request:",
            data.message || "Unknown error"
          );
          alert("Failed to grant request.");
        }
      } catch (error) {
        console.error("Error granting request:", error);
        alert("An error occurred while granting the request.");
      }
    },
    async rejectRequest(requestId) {
      try {
        const response = await fetch(`/api/requests/reject/${requestId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        if (response.ok) {
          alert("Request rejected successfully");
          this.fetchRequests(); // Refresh the list
        } else {
          const data = await response.json();
          console.error(
            "Error rejecting request:",
            data.message || "Unknown error"
          );
          alert("Failed to reject request.");
        }
      } catch (error) {
        console.error("Error rejecting request:", error);
        alert("An error occurred while rejecting the request.");
      }
    },
  },
};
