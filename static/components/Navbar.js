export default {
  template: `
    <nav style="background-color: #f8f9fa; padding: 10px 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <router-link to="/" v-if="!isLoggedIn" style="font-size: 20px; color: black; margin-right: 20px;">Home</router-link>
      <router-link to="/login" v-if="!isLoggedIn" style="font-size: 20px; color: black; margin-right: 20px;">Login</router-link>
      <router-link to="/register" v-if="!isLoggedIn" style="font-size: 20px; color: black; margin-right: 20px;">Register</router-link>
      <router-link to="/adminhome" v-if="isAdmin" style="font-size: 20px; color: black; margin-right: 20px;">Admin Home</router-link>
      <router-link to="/user_feedbacks" v-if="isAdmin" style="font-size: 20px; color: black; margin-right: 20px;">User Feedbacks</router-link>
      <router-link to="/issued_books" v-if="isAdmin" style="font-size: 20px; color: black; margin-right: 20px;">Issued</router-link>
      <router-link to="/requests" v-if="isAdmin" style="font-size: 20px; color: black; margin-right: 20px;">Requests</router-link>
      <router-link to="/userhome" v-if="isUser" style="font-size: 20px; color: black; margin-right: 20px;">User Home</router-link>
      <router-link to="/profile" v-if="isUser" style="font-size: 20px; color: black; margin-right: 20px;">Profile</router-link>
      <router-link to="/issued_books_user" v-if="isUser" style="font-size: 20px; color: black; margin-right: 20px;">Library</router-link>
      <a href="#" @click.prevent="logout" v-if="isLoggedIn" style="font-size: 20px; color: black;">Logout</a>
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
  },
};
