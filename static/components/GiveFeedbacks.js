export default {
  template: `
      <div>
        <h1 class="display-1">Give Feedback</h1>
        <form @submit.prevent="submitFeedback" class="form">
          <div class="form-group">
            <textarea v-model="feedback" rows="5" cols="63" maxlength="100" placeholder="Enter your feedback here"></textarea>
          </div>
          <div class="form-group">
            <label>Rating:</label>
            <div class="rating">
              <button v-for="n in 5" :key="n" @click="setRating(n)" :class="{'selected': rating >= n}" type="button" class="rating-btn">
                {{ n }}
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-success" style="margin-top: 10px">
            <i class="fas fa-check"></i> Submit
          </button>
        </form>
      </div>
    `,
  data() {
    return {
      feedback: "",
      rating: null,
      bookId: null,
    };
  },
  async mounted() {
    await this.fetchBookId();
  },
  methods: {
    async fetchBookId() {
      try {
        const response = await fetch(
          `/give_feedbacks_data/${this.$route.params.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          this.bookId = data.book_id;
        } else {
          console.error(
            "Error fetching book ID:",
            response.status,
            response.statusText
          );
          alert("Failed to fetch book ID.");
        }
      } catch (error) {
        console.error("Error fetching book ID:", error);
        alert("An error occurred while fetching book ID.");
      }
    },
    setRating(n) {
      this.rating = n;
    },
    async submitFeedback() {
      try {
        const response = await fetch(`/give_feedbacks_post/${this.bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            feedback: this.feedback,
            rating: this.rating,
          }),
        });

        if (response.ok) {
          alert("Feedback submitted successfully");
          this.feedback = ""; // Clear the feedback field
          this.rating = null; // Clear the rating
        } else {
          const data = await response.json();
          console.error(
            "Error submitting feedback:",
            data.message || "Unknown error"
          );
          alert("Failed to submit feedback.");
        }
      } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("An error occurred while submitting the feedback.");
      }
    },
  },
};
