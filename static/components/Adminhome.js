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
                <button @click="showSection(section.id)" class="btn btn-primary">
                  <i class="fas fa-search"></i>
                  Show
                </button>
                <button @click="editSection(section.id)" class="btn btn-success">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button @click="deleteSection(section.id)" class="btn btn-danger">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>`,
};
