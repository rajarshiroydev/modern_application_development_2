export default {
  template: `<div>
          <h1>Login</h1>
          <form class="form">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input v-model="username" type="text" id="username" name="username" class="form-control">
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input v-model="password" type="password" id="password" name="password" class="form-control">
            </div>
            <div class="form-group">
              <button type="button" class="btn btn-primary" @click="login_post">Login</button>
            </div>
          </form>
        </div>`,
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async login_post() {
      const url = window.location.origin;
      const response = await fetch(url + "/login", {
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
      if (response.ok) {
        console.log(data);
        this.$router.push("/");
      } else {
        console.log(data);
        this.$router.push("/register");
      }
    },
  },
};
