export default {
  template: `
    <div>
    <h1 class="display-1">Issued Books</h1>
    <div v-if="issuedBooks.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Book ID</th>
            <th>Username</th>
            <th>Book Name</th>
            <th>Author</th>
            <th>Issue Date</th>
            <th>Return Date</th>
            <th>Revoke</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in issuedBooks" :key="item.id">
            <td>{{ item.user_id }}</td>
            <td>{{ item.book_id }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.book_name }}</td>
            <td>{{ item.author }}</td>
            <td>{{ formatDate(item.date_issued) }}</td>
            <td>{{ formatDate(item.return_date) }}</td>
            <td>
              <button class="btn btn-danger" @click="revokeBook(item.book_id, item.user_id)">
                <i class="fas fa-ban"></i> Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <h1 class="display-1">No Issued Books Currently</h1>
      <hr>
    </div>
  </div>
    `,
  data() {
    return {
      issuedBooks: [],
    };
  },
  mounted() {
    this.fetchIssuedBooks();
  },
  methods: {
    async fetchIssuedBooks() {
      try {
        const response = await fetch("/issued_books", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          this.issuedBooks = data.issuedBooks;
        } else {
          console.error(
            "Error fetching issued books:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching issued books:", error);
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    async revokeBook(bookId, userId) {
      try {
        const response = await fetch(`/revoke_book/${bookId}/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        if (response.ok) {
          alert("Book revoked successfully");
          this.fetchIssuedBooks(); // Refresh the list
        } else {
          const data = await response.json();
          console.error(
            "Error revoking book:",
            data.message || "Unknown error"
          );
          alert("Failed to revoke book.");
        }
      } catch (error) {
        console.error("Error revoking book:", error);
        alert("An error occurred while revoking the book.");
      }
    },
  },
};
