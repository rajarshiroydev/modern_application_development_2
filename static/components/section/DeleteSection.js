export default {
  template: `
    <div>
      <h1 class="display-1">Delete Section</h1>
      <p v-if="sectionBooksCount > 0" class="f-3">
        This section contains books. If you delete this section, the books will be deleted too.
      </p>
      <p class="f-3">Are you sure you want to delete {{ sectionName }} section?</p>
      <form @submit.prevent="delete_section" class="form">
        <button type="submit" class="btn btn-danger">
          <i class="fas fa-trash"></i>
          Delete
        </button>
        <button type="button" class="btn btn-secondary" @click="cancel_deletion">
          Cancel
        </button>
      </form>
    </div>
  `,
  data() {
    return {
      sectionName: "",
      sectionBooksCount: 0,
    };
  },
  methods: {
    async fetch_section() {
      try {
        const url = window.location.origin;
        const response = await fetch(`${url}/api/section/${this.$route.params.id}`, {
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.sectionName = data.name;
          this.sectionBooksCount = data.books ? data.books.length : 0;
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to fetch section data.");
        }
      } catch (error) {
        console.error("Error fetching section data:", error);
        alert("An error occurred while fetching the section data.");
      }
    },
    async delete_section() {
      if (!confirm(`Are you sure you want to delete the section "${this.sectionName}"? This action cannot be undone.`)) {
        return;
      }

      try {
        const url = window.location.origin;
        const response = await fetch(`${url}/api/section/${this.$route.params.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          this.$router.push("/adminhome");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "An error occurred while deleting the section.");
        }
      } catch (error) {
        console.error("Error deleting section:", error);
        alert("An error occurred while deleting the section.");
      }
    },
    cancel_deletion() {
      this.$router.push("/adminhome");
    }
  },
  created() {
    this.fetch_section();
  },
};
