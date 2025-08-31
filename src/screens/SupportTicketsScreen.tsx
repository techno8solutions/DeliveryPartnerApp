// screens/SupportTicketsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSupportTicket, getSupportTickets } from '~/utils/api';

const SupportTicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useSelector((state) => state.auth);
  //   const { token } = useSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await getSupportTickets(userData.user.id);
      if (response.success) {
        setTickets(response.tickets || []);
      }
    } catch (error) {
      console.error('Fetch tickets error:', error);
      Alert.alert('Error', 'Failed to load support tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      Alert.alert('Error', 'Please fill in both subject and description');
      return;
    }

    setCreating(true);
    try {
      const response = await createSupportTicket({
        partner_id: userData.user.id,
        subject: newTicket.subject.trim(),
        description: newTicket.description.trim(),
      });

      if (response.success) {
        Alert.alert('Success', 'Support ticket created successfully!');
        setNewTicket({ subject: '', description: '' });
        setShowCreateForm(false);
        fetchTickets(); // Refresh the list
      } else {
        Alert.alert('Error', response.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Create ticket error:', error);
      Alert.alert('Error', 'Failed to create support ticket');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return 'time-outline';
      case 'in_progress':
        return 'construct-outline';
      case 'resolved':
        return 'checkmark-done-outline';
      case 'closed':
        return 'lock-closed-outline';
      default:
        return 'help-outline';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTicket = ({ item }) => (
    <View className="mb-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="mr-2 flex-1 text-lg font-semibold text-gray-900">{item.subject}</Text>
        <View
          className={`flex-row items-center rounded-full px-3 py-1 ${getStatusColor(item.status)}`}>
          <Ionicons name={getStatusIcon(item.status)} size={14} className="mr-1" />
          <Text className="text-xs font-medium capitalize">{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text className="mb-3 text-sm text-gray-600" numberOfLines={3}>
        {item.description}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">{formatDate(item.created_at)}</Text>
        <Text className="text-xs capitalize text-gray-500">Priority: {item.priority}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-3 text-gray-600">Loading tickets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">Support Center</Text>
        <Text className="text-gray-600">Get help from our support team</Text>
      </View>

      {/* Create New Ticket Button */}
      {!showCreateForm && (
        <TouchableOpacity
          className="mx-4 my-4 flex-row items-center justify-center rounded-lg bg-indigo-600 py-3"
          onPress={() => setShowCreateForm(true)}>
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="ml-2 font-semibold text-white">Create New Ticket</Text>
        </TouchableOpacity>
      )}

      {/* Create Ticket Form */}
      {showCreateForm && (
        <View className="mx-4 my-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <Text className="mb-3 text-lg font-semibold">Create Support Ticket</Text>

          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Subject</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              placeholder="Brief description of your issue"
              value={newTicket.subject}
              onChangeText={(text) => setNewTicket({ ...newTicket, subject: text })}
              maxLength={100}
            />
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Description</Text>
            <TextInput
              className="text-align-top h-24 rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              placeholder="Please describe your issue in detail..."
              value={newTicket.description}
              onChangeText={(text) => setNewTicket({ ...newTicket, description: text })}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 rounded-lg bg-gray-100 py-2"
              onPress={() => {
                setShowCreateForm(false);
                setNewTicket({ subject: '', description: '' });
              }}
              disabled={creating}>
              <Text className="text-center text-gray-700">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg bg-indigo-600 py-2"
              onPress={handleCreateTicket}
              disabled={creating}>
              {creating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white">Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tickets List */}
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-center text-lg text-gray-500">No support tickets yet</Text>
            <Text className="mt-2 px-8 text-center text-gray-400">
              {showCreateForm
                ? 'Fill out the form above to create your first ticket'
                : 'Press the button below to create your first support ticket'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          tickets.length > 0 && (
            <Text className="mb-3 text-gray-600">Your support tickets ({tickets.length})</Text>
          )
        }
      />
    </SafeAreaView>
  );
};

export default SupportTicketsScreen;
