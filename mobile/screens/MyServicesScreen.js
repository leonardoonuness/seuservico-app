import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rating } from 'react-native-ratings';

const MyServicesScreen = ({ navigation, route }) => {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user, filter]);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsProfessional(parsedUser.type === 'professional');
    }
  };

  const loadServices = async () => {
    try {
      let endpoint = isProfessional 
        ? `/service-requests/professional/${user._id}`
        : `/service-requests/client/${user._id}`;
      
      if (filter !== 'all') {
        endpoint += `?status=${filter}`;
      }

      const response = await axios.get(endpoint);
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleServiceAction = async (serviceId, action) => {
    try {
      switch (action) {
        case 'accept':
          await axios.put(`/service-requests/${serviceId}/accept`);
          Alert.alert('Sucesso', 'Serviço aceito!');
          break;
        case 'reject':
          await axios.put(`/service-requests/${serviceId}/reject`);
          Alert.alert('Serviço recusado', 'O cliente foi notificado.');
          break;
        case 'start':
          await axios.put(`/service-requests/${serviceId}/start`);
          Alert.alert('Serviço iniciado', 'Bom trabalho!');
          break;
        case 'complete':
          await axios.put(`/service-requests/${serviceId}/complete`);
          Alert.alert('Serviço concluído', 'Ótimo trabalho!');
          break;
        case 'cancel':
          await axios.put(`/service-requests/${serviceId}/cancel`);
          Alert.alert('Serviço cancelado', 'O profissional foi notificado.');
          break;
        case 'rate':
          navigation.navigate('RateService', { serviceId });
          return;
      }
      
      loadServices(); // Recarregar lista
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível realizar a ação');
    }
  };

  const renderServiceItem = ({ item }) => {
    const getStatusColor = (status) => {
      const colors = {
        pending: '#FF9800',
        accepted: '#2196F3',
        in_progress: '#4CAF50',
        completed: '#9C27B0',
        cancelled: '#F44336',
      };
      return colors[status] || '#666';
    };

    const getStatusText = (status) => {
      const texts = {
        pending: 'Pendente',
        accepted: 'Aceito',
        in_progress: 'Em andamento',
        completed: 'Concluído',
        cancelled: 'Cancelado',
      };
      return texts[status] || status;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    };

    const formatPrice = (price) => {
      if (!price) return 'À combinar';
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    return (
      <TouchableOpacity 
        style={styles.serviceCard}
        onPress={() => navigation.navigate('ServiceDetails', { serviceId: item._id })}
      >
        <View style={styles.serviceHeader}>
          <View>
            <Text style={styles.serviceTitle}>{item.service}</Text>
            <Text style={styles.serviceDate}>
              {formatDate(item.scheduledDate || item.createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.serviceInfo}>
          {isProfessional ? (
            <Text style={styles.clientInfo}>
              Cliente: {item.clientId?.name || 'Não informado'}
            </Text>
          ) : (
            <Text style={styles.professionalInfo}>
              Profissional: {item.professionalId?.name || 'Não atribuído'}
            </Text>
          )}
          
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {item.description || 'Sem descrição'}
          </Text>
          
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.serviceLocation}>{item.location?.city}</Text>
          </View>
        </View>

        {/* Ações baseadas no status e tipo de usuário */}
        {renderServiceActions(item)}
      </TouchableOpacity>
    );
  };

  const renderServiceActions = (service) => {
    if (isProfessional) {
      switch (service.status) {
        case 'pending':
          return (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleServiceAction(service._id, 'accept')}
              >
                <Text style={styles.actionButtonText}>Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleServiceAction(service._id, 'reject')}
              >
                <Text style={styles.actionButtonText}>Recusar</Text>
              </TouchableOpacity>
            </View>
          );
        case 'accepted':
          return (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleServiceAction(service._id, 'start')}
              >
                <Text style={styles.actionButtonText}>Iniciar Serviço</Text>
              </TouchableOpacity>
            </View>
          );
        case 'in_progress':
          return (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleServiceAction(service._id, 'complete')}
              >
                <Text style={styles.actionButtonText}>Concluir Serviço</Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    } else {
      switch (service.status) {
        case 'pending':
          return (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleServiceAction(service._id, 'cancel')}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          );
        case 'completed' && !service.isRated:
          return (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rateButton]}
                onPress={() => handleServiceAction(service._id, 'rate')}
              >
                <Text style={styles.actionButtonText}>Avaliar Serviço</Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    }
  };

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'accepted', label: 'Aceitos' },
    { key: 'in_progress', label: 'Em Andamento' },
    { key: 'completed', label: 'Concluídos' },
    { key: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isProfessional ? 'Meus Serviços' : 'Histórico de Serviços'}
        </Text>
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filterItem) => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterButton,
              filter === filterItem.key && styles.filterButtonActive
            ]}
            onPress={() => setFilter(filterItem.key)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterItem.key && styles.filterButtonTextActive
            ]}>
              {filterItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Serviços */}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {isProfessional ? 'Nenhum serviço encontrado' : 'Nenhum histórico de serviços'}
            </Text>
            <Text style={styles.emptyText}>
              {isProfessional 
                ? 'Quando clientes solicitarem seus serviços, aparecerão aqui.'
                : 'Contrate seu primeiro serviço para começar.'
              }
            </Text>
            {!isProfessional && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.emptyButtonText}>Buscar Profissionais</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={services.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  serviceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  serviceDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceInfo: {
    marginBottom: 15,
  },
  clientInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  professionalInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  serviceLocation: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  completeButton: {
    backgroundColor: '#9C27B0',
  },
  cancelButton: {
    backgroundColor: '#FF9800',
  },
  rateButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyServicesScreen;