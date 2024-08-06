export default {
  template: `
      <div>
        <h1>Edit Book</h1>
        <form class="form" @submit.prevent="edit_book">
          <div class="form-group">
            <label for="name" class="form-label">Book Name</label>
            <input 
              type="text" 
              v-model="book.name" 
              id="name" 
              class="form-control" 
              required
            >
          </div>
          <div class="form-group">
            <label for="content" class="form-label">Content</label>
            <textarea 
              v-model="book.content" 
              id="content" 
              class="form-control" 
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="author" class="form-label">Author</label>
            <input 
              type="text" 
              v-model="book.author" 
              id="author" 
              class="form-control" 
              required
            >
          </div>
          <div class="form-group">
            <label for="section" class="form-label">Section</label>
            <select 
              v-model="book.section_id" 
              id="section" 
              class="form-control" 
              required
            >
              <option 
                v-for="section in sections" 
                :key="section.id" 
                :value="section.id"
              >
                {{ section.name }}
              </option>
            </select>
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
      book: {
        name: "",
        content: "",
        author: "",
        section_id: null,
      },
      sections: [],
    };
  },
  methods: {
    async fetch_book() {
      try {
        const url = window.location.origin;
        const response = await fetch(
          `${url}/api/book/${this.$route.params.id}/edit`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          this.book = data.book;
          this.sections = data.sections;
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to fetch book data.");
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
        alert("An error occurred while fetching the book data.");
      }
    },
    async edit_book() {
      try {
        const url = window.location.origin;
        const response = await fetch(
          `${url}/api/book/${this.$route.params.id}/edit`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(this.book),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          this.$router.push(`/section/${this.book.section_id}/show`);
        } else {
          const text = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (error) {
            console.error("Failed to parse JSON:", text);
            alert(
              "An error occurred while updating the book. See console for details."
            );
            return;
          }
          console.error(errorData);
          alert(
            errorData.error || "An error occurred while updating the book."
          );
        }
      } catch (error) {
        console.error("Error updating book:", error);
        alert("An error occurred while updating the book.");
      }
    },
  },
  created() {
    this.fetch_book();
  },
};
