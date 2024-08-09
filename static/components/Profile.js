export default {
  template: `
  <div>
    <h1 class="display-1">
      <span class="text-muted">{{ user.username }}'s</span>
      Profile
    </h1>

    <form @submit.prevent="updateProfile" class="form">
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input v-model="form.name" type="text" id="name" class="form-control" placeholder="Name">
      </div>
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <input v-model="form.username" type="text" id="username" class="form-control" placeholder="Username">
      </div>
      <div class="form-group">
        <label for="cpassword" class="form-label">Current Password</label>
        <input v-model="form.cpassword" type="password" id="cpassword" class="form-control">
      </div>
      <div class="form-group">
        <label for="password" class="form-label">New Password</label>
        <input v-model="form.password" type="password" id="password" class="form-control">
      </div>
      <div class="form-group">
        <input type="submit" value="Update" class="btn btn-primary">
      </div>
    </form>
  </div>`,
  data() {
    return {
      user: {
        username: "",
        name: "",
      },
      form: {
        name: "",
        username: "",
        cpassword: "",
        password: "",
      },
    };
  },
  created() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await fetch("/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        const responseBody = await response.text(); // Use text() to log raw response
        console.log("Response body:", responseBody);

        if (!response.ok) {
          throw new Error(
            `Network response was not ok. Status: ${response.status}, Body: ${responseBody}`
          );
        }

        const data = JSON.parse(responseBody); // Use JSON.parse if needed
        this.user = data;
        this.form.name = this.user.name;
        this.form.username = this.user.username;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        alert(
          "Error fetching user profile. Check the console for more details."
        );
      }
    },
    async updateProfile() {
      try {
        const response = await fetch("/profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });
        if (!response.ok) throw new Error("Network response was not ok.");
        const result = await response.json();
        alert(result.message || "Profile updated successfully");
        this.fetchUserProfile();
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile");
      }
    },
  },
};
