export default {
  template: `
    <nav>
      <router-link to="/" v-if="!isLoggedIn">Home</router-link>
      <router-link to="/login" v-if="!isLoggedIn">Login</router-link>
      <router-link to="/register" v-if="!isLoggedIn">Register</router-link>
      <router-link to="/adminhome" v-if="isAdmin">Admin Home</router-link>
      <router-link to="/userhome" v-if="isUser">User Home</router-link>
      <a href="#" @click.prevent="logout" v-if="isLoggedIn">Logout</a>
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
    decodeToken(token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error("Failed to decode token:", error);
        return {};
      }
    },
    updateRoleFromToken(token) {
      if (token) {
        const decodedToken = this.decodeToken(token);
        this.role = decodedToken.role || null;
      } else {
        this.role = null;
      }
    },
  },
  created() {
    this.updateRoleFromToken(this.accessToken);
  },
  watch: {
    accessToken(newToken) {
      this.updateRoleFromToken(newToken);
    },
  },
};
