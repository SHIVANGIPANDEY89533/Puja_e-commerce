import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { userService, User } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';

export default function UserManagementScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setError('');
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (search) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (roleFilter !== 'All') {
      result = result.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
    }
    setFilteredUsers(result);
  }, [users, search, roleFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    const update = async () => {
      try {
        await userService.updateStatus(id, newStatus);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to update status');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to ${action} ${name}?`)) {
        update();
      }
    } else {
      Alert.alert('Confirm Action', `Are you sure you want to ${action} ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: update }
      ]);
    }
  };

  const handleToggleRole = async (id: string, currentRole: string, name: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    const actionText = newRole === 'admin' ? 'promote to Admin' : 'demote to Customer';
    
    const update = async () => {
      try {
        await userService.updateRole(id, newRole);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to update role');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to ${actionText} ${name}?`)) {
        update();
      }
    } else {
      Alert.alert('Confirm Action', `Are you sure you want to ${actionText} ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: update }
      ]);
    }
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
      <Text style={[styles.tableHeaderText, { flex: 2, color: colors.textSecondary }]}>Name</Text>
      <Text style={[styles.tableHeaderText, { flex: 2, color: colors.textSecondary }]}>Email</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Mobile</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Role</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Status</Text>
      <Text style={[styles.tableHeaderText, { width: 140, textAlign: 'center', color: colors.textSecondary }]}>Actions</Text>
    </View>
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.tableCell, { flex: 2, color: colors.text, fontWeight: '500' }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[styles.tableCell, { flex: 2, color: colors.textSecondary }]} numberOfLines={1}>{item.email}</Text>
      <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>{item.mobile}</Text>
      
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <View style={[styles.badge, { backgroundColor: item.role === 'admin' ? '#9B59B622' : '#3498DB22' }]}>
          <Text style={[styles.badgeText, { color: item.role === 'admin' ? '#8E44AD' : '#2980B9' }]}>
            {item.role.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <View style={[styles.badge, { backgroundColor: item.isActive ? '#2ECC7122' : '#E74C3C22' }]}>
          <Text style={[styles.badgeText, { color: item.isActive ? '#27AE60' : '#C0392B' }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionBtn, { borderColor: colors.border }]} 
          onPress={() => handleToggleRole(item._id, item.role, item.name)}
        >
          <Ionicons name="shield" size={14} color={item.role === 'admin' ? '#E67E22' : colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>{item.role === 'admin' ? 'Demote' : 'Promote'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { borderColor: colors.border }]} 
          onPress={() => handleToggleStatus(item._id, item.isActive, item.name)}
        >
          <Ionicons name={item.isActive ? "ban" : "checkmark-circle"} size={14} color={item.isActive ? '#E74C3C' : '#27AE60'} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>{item.isActive ? 'Disable' : 'Enable'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { backgroundColor: colors.background }]}>
        <View style={styles.toolbarLeft}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="Search users..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 300 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, marginRight: 8, fontSize: 12, fontWeight: 'bold' }}>ROLE:</Text>
              {['All', 'Customer', 'Admin', 'Delivery'].map(r => (
                <TouchableOpacity key={`role-${r}`} style={[styles.filterPill, { backgroundColor: roleFilter === r ? colors.primary : colors.backgroundElement, borderColor: colors.border }]} onPress={() => setRoleFilter(r)}>
                  <Text style={{ color: roleFilter === r ? '#fff' : colors.text, fontSize: 12 }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={[styles.tableContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 800 }}>
            {renderTableHeader()}
            
            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id}
                renderItem={renderUserItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40, paddingBottom: 40 }}>
                    {error ? error : 'No users found.'}
                  </Text>
                }
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  toolbarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 220,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 13,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 14,
    paddingRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButtons: { 
    width: 140, 
    flexDirection: 'row', 
    justifyContent: 'flex-start',
    gap: 8 
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600'
  }
});
