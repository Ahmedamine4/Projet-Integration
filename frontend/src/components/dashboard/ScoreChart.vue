<template>
  <div class="chart-container">
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

const props = defineProps({
  scores: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  // Create a reversed copy of the scores array
  const reversedScores = [...props.scores].reverse()

  return {
    labels: reversedScores.map(i => i.month),
    datasets: [
      {
        label: 'Score',
        data: reversedScores.map(i => i.score),
        borderColor: '#ec6c0f',
        backgroundColor: 'rgba(66,184,131,.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
}
</script>

<style scoped>
.chart-container {
  padding: 20px;
  height: 320px;
}
</style>