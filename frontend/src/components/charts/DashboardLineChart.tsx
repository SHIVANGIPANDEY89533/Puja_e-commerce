import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function DashboardLineChart() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <LineChart
      data={{
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [12000, 45000, 28000, 80000, 99000, 43000, 50000] }]
      }}
      width={width > 600 ? width - 320 : width - 72}
      height={220}
      yAxisLabel="₹"
      yAxisSuffix="k"
      yAxisInterval={1}
      chartConfig={{
        backgroundColor: colors.backgroundElement,
        backgroundGradientFrom: colors.backgroundElement,
        backgroundGradientTo: colors.backgroundElement,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1,3),16)}, ${parseInt(colors.primary.slice(3,5),16)}, ${parseInt(colors.primary.slice(5,7),16)}, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        style: { borderRadius: 16 },
        propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary }
      }}
      bezier
      style={{ borderRadius: 16 }}
      formatYLabel={(val) => (parseInt(val) / 1000).toString()}
    />
  );
}
