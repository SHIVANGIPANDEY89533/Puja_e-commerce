import React from 'react';
import { View, ScrollView } from 'react-native';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportsBarChart({ data }: { data: any }) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
      <View style={{ width: '100%', height: 240, minWidth: 600 }}>
        <Bar
          data={{
            labels: data.salesChartData.map((d: any) => d._id),
            datasets: [{ label: 'Sales', data: data.salesChartData.map((d: any) => d.sales), backgroundColor: colors.primary }]
          }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
        />
      </View>
    </ScrollView>
  );
}
