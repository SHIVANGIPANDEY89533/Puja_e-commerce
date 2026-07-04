import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import DashboardLineChart from '@/components/charts/DashboardLineChart';
import { LogBox } from 'react-native';
import { reportService } from '@/services/reportService';
import { orderService } from '@/services/orderService';

LogBox.ignoreLogs(['Unknown event handler property `onPressIn`']);

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const router = useRouter();

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name[0].toUpperCase();
  };

  const [stats, setStats] = useState<any>(null);
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, ordersData] = await Promise.all([
        reportService.getAnalytics('all'),
        orderService.getOrders()
      ]);
      setStats(analyticsData.summary);
      setLatestOrders(ordersData.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { id: '1', title: 'Total Revenue', value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : '...', icon: 'wallet', color: '#27AE60', bg: '#27AE60' + '15' },
    { id: '2', title: 'Total Orders', value: stats ? stats.totalOrders : '...', icon: 'cart', color: '#2980B9', bg: '#2980B9' + '15' },
    { id: '3', title: 'Active Users', value: stats ? stats.totalCustomers : '...', icon: 'people', color: '#8E44AD', bg: '#8E44AD' + '15' },
    { id: '4', title: 'Products', value: stats ? stats.totalProducts : '...', icon: 'cube', color: '#E67E22', bg: '#E67E22' + '15' },
  ];

  const quickActions = [
    { title: 'Products', icon: 'pricetag', route: '/(admin)/products', color: '#3498DB' },
    { title: 'Orders', icon: 'bus', route: '/(admin)/orders', color: '#E74C3C' },
    { title: 'Users', icon: 'person', route: '/(admin)/users', color: '#2ECC71' },
    { title: 'Categories', icon: 'grid', route: '/(admin)/categories', color: '#9B59B6' },
    { title: 'Tickets', icon: 'headset', route: '/(admin)/tickets', color: '#F1C40F' },
    { title: 'Reports', icon: 'bar-chart', route: '/(admin)/reports', color: '#1ABC9C' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Custom Header Area */}
      <View style={[styles.headerGradient, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Admin Dashboard</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back, {user?.name?.split(' ')[0]}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
        </View>
        <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Statistics Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Store Overview</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <View key={stat.id} style={[styles.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{stat.value}</Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Revenue Chart */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 32 }]}>Weekly Revenue Overview</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border, padding: 16, alignItems: 'center' }]}>
          <DashboardLineChart />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 32 }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Link href={action.route as any} asChild key={index}>
              <TouchableOpacity style={StyleSheet.flatten([styles.actionButton, { backgroundColor: colors.backgroundElement, borderColor: colors.border }])}>
                <View style={[styles.actionIconWrapper, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>{action.title}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 32 }]}>Recent Activity</Text>
        <View style={[styles.activityCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>Latest Orders</Text>
            <Link href="/(admin)/orders" asChild>
              <TouchableOpacity>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {latestOrders.length > 0 ? latestOrders.map((order: any, idx: number) => (
            <View key={order._id} style={[styles.activityItem, { borderBottomColor: colors.border, borderBottomWidth: idx === latestOrders.length - 1 ? 0 : 1 }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="cart-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityName, { color: colors.text }]}>
                  {order.userName} - #{order._id.substring(order._id.length - 6).toUpperCase()}
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.activityAmount, { color: colors.text }]}>₹{order.total}</Text>
            </View>
          )) : (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>No orders found.</Text>
          )}
        </View>

      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    }),
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerDivider: {
    height: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: Platform.OS === 'web' && width > 600 ? '23%' : '47%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
    }),
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  chartCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
    }),
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 10,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: '12%',
  },
  chartBarBg: {
    width: 14,
    height: 140,
    borderRadius: 7,
    justifyContent: 'flex-end',
    marginBottom: 12,
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    width: Platform.OS === 'web' && width > 600 ? '31%' : '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    }),
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  activityCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
    }),
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
