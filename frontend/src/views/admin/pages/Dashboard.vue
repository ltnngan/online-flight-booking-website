<!-- src/components/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- Toggle buttons for chart/table view -->
    <div class="toggle-container">
      <button 
        @click="viewMode = 'chart'" 
        class="toggle-btn"
        :class="{ active: viewMode === 'chart' }"
      >
        Biểu Đồ
      </button>
      <button 
        @click="viewMode = 'table'" 
        class="toggle-btn"
        :class="{ active: viewMode === 'table' }"
      >
        Bảng
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">Lỗi: {{ error }}</div>
    
    <!-- Chart View -->
    <div v-else-if="viewMode === 'chart'" class="chart-container">
      <div class="metric-selector">
        <select v-model="selectedMetric" class="metric-select">
          <option value="totalFlights">Số Chuyến Bay</option>
          <option value="totalTickets">Số Vé Bán</option>
          <option value="totalPassengers">Số Hành Khách</option>
          <option value="totalRevenue">Doanh Thu</option>
        </select>
      </div>
      
      <div class="chart-wrapper">
        <Bar 
          :data="chartData" 
          :options="chartOptions" 
        />
      </div>
    </div>
    
    <!-- Table View -->
    <div v-else class="table-container">
      <table class="statistics-table">
        <thead>
          <tr>
            <th>Tháng</th>
            <th>Số Chuyến Bay</th>
            <th>Số Vé Bán</th>
            <th>Số Hành Khách</th>
            <th>Doanh Thu (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in monthlyData" :key="item.month">
            <td>{{ item.month }}</td>
            <td>{{ item.totalFlights }}</td>
            <td>{{ item.totalTickets }}</td>
            <td>{{ item.totalPassengers }}</td>
            <td>{{ formatCurrency(item.totalRevenue) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import dashboardService from "../../../services/admin/dashboard.service";
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default {
  name: "Dashboard",
  components: {
    Bar
  },
  setup() {
    const monthlyData = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const viewMode = ref('chart');
    const selectedMetric = ref('totalFlights');

    const chartData = computed(() => {
      const labels = monthlyData.value.map(item => item.month);
      const dataValues = monthlyData.value.map(item => item[selectedMetric.value]);
      
      const backgroundColor = [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)'
      ];

      return {
        labels,
        datasets: [
          {
            label: getMetricLabel(selectedMetric.value),
            data: dataValues,
            backgroundColor
          }
        ]
      };
    });

    const chartOptions = computed(() => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                family: '"Lato", sans-serif',
                size: 14
              },
              color: '#334155'
            }
          },
          title: {
            display: true,
            text: getMetricLabel(selectedMetric.value),
            font: {
              family: '"Lato", sans-serif',
              size: 18
            },
            color: '#0f172a'
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#0f172a',
            bodyColor: '#334155',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (selectedMetric.value === 'totalRevenue') {
                  label += formatCurrency(context.raw);
                } else {
                  label += context.raw;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: '"Lato", sans-serif',
                size: 14
              },
              color: '#334155'
            },
            grid: {
              color: '#e2e8f0'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                family: '"Lato", sans-serif',
                size: 14
              },
              color: '#334155',
              callback: function(value) {
                if (selectedMetric.value === 'totalRevenue') {
                  return formatCurrencyShort(value);
                }
                return value;
              }
            },
            grid: {
              color: '#e2e8f0'
            }
          }
        }
      };
    });

    function getMetricLabel(metric) {
      const labels = {
        totalFlights: 'Số Chuyến Bay',
        totalTickets: 'Số Vé Bán',
        totalPassengers: 'Số Hành Khách',
        totalRevenue: 'Doanh Thu (VNĐ)'
      };
      return labels[metric] || metric;
    }

    function formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    }

    function formatCurrencyShort(value) {
      if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + ' tỷ';
      } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + ' tr';
      }
      return formatCurrency(value);
    }

    async function fetchStatistics() {
      try {
        loading.value = true;
        const data = await dashboardService.getMonthlyStatistics();
        monthlyData.value = data;
        loading.value = false;
      } catch (err) {
        error.value = err.message;
        loading.value = false;
      }
    }

    onMounted(() => {
      fetchStatistics();
    });

    return {
      monthlyData,
      loading,
      error,
      viewMode,
      selectedMetric,
      chartData,
      chartOptions,
      formatCurrency
    };
  }
};
</script>

<style scoped>
/* Container */
.dashboard-container {
  font-family: "Lato", sans-serif;
}

/* Toggle Buttons */
.toggle-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.toggle-btn {
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  font-weight: 500;
  border-radius: 0.8rem;
  background: #f1f5f9;
  color: #334155;
  border: 0.1rem solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #ffc107;
  color: #fff;
  border-color: #ffc107;
}

.toggle-btn:hover:not(.active) {
  background: #e2e8f0;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

/* Chart Container */
.chart-container {
  background: #fff;
  padding: 2rem;
  border-radius: 0.8rem;
  border: 0.1rem solid #e2e8f0;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.05);
}

.metric-selector {
  margin-bottom: 1.6rem;
}

.metric-select {
  width: 100%;
  max-width: 300px;
  padding: 0.8rem;
  border: 0.1rem solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  color: #334155;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.metric-select:focus {
  outline: none;
  border-color: #ffc107;
  box-shadow: 0 0 0.4rem rgba(255, 193, 7, 0.3);
}

.chart-wrapper {
  height: 400px;
}

/* Table Styling */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.statistics-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 0.1rem solid #e2e8f0;
}

.statistics-table th,
.statistics-table td {
  padding: 1.2rem 1.6rem;
  font-size: 1.4rem;
  color: #334155;
  border-bottom: 0.1rem solid #e2e8f0;
  text-align: center;
}

.statistics-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #0f172a;
}

.statistics-table tr:hover {
  background: #f8fafc;
}

/* Feedback Messages */
.loading {
  text-align: center;
  font-size: 1.6rem;
  color: #475569;
  padding: 2rem;
}

.error {
  color: #dc3545;
  font-size: 1.4rem;
  margin-top: 1.6rem;
  text-align: center;
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 0.6rem;
}

.success {
  color: #28a745;
  font-size: 1.4rem;
  margin-top: 1.6rem;
  text-align: center;
  background: rgba(40, 167, 69, 0.1);
  padding: 1rem;
  border-radius: 0.6rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1.6rem;
  }

  .toggle-container {
    flex-direction: column;
    gap: 0.8rem;
  }

  .toggle-btn {
    width: 100%;
    padding: 0.6rem;
    font-size: 1.3rem;
  }

  .chart-container {
    padding: 1.6rem;
  }

  .chart-wrapper {
    height: 300px;
  }

  .statistics-table th,
  .statistics-table td {
    padding: 1rem;
    font-size: 1.3rem;
  }

  .metric-select {
    max-width: 100%;
  }
}

/* Custom Scrollbar */
.table-container::-webkit-scrollbar {
  height: 0.8rem;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 1rem;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 1rem;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #ffc107;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dashboard-container {
  animation: fadeIn 0.5s ease;
}
</style>