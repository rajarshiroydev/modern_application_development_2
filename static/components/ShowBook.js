export default {
  template: `
      <div>
        <h1>{{ book.name }}</h1>
        <h2>by {{ book.author }}</h2>
        <div v-html="book.content"></div>
      </div>
    `,
  data() {
    return {
      book: {
        name: "",
        content: "",
        author: "",
      },
    };
  },
  methods: {
    async fetch_book() {
      try {
        const url = window.location.origin;
        const response = await fetch(
          `${url}/api/book/${this.$route.params.id}/show`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          this.book = data.book;
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to fetch book data.");
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
        alert("An error occurred while fetching the book data.");
      }
    },
  },
  created() {
    this.fetch_book();
  },
};
