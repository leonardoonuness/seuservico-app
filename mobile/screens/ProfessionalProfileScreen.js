import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rating } from 'react-native-ratings';
import { Calendar } from 'react-native-calendars';

const ProfessionalProfileScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [serviceDetails, setServiceDetails] = useState({
    service: '',
    description: '',
    address: '',
    scheduledDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionalProfile();
  }, [id]);

  const loadProfessionalProfile = async () => {
    try {
      const response = await api.get(`/professionals/${id}`);
      setProfessional(response.data.professional);
      setReviews(response.data.reviews);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (!professional) return;
    
    // Verificar se o profissional está disponível
    if (!professional.isVerified) {
      Alert.alert('Indisponível', 'Este profissional ainda não foi verificado pela nossa equipe.');
      return;
    }

    setShowBookingModal(true);
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    try {
      // Em implementação real, criaria um chat
      Alert.alert('Mensagem enviada', 'O profissional será notificado e entrará em contato em breve.');
      setShowContactModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem');
    }
  };

  const handleSubmitBooking = async () => {
    if (!serviceDetails.service || !serviceDetails.address) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const userData = JSON.parse(await AsyncStorage.getItem('user'));
      
      const bookingData = {
        clientId: userData._id,
        professionalId: professional.userId._id,
        service: serviceDetails.service,
        description: serviceDetails.description,
        location: {
          address: serviceDetails.address,
          city: userData.city,
        },
        scheduledDate: serviceDetails.scheduledDate,
      };

      await api.post('/service-requests', bookingData);
      
      Alert.alert(
        'Solicitação enviada!',
        'O profissional será notificado e entrará em contato para confirmar os detalhes.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a solicitação');
    } finally {
      setLoading(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.clientId?.name || 'Cliente'}</Text>
        <View style={styles.reviewRating}>
          <Rating
            type="star"
            ratingCount={5}
            imageSize={16}
            readonly
            startingValue={item.rating}
            style={styles.ratingStars}
          />
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!professional) {
    return (
      <View style={styles.errorContainer}>
        <Text>Profissional não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image
          source={{ uri: professional.userId?.profileImage || 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{professional.userId?.name}</Text>
          <Text style={styles.profession}>
            {professional.services?.[0] || 'Profissional'}
          </Text>
          <Text style={styles.city}>{professional.userId?.city}</Text>
          
          <View style={styles.ratingContainer}>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={20}
              readonly
              startingValue={professional.rating || 5}
              style={styles.rating}
            />
            <Text style={styles.ratingText}>
              {professional.rating?.toFixed(1) || '5.0'} ({professional.totalRatings || 0} avaliações)
            </Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesContainer}>
        {professional.isVerified && (
          <View style={[styles.badge, styles.verifiedBadge]}>
            <Text style={styles.badgeText}>✓ Verificado</Text>
          </View>
        )}
        {professional.isPremium && (
          <View style={[styles.badge, styles.premiumBadge]}>
            <Text style={styles.badgeText}>⭐ Premium</Text>
          </View>
        )}
      </View>

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleBookService}>
          <Text style={styles.primaryButtonText}>Contratar Serviço</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleContact}>
          <Text style={styles.secondaryButtonText}>Enviar Mensagem</Text>
        </TouchableOpacity>
      </View>

      {/* Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <Text style={styles.bio}>
          {professional.bio || 'Nenhuma informação disponível.'}
        </Text>
        
        {professional.experience && (
          <>
            <Text style={styles.sectionSubtitle}>Experiência</Text>
            <Text style={styles.experience}>{professional.experience}</Text>
          </>
        )}
      </View>

      {/* Serviços */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
        <View style={styles.servicesGrid}>
          {professional.services?.slice(0, 6).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
          {professional.services?.length > 6 && (
            <Text style={styles.moreServices}>+{professional.services.length - 6} mais</Text>
          )}
        </View>
      </View>

      {/* Portfólio */}
      {professional.portfolio?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfólio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {professional.portfolio.map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={styles.portfolioImage}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Avaliações */}
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllReviews}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>Nenhuma avaliação ainda</Text>
        ) : (
          <FlatList
            data={reviews.slice(0, 3)}
            renderItem={renderReview}
            keyExtractor={(item, index) => item._id || index.toString()}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Modal de Contratação */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contratar Serviço</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Qual serviço você precisa? *"
              value={serviceDetails.service}
              onChangeText={(text) => setServiceDetails({...serviceDetails, service: text})}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Descreva o que precisa (opcional)"
              value={serviceDetails.description}
              onChangeText={(text) => setServiceDetails({...serviceDetails, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Endereço do serviço *"
              value={serviceDetails.address}
              onChangeText={(text) => setServiceDetails({...serviceDetails, address: text})}
            />
            
            <Text style={styles.modalLabel}>Data preferencial</Text>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setServiceDetails({...serviceDetails, scheduledDate: new Date(day.dateString)});
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#4CAF50' }
              }}
              theme={{
                selectedDayBackgroundColor: '#4CAF50',
                todayTextColor: '#4CAF50',
                arrowColor: '#4CAF50',
              }}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmitBooking}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Contato */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enviar Mensagem</Text>
            
            <Text style={styles.contactInfo}>
              Você vai enviar uma mensagem para {professional.userId?.name}
            </Text>
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Digite sua mensagem..."
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowContactModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSendMessage}
              >
                <Text style={styles.confirmButtonText}>Enviar Mensagem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profession: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  city: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  experience: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  serviceTagText: {
    fontSize: 14,
    color: '#333',
  },
  moreServices: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  portfolioImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllReviews: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  noReviews: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ratingStars: {
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ProfessionalProfileScreen;
