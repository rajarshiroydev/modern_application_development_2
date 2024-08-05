export default {
  template: `
    <div>
      <h1>Admin Dashboard</h1>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Section Name</th>
            <th>No of Books</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id">
            <td class="font">{{ section.id }}</td>
            <td class="font">{{ section.name }}</td>
            <td class="font">{{ section.size }}</td>
            <td>
              <button @click="show_section(section.id)" class="btn btn-primary">
                <i class="fas fa-search"></i>
                Show
              </button>
              <button @click="edit_section(section.id)" class="btn btn-success">
                <i class="fas fa-edit"></i>
                Edit
              </button>
              <button @click="delete_section(section.id)" class="btn btn-danger">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="btn btn-success" @click="add_section">
        Add Section
      </button>
    </div>
  `,
  data() {
    return {
      sections: [],
    };
  },
  methods: {
    async show_section(id) {
      this.$router.push(`/section/${id}/show`);
    },
    async edit_section(id) {
      this.$router.push(`/section/${id}/edit`);
    },
    async delete_section(id) {
      if (confirm("Are you sure you want to delete this section?")) {
        try {
          const url = window.location.origin;
          const response = await fetch(`${url}/api/section/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          });

          if (response.ok) {
            this.fetch_sections(); // Refresh the section list after deletion
          } else {
            const errorData = await response.json();
            alert(errorData.error || "Failed to delete section.");
          }
        } catch (error) {
          console.error("Error deleting section:", error);
          alert("An error occurred while deleting the section. Please try again.");
        }
      }
    },
    add_section() {
      this.$router.push("/section/add");
    },
    async fetch_sections() {
      try {
        const url = window.location.origin;
        const response = await fetch(`${url}/adminhome`, {
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.sections = data;
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to fetch sections.");
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
        alert("An error occurred while fetching sections. Please try again.");
      }
    },
  },
  created() {
    this.fetch_sections();
  },
};
