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
                <button @click="showSection(section.id)" class="btn btn-primary">
                  <i class="fas fa-search"></i>
                  Show
                </button>
                <button @click="editSection(section.id)" class="btn btn-success">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button @click="deleteSection(section.id)" class="btn btn-danger">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="addSection" class="btn btn-success">
          Add Section
          </button
      </div>`,
  data() {
    return {
      sections: [],
      newSection: {
        name: "",
      },
      showModal: false,
    };
  },
  methods: {
    fetchSections() {
      // Fetch the sections from the server (adjust the URL as necessary)
      axios
        .get("/api/sections")
        .then((response) => {
          this.sections = response.data;
        })
        .catch((error) => {
          console.error("Error fetching sections:", error);
        });
    },
    showSection(id) {
      // Logic for showing a section (e.g., redirecting to a section detail page)
      this.$router.push({ name: "show_section", params: { id } });
    },
    editSection(id) {
      // Logic for editing a section (e.g., redirecting to an edit page)
      this.$router.push({ name: "edit_section", params: { id } });
    },
    deleteSection(id) {
      // Logic for deleting a section (adjust the URL as necessary)
      axios
        .delete(`/api/sections/${id}`)
        .then((response) => {
          this.fetchSections(); // Refresh the list of sections
        })
        .catch((error) => {
          console.error("Error deleting section:", error);
        });
    },
    showAddSectionModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    addSection() {
      if (!this.newSection.name) {
        alert("Please fill out all the fields");
        return;
      }

      // Send a POST request to add the new section (adjust the URL as necessary)
      axios
        .post("/api/sections", this.newSection)
        .then((response) => {
          this.fetchSections(); // Refresh the list of sections
          this.newSection.name = ""; // Reset the form
          this.closeModal(); // Close the modal
          alert("Section created successfully");
        })
        .catch((error) => {
          console.error("Error adding section:", error);
          alert("Error adding section");
        });
    },
  },
  created() {
    this.fetchSections(); // Fetch the sections when the component is created
  },
};
