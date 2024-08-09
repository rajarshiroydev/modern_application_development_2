export default {
  template: `  <div>
    <h1>Librarian Dashboard</h1>
    <div>
      <h2>Statistics</h2>
      <div>
        <canvas id="myChart"></canvas>
      </div>
    </div>
  </div>`,
  name: "Dashboard",
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const response = await fetch("/admin/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.renderChart(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
    renderChart(data) {
      const ctx = document.getElementById("myChart").getContext("2d");
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Active Users",
            "Grant Requests",
            "Issued Books",
            "Revoked Books",
          ],
          datasets: [
            {
              label: "Library Statistics",
              data: [
                data.active_users,
                data.grant_requests,
                data.issued_books,
                data.revoked_books,
              ],
              backgroundColor: [
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 99, 132, 0.2)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                },
              },
            },
          },
        },
      });
    },
  },
};
