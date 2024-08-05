export default {
  template: `
    <div>
      <h1>Register</h1>
      <form class="form" @submit.prevent="register_post">
        <div class="form-group">
          <label for="name" class="form-label">Name</label>
          <input v-model="name" type="text" id="name" name="name" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input v-model="username" type="text" id="username" name="username" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" type="password" id="password" name="password" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="confirm_password" class="form-label">Confirm Password</label>
          <input v-model="confirm_password" type="password" id="confirm_password" name="confirm_password" class="form-control" required>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Register</button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      name: "",
      username: "",
      password: "",
      confirm_password: "",
    };
  },
  methods: {
    async register_post() {
      // Basic validation
      if (!this.name || !this.username || !this.password || !this.confirm_password) {
        alert("Please fill out all fields.");
        return;
      }

      if (this.password !== this.confirm_password) {
        alert("Passwords do not match.");
        return;
      }

      try {
        const url = window.location.origin;
        const res = await fetch(`${url}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.name,
            username: this.username,
            password: this.password,
            confirm_password: this.confirm_password,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          console.log(data);
          this.$router.push("/login");
        } else {
          // Display server-side validation or error messages
          alert(data.error || "Registration failed. Please try again.");
          console.error(data);
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("An error occurred during registration. Please try again.");
      }
    },
  },
};
