export default {
  template: `<div>
            <h1>Register</h1>
            <form class="form">
              <div class="form-group">
                <label for="name" class="form-label">Name</label>
                <input v-model="name" type="text" id="name" name="name" class="form-control">
              </div>
              <div class="form-group">
                <label for="username" class="form-label">Username</label>
                <input v-model="username" type="text" id="username" name="username" class="form-control">
              </div>
              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input v-model="password" type="password" id="password" name="password" class="form-control">
              </div>
              <div class="form-group">
                <label for="confirm_password" class="form-label">Confirm Password</label>
                <input v-model="confirm_password" type="password" id="confirm_password" name="confirm_password" class="form-control">
              </div>
              <div class="form-group">
                <button type="button" class="btn btn-primary" @click="register_post">Register</button>
              </div>
            </form>
          </div>`,
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
      const url = window.location.origin;
      const res = await fetch(url + "/register", {
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
        console.log(data);
      }
    },
  },
};
