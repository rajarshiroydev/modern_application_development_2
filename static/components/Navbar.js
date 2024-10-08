export default {
  template: `
    <nav style="background-color: #f8f9fa; padding: 10px 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 10px;">
    <router-link to="/" v-if="!isLoggedIn" style="font-size: 20px; color: black; margin-right: 20px;">Home</router-link>
    <router-link to="/login" v-if="!isLoggedIn" style="font-size: 20px; color: black; margin-right: 20px;">Login</router-link>
    <router-link to="/register" v-if="!isLoggedIn" style="font-size: 20px; color: black; margin-right: 20px;">Register</router-link>

    <!-- Admin links -->
    <template v-if="isAdmin">
      <router-link to="/adminhome" style="font-size: 20px; color: black; margin-right: 20px;">Admin Home</router-link>
      <router-link to="/user_feedbacks" style="font-size: 20px; color: black; margin-right: 20px;">Feedbacks</router-link>
      <router-link to="/issued_books" style="font-size: 20px; color: black; margin-right: 20px;">Issued</router-link>
      <router-link to="/requests" style="font-size: 20px; color: black; margin-right: 20px;">Requests</router-link>
      <router-link to="/admin/dashboard" style="font-size: 20px; color: black; margin-right: 20px;">Statistics</router-link>
    </template>

    <!-- User links -->
    <template v-if="isUser">
      <router-link to="/userhome" style="font-size: 20px; color: black; margin-right: 20px;">User Home</router-link>
      <router-link to="/profile" style="font-size: 20px; color: black; margin-right: 20px;">Profile</router-link>
      <router-link to="/issued_books_user" style="font-size: 20px; color: black; margin-right: 20px;">Library</router-link>
    </template>

    <!-- Logout link -->
    <a href="#" @click.prevent="logout" v-if="isLoggedIn" style="font-size: 20px; color: black;">Logout</a>

    <template v-if="isUser">
      <button @click="trigger_export" class="btn btn-primary" style="font-size: 20px; margin-left: 20px;">Export My Data</button>
    </template>

  </nav>
  `,
  data() {
    return {
      accessToken: sessionStorage.getItem("access_token"),
      role: sessionStorage.getItem("role"),
    };
  },
  computed: {
    isLoggedIn() {
      return !!this.accessToken;
    },
    isAdmin() {
      return this.role === "admin";
    },
    isUser() {
      return this.role === "user";
    },
  },
  methods: {
    async logout() {
      const url = window.location.origin;
      try {
        const response = await fetch(`${url}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
        });

        if (response.ok) {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("role");
          this.accessToken = null;
          this.role = null;
          this.$router.push("/login");
        } else {
          console.error("Logout failed", response.statusText);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    },
    async trigger_export() {
      try {
        const url = `${window.location.origin}/trigger_export`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          alert(data.message);
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("An error occurred:", error);
        this.$router.push("/userhome");
      }
    },
    watch: {
      // Watch for changes in session storage
      accessToken(newValue) {
        this.role = newValue ? sessionStorage.getItem("role") : null;
      },
      role() {
        // Force re-rendering to update navbar
        this.$forceUpdate();
      },
    },
    created() {
      // Initialize role on creation
      this.role = sessionStorage.getItem("role");
    },
  },
};
