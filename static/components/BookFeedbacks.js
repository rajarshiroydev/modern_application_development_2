export default {
  template: `  <div>
    <div v-if="feedbacks.length === 0">
      <h1 style="font-size: 4rem;">No Feedbacks Yet</h1>
      <hr>
    </div>
    <div v-else>
      <h1 style="font-size: 4rem;">Feedbacks for "{{ bookName }}"</h1>
      <hr>
      <div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">
        <div v-for="feedback in feedbacks" :key="feedback.id" style="width: 18rem; margin-right: 20px; margin-bottom: 20px; padding: 10px; border: 1px solid #dee2e6; border-radius: 10px; background-color: #f8f9fa;">
          <div style="margin: 10px;">
            <div><strong>Username:</strong> {{ feedback.username }}</div>
            <div><strong>Date:</strong> {{ formatDate(feedback.date_of_feedback) }}</div>
            <div><strong>Feedback:</strong> {{ feedback.feedback }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  props: ["bookId"],
  data() {
    return {
      feedbacks: [],
      bookName: "", // Assuming you want to display the book name as well
    };
  },
  mounted() {
    this.fetchFeedbacks();
  },
  methods: {
    async fetchFeedbacks() {
      console.log("Fetching feedbacks...");
      try {
        const response = await fetch(`/book_feedbacks/${this.bookId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        console.log("Fetch response:", response);
        console.log("Fetch data:", data);
        if (response.ok) {
          this.feedbacks = data.feedbacks;
          // You might need to set bookName if it’s not being fetched from feedbacks
          if (this.feedbacks.length > 0) {
            this.bookName = this.feedbacks[0].book_name;
          }
          console.log("Feedbacks updated:", this.feedbacks);
        } else {
          console.error(
            "Error fetching feedbacks:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
