export default {
  template: `
    <div>
      <h1>Login</h1>
      <form class="form" @submit.prevent="login_post">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input v-model="username" type="text" id="username" name="username" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" type="password" id="password" name="password" class="form-control" required>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Login</button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async login_post() {
      try {
        const url = window.location.origin;
        const response = await fetch(`${url}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (response.status === 404) {
          alert(data.message || "User doesn't exist, register first");
          this.$router.push("/register");
        } else if (response.status === 401) {
          alert(data.message || "Incorrect password. Please try again.");
        } else if (response.ok && data.access_token) {
          sessionStorage.setItem("access_token", data.access_token);
          sessionStorage.setItem("role", data.role); // Store the role in sessionStorage
          if (data.role === "admin") {
            this.$router.push("/adminhome");
          } else {
            this.$router.push("/userhome");
          }
        } else {
          alert("Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred while logging in. Please try again.");
      }
    },
  },
};
