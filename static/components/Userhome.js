export default {
  template: `
    <div>
      <div v-if="sections && sections.length > 0">
        <div style="display: flex; flex-direction: column; justify-content: left;">
          <div v-for="section in sections" :key="section.id">
            <h2 style="margin-top: 20px;">{{ section.name }}</h2>
            <div style="padding: 0; display: flex; flex-wrap: wrap; justify-content: left; margin-bottom: 20px;">
              <div v-for="book in section.books" :key="book.id">
                <div class="card" style="width: 18rem; margin-left: 0; margin-right: 20px">
                  <img :src="'https://picsum.photos/200/200'" class="card-img-top" :alt="book.name">
                  <div class="card-body">
                    <h5 class="card-title">{{ book.name }}</h5>
                    <div class="author">
                      <strong><i>by</i></strong> {{ book.author }}
                    </div>
                    <br>
                    <div>
                      <a :href="'/feedbacks/' + book.id" style="color: black;">
                        <i><u>User feedbacks</u></i>
                      </a>
                    </div>
                    <br>
                    <strong>Choose Duration in Days</strong>
                    <form @submit.prevent="request(book.id)">
                      <div class="input-group">
                        <input type="number" v-model.number="duration" id="duration" class="form-control" min="1" style="border-radius: 7px 7px 7px 7px;">
                      </div>
                      <input type="submit" value="Get Book" class="btn btn-success" style="margin-top: 10px;">
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <h1 class="display-1">No Books in Store Currently</h1>
        <hr>
      </div>
    </div>`,
  data() {
    return {
      sections: [],
      duration: 1,
    };
  },
  mounted() {
    this.fetchSections();
  },
  methods: {
    async fetchSections() {
      try {
        const response = await fetch("/api/sections", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          this.sections = data.sections;
        } else {
          console.error(
            "Error fetching sections:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    },
    async request(bookId) {
      try {
        const response = await fetch(`/requestBook/${bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ duration: this.duration }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Book requested successfully");
        } else {
          if (response.status === 403) {
            alert(data.error || "You cannot request for more than 5 books.");
          } else if (response.status === 404) {
            alert(data.error || "Book does not exist.");
          } else if (response.status === 400) {
            alert(data.error || "Invalid duration.");
          } else if (response.status === 409) {
            alert(
              data.error ||
                "You already have this book in your library or have requested it."
            );
          } else {
            console.error(
              "Error requesting for book:",
              data.message || "Unknown error"
            );
            alert("Failed to request book.");
          }
        }
      } catch (error) {
        console.error("Error requesting for book:", error);
        alert("An error occurred while requesting the book.");
      }
    },
  },
};
