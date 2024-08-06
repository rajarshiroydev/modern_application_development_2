export default {
  template: `
  <div>
    <div v-if="sections && sections.length > 0">
      <div class="sections-list">
        <div v-for="section in sections" :key="section.id">
          <h2 style="margin-top: 20px;">{{ section.name }}</h2>
          <div class="books" style="margin-bottom: 20px;">
            <div v-for="book in section.books" :key="book.id">
              <div v-if="!param || 
                (param === 'book_name' && bookName.toLowerCase().includes(book.name.toLowerCase())) ||
                (param === 'author_name' && authorName.toLowerCase().includes(book.author.toLowerCase()))">
                
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
                    <strong>Choose Duration</strong>
                    <form @submit.prevent="addToCart(book.id)">
                      <div class="input-group">
                        <label for="duration" class="days">Days</label>
                        <input type="number" v-model.number="duration" id="duration" class="form-control" min="1" style="border-radius: 0px 7px 7px 0px;">
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
    </div>
    <div v-else>
      <h1 class="display-1">No Books in Store Currently</h1>
      <hr>
    </div>
  </div>
  `,
  data() {
    return {
      sections: [],
      param: "",
      bookName: "",
      authorName: "",
      duration: 1,
    };
  },
  mounted() {
    this.fetchSections();
  },
  methods: {
    async fetchSections() {
      try {
        const query = new URLSearchParams({
          parameter: this.param,
          query: this.bookName || this.authorName,
        }).toString();

        const response = await fetch(`/api/sections?${query}`);
        const data = await response.json();

        this.sections = data.sections;
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    },
    async addToCart(bookId) {
      try {
        await fetch(`/api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ book_id: bookId, duration: this.duration }),
        });
        alert("Book added to cart successfully");
      } catch (error) {
        console.error("Error adding book to cart:", error);
      }
    },
  },
  watch: {
    // Watch for changes in the search parameters and refetch data
    param: "fetchSections",
    bookName: "fetchSections",
    authorName: "fetchSections",
  },
};
