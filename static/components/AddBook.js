export default {
  template: `
      <div>
    <form class="form" @submit.prevent="add_book">
      <div class="form-group">
        <label for="name" class="form-label">Book Name</label>
        <input 
          type="text" 
          v-model="bookName" 
          id="name" 
          class="form-control" 
          required
        >
      </div>
      <div class="form-group">
        <label for="content" class="form-label">Content</label>
        <textarea 
          v-model="bookContent" 
          id="content" 
          class="form-control" 
          required
        ></textarea>
      </div>
      <div class="form-group">
        <label for="author" class="form-label">Author</label>
        <input 
          type="text" 
          v-model="bookAuthor" 
          id="author" 
          class="form-control" 
          required
        >
      </div>
      <div class="form-group">
        <label for="section_id" class="form-label">Section ID</label>
        <input 
          type="number" 
          v-model="sectionId" 
          id="section_id" 
          class="form-control" 
          required
        >
      </div>
      <button type="submit" class="btn btn-success">
        <i class="fas fa-plus"></i>
        Add Book
      </button>
    </form>
  </div>
    `,
  data() {
    return {
      bookName: "",
      bookContent: "",
      bookAuthor: "",
      sectionId: "",
    };
  },
  methods: {
    async add_book() {
      try {
        const url = window.location.origin;
        const response = await fetch(`${url}/book/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, // Add token to headers
          },
          body: JSON.stringify({
            name: this.bookName,
            content: this.bookContent,
            author: this.bookAuthor,
            section_id: this.sectionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          this.bookName = ""; // Reset input field
          this.bookContent = ""; // Reset input field
          this.bookAuthor = ""; // Reset input field
          this.sectionId = ""; // Reset input field
          alert("Book added successfully");
          //   this.$router.push(`/section/${id}/show`);
        } else {
          const text = await response.text(); // Get raw response text
          let data;
          try {
            data = JSON.parse(text); // Try to parse it as JSON
          } catch (error) {
            console.error("Failed to parse JSON:", text);
            alert(
              "An error occurred while adding the book. See console for details."
            );
            return;
          }
          console.error(data);
          alert(data.error || "An error occurred");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the book.");
      }
    },
  },
};
