import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions, LogBox } from 'react-native';

LogBox.ignoreLogs(['Unknown event handler property `onPressIn`']);

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('monthly'); // daily, weekly, monthly, yearly

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/analytics?range=${range}`);
      setData(res.data);
    } catch (err) {
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    if (Platform.OS === 'web') {
      const header = 'Date,Sales,Orders\n';
      const rows = data.salesChartData.map((row: any) => `${row._id},${row.sales},${row.count}`).join('\n');
      const csv = header + rows;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${range}.csv`;
      a.click();
    } else {
      alert('CSV Export is only supported on web right now.');
    }
  };

  const RangeButton = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity 
      style={[
        styles.rangeBtn, 
        { 
          backgroundColor: range === value ? colors.primary : colors.backgroundElement,
          borderColor: range === value ? colors.primary : colors.border
        }
      ]}
      onPress={() => setRange(value)}
    >
      <Text style={{ color: range === value ? '#fff' : colors.text, fontSize: 13, fontWeight: '500' }}>{label}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={{ marginLeft: 16 }}>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ProtectedRoute adminOnly>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reports & Analytics</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.exportBtn, { borderColor: colors.border }]} onPress={handleExportCSV}>
              <Ionicons name="download-outline" size={18} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.text, fontWeight: '500' }}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rangeSelector}>
          <RangeButton label="Daily" value="daily" />
          <RangeButton label="Weekly" value="weekly" />
          <RangeButton label="Monthly" value="monthly" />
          <RangeButton label="Yearly" value="yearly" />
          <RangeButton label="All Time" value="all" />
        </View>

        {loading || !data ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.statsGrid}>
              <StatCard title="Total Revenue" value={`₹${data.summary.totalRevenue.toFixed(2)}`} icon="cash-outline" color="#2ECC71" />
              <StatCard title="Total Orders" value={data.summary.totalOrders} icon="cart-outline" color="#3498DB" />
              <StatCard title="Customers" value={data.summary.totalCustomers} icon="people-outline" color="#9B59B6" />
              <StatCard title="Total Products" value={data.summary.totalProducts} icon="cube-outline" color="#E67E22" />
              <StatCard title="Low Stock" value={data.summary.lowStockProducts} icon="alert-circle-outline" color="#E74C3C" />
            </View>

            <View style={styles.row}>
              {/* Sales Chart Data */}
              <View style={[styles.section, { flex: 2, marginRight: 16, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Sales Trend ({range})</Text>
                {data.salesChartData.length === 0 ? (
                  <Text style={{ color: colors.textSecondary, marginTop: 20 }}>No sales data for this period.</Text>
                ) : (
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
                )}
              </View>

              {/* Order Status Distribution */}
              <View style={[styles.section, { flex: 1, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Status</Text>
                {data.orderStatusDistribution.length === 0 ? (
                  <Text style={{ color: colors.textSecondary, marginTop: 20 }}>No orders in this period.</Text>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    {data.orderStatusDistribution.map((status: any) => (
                      <View key={status._id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ color: colors.text }}>{status._id}</Text>
                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{status.count}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Top Products */}
            <View style={[styles.section, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Selling Products</Text>
              {data.topProducts.length === 0 ? (
                <Text style={{ color: colors.textSecondary, marginTop: 20 }}>No product data for this period.</Text>
              ) : (
                <View style={styles.table}>
                  <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.tableCell, { flex: 2, color: colors.textSecondary, fontWeight: 'bold' }]}>Product</Text>
                    <Text style={[styles.tableCell, { color: colors.textSecondary, fontWeight: 'bold' }]}>Units Sold</Text>
                    <Text style={[styles.tableCell, { color: colors.textSecondary, fontWeight: 'bold' }]}>Revenue generated</Text>
                  </View>
                  {data.topProducts.map((prod: any, i: number) => (
                    <View key={i} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.tableCell, { flex: 2, color: colors.text }]} numberOfLines={1}>{prod.name}</Text>
                      <Text style={[styles.tableCell, { color: colors.text }]}>{prod.totalSold}</Text>
                      <Text style={[styles.tableCell, { color: colors.text, fontWeight: 'bold' }]}>₹{prod.revenue.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </ScrollView>
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  rangeSelector: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  rangeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 16 },
  statCard: { flex: 1, minWidth: 200, padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  statTitle: { fontSize: 13, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 16 },
  section: { padding: 20, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1 },
  tableCell: { flex: 1, fontSize: 14 },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: 60,
    marginRight: 12,
  },
  chartBarBg: {
    width: 24,
    height: 120,
    borderRadius: 12,
    justifyContent: 'flex-end',
    marginBottom: 8,
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 12,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});
