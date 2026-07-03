import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ReportsBarChart({ data }: { data: any }) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
      <BarChart
        data={{
          labels: data.salesChartData.map((d: any) => d._id),
          datasets: [{ data: data.salesChartData.map((d: any) => d.sales) }]
        }}
        width={Math.max(width > 600 ? width - 500 : width - 70, data.salesChartData.length * 60)}
        height={240}
        yAxisLabel="₹"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: colors.backgroundElement,
          backgroundGradientFrom: colors.backgroundElement,
          backgroundGradientTo: colors.backgroundElement,
          decimalPlaces: 0,
          color: (opacity = 1) => colors.primary,
          labelColor: (opacity = 1) => colors.textSecondary,
          style: { borderRadius: 16 },
          barPercentage: 0.6,
        }}
        style={{ borderRadius: 16 }}
        showValuesOnTopOfBars
      />
    </ScrollView>
  );
}
