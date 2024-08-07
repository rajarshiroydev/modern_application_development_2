export default {
  template: `
    <div>
      <div v-if="feedbacks.length === 0">
        <h1 class="display-1">Be the first to give a feedback</h1>
        <hr>
      </div>
      <div v-else>
        <h1 class="display-1">User Feedbacks</h1>
        <hr>
        <div class="feedbacks-list">
          <div v-for="feedback in feedbacks" :key="feedback.id" class="feedbacks" style="width: 18rem; margin-right: 20px">
            <div class="feedback-body">
              <div><strong>Username:</strong> {{ feedback.username }}</div>
              <div><strong>Date:</strong> {{ formatDate(feedback.date_of_feedback) }}</div>
              <div><strong>Feedback:</strong> {{ feedback.feedback }}</div>
              <div v-if="isAdmin">
                <div><strong>Book Title:</strong> {{ feedback.book_name }}</div>
                <div><strong>Author:</strong> {{ feedback.author }}</div>
                <div><strong>User ID:</strong> {{ feedback.user_id }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      feedbacks: [], // Data will be populated from API
      // isAdmin: false, // Will be set based on user role
    };
  },
  mounted() {
    this.fetchFeedbacks();
  },
  methods: {
    async fetchFeedbacks() {
      const bookId = this.$route.params.bookId;
      try {
        const response = await fetch(`/show_feedbacks/${bookId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          this.feedbacks = data.feedbacks;
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
