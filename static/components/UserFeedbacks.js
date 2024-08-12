export default {
  template: `
    <div>
  <div v-if="feedbacks.length === 0">
    <h1 style="font-size: 4rem;">Be the first to give a feedback</h1>
    <hr>
  </div>
  <div v-else>
    <h1 style="font-size: 4rem;">User Feedbacks</h1>
    <hr>
    <div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">
      <div v-for="feedback in feedbacks" :key="feedback.id" style="width: 18rem; margin-right: 20px; margin-bottom: 20px; padding: 10px; border: 1px solid #dee2e6; border-radius: 10px; background-color: #f8f9fa;">
        <div style="margin: 10px;">
          <div><strong>Bookname:</strong> {{ feedback.book_name }}</div>
          <div><strong>Username:</strong> {{ feedback.username }}</div>
          <div><strong>Date:</strong> {{ formatDate(feedback.date_of_feedback) }}</div>
          <div><strong>Feedback:</strong> {{ feedback.feedback }}</div>
          <div><strong>Rating:</strong> {{ feedback.rating }}</div>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  data() {
    return {
      feedbacks: [],
    };
  },
  mounted() {
    this.fetchFeedbacks();
  },
  methods: {
    async fetchFeedbacks() {
      console.log("Fetching feedbacks...");
      try {
        const response = await fetch(`/user_feedbacks`, {
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
