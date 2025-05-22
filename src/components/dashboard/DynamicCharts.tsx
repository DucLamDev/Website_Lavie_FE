'use client'

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export type ChartData = {
  ordersByDay: {
    labels: string[];
    data: number[];
  };
  revenueByProduct: {
    labels: string[];
    data: number[];
  };
}

const DynamicCharts = ({ chartData }: { chartData: ChartData }) => {
  // Bar chart data - Orders by day
  const orderData = {
    labels: chartData.ordersByDay.labels,
    datasets: [
      {
        label: 'Đơn hàng',
        data: chartData.ordersByDay.data,
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
      }
    ]
  }
  
  // Generate colors for pie chart
  const generateColors = (count: number) => {
    const baseColors = [
      'rgba(14, 165, 233, 0.7)',  // Blue
      'rgba(6, 182, 212, 0.7)',    // Cyan
      'rgba(16, 185, 129, 0.7)',   // Green
      'rgba(249, 115, 22, 0.7)',   // Orange
      'rgba(236, 72, 153, 0.7)',   // Pink
      'rgba(139, 92, 246, 0.7)',   // Purple
    ];
    
    const borderColors = [
      'rgba(14, 165, 233, 1)',
      'rgba(6, 182, 212, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(249, 115, 22, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(139, 92, 246, 1)',
    ];
    
    const bgColors = [];
    const bdColors = [];
    
    for (let i = 0; i < count; i++) {
      bgColors.push(baseColors[i % baseColors.length]);
      bdColors.push(borderColors[i % borderColors.length]);
    }
    
    return { bgColors, bdColors };
  };
  
  const { bgColors, bdColors } = generateColors(chartData.revenueByProduct.labels.length);
  
  // Pie chart data - Revenue by product
  const revenueData = {
    labels: chartData.revenueByProduct.labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: chartData.revenueByProduct.data,
        backgroundColor: bgColors,
        borderColor: bdColors,
        borderWidth: 1,
      }
    ]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Đơn hàng trong tuần</h2>
        <div className="h-80">
          <Bar
            data={orderData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
            }}
          />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Doanh thu theo sản phẩm</h2>
        <div className="h-80">
          <Pie
            data={revenueData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default DynamicCharts
