export default {
  template: `  
  <div>
    <h1>Books in Section {{ section.name }}</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Book ID</th>
          <th>Book Name</th>
          <th>Author</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in section.books" :key="book.id">
          <td class="font">{{ book.id }}</td>
          <td class="font">{{ book.name }}</td>
          <td class="font">{{ book.author }}</td>
          <td>
            <button @click="show_book(book.id)" class="btn btn-primary">
              <i class="fas fa-search"></i>
              Show
            </button>
            <button @click="edit_book(book.id)" class="btn btn-success">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="delete_book(book.id)" class="btn btn-danger">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button class="btn btn-success" @click="add_book">
        Add Book
      </button>
  </div>`,
  data() {
    return {
      section: {
        name: "",
        books: [],
      },
    };
  },
  async created() {
    await this.fetchSectionBooks();
  },
  methods: {
    async show_book(id) {
      this.$router.push(`/book/${id}/show`);
    },
    async edit_book(id) {
      this.$router.push(`/book/${id}/edit`);
    },
    async delete_book(id) {
      if (confirm("Are you sure you want to delete this book?")) {
        try {
          const url = `${window.location.origin}/api/book/${id}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            alert(data.message || "Book deleted successfully.");
            await this.fetchSectionBooks(); // Refresh the book list
          } else {
            const errorData = await response.json();
            alert(errorData.error || "Failed to delete book.");
          }
        } catch (error) {
          console.error("Error deleting book:", error);
          alert("An error occurred while deleting the book. Please try again.");
        }
      }
    },
    add_book() {
      this.$router.push("/book/add");
    },
    async fetchSectionBooks() {
      try {
        const id = this.$route.params.id;
        const url = `${window.location.origin}/section/${id}/show`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.section = data;
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to fetch section data.");
        }
      } catch (error) {
        console.error("Error fetching section books:", error);
        alert(
          "An error occurred while fetching section books. Please try again."
        );
      }
    },
  },
};
