export default {
  template: `
      <div>
        <h1>Admin Dashboard</h1>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Section Name</th>
              <th>No of Books</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="section in sections" :key="section.id">
              <td class="font">{{ section.id }}</td>
              <td class="font">{{ section.name }}</td>
              <td class="font">{{ section.size }}</td>
              <td>
                <button @click="show_section(section.id)" class="btn btn-primary">
                  <i class="fas fa-search"></i>
                  Show
                </button>
                <button @click="edit_section(section.id)" class="btn btn-success">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button @click="delete_section(section.id)" class="btn btn-danger">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-success" @click="add_section">
          Add Section
        </button>
      </div>
      `,
  data() {
    return {
      sections: [],
    };
  },
  methods: {
    show_section() {
      this.$router.push(`/section/${id}/show`);
    },
    edit_section(id) {
      this.$router.push(`/section/${id}/edit`);
    },
    delete_section(id) {
      this.$router.push(`/section/${id}/delete`);
    },
    add_section() {
      this.$router.push("/section/add");
    },
    fetch_section() {
      fetch("/admin")
        .then((res) => res.json())
        .then((data) => {
          this.sections = data;
        });
    },
  },
  created() {
    this.fetch_section();
  },
};
