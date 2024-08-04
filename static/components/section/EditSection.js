export default {
  template: `
        <div>
      <form class="form" @submit.prevent="edit_section">
        <div class="form-group">
          <label for="name" class="form-label">Section Name</label>
          <input 
            type="text" 
            v-model="sectionName" 
            id="name" 
            class="form-control" 
            required
          >
        </div>
        <button type="submit" class="btn btn-success">
          <i class="fas fa-edit"></i>
          Update
        </button>
      </form>
    </div>
      `,
  data() {
    return {
      sectionName: "",
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
        } else {
          alert("Failed to fetch section data.");
        }
      } catch (error) {
        console.error("Error fetching section data:", error);
        alert("An error occurred while fetching the section data.");
      }
    },
    async edit_section() {
      try {
        const url = window.location.origin;
        const response = await fetch(
          `${url}/api/section/${this.$route.params.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.sectionName,
            }),
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
              "An error occurred while updating the section. See console for details."
            );
            return;
          }
          console.error(data);
          alert(data.error || "An error occurred");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while updating the section.");
      }
    },
  },
  created() {
    this.fetch_section();
  },
};
