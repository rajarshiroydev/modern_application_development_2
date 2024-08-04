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
        const response = await fetch(
          `${url}/api/section/${this.$route.params.id}`
        );
        if (response.ok) {
          const data = await response.json();
          this.sectionName = data.name;
        //   this.sectionBooksCount = data.books.length;
        } else {
          alert("Failed to fetch section data.");
        }
      } catch (error) {
        console.error("Error fetching section data:", error);
        alert("An error occurred while fetching the section data.");
      }
    },
    async delete_section() {
      try {
        const url = window.location.origin;
        const response = await fetch(
          `${url}/api/section/${this.$route.params.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          this.$router.push("/admin");
        } else {
          const text = await response.text(); // Get raw response text
          let data;
          try {
            data = JSON.parse(text); // Try to parse it as JSON
          } catch (error) {
            console.error("Failed to parse JSON:", text);
            alert(
              "An error occurred while deleting the section. See console for details."
            );
            return;
          }
          console.error(data);
          alert(data.error || "An error occurred");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the section.");
      }
    },
  },
  created() {
    this.fetch_section();
  },
};
