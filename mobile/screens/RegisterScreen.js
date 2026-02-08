import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Picker } from '@react-native-picker/picker';

const ProfessionalRegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    bio: '',
    experience: '',
    hourlyRate: '',
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para o portfólio.');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled && result.assets) {
        setPortfolioImages([...portfolioImages, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
      // Remover serviços da categoria desmarcada
      setSelectedServices(selectedServices.filter(service => 
        !categories[category].includes(service)
      ));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleServiceSelect = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.city)) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }
    if (step === 2 && selectedCategories.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma categoria');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Registrar usuário
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        type: 'professional',
      };

      const userResponse = await api.post('/auth/register', userData);
      
      // 2. Completar cadastro profissional
      const professionalData = {
        userId: userResponse.data.user._id,
        categories: selectedCategories,
        services: selectedServices,
        bio: formData.bio,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        portfolio: portfolioImages,
      };

      await api.post('/professionals/complete-profile', professionalData);
      
      Alert.alert(
        'Cadastro realizado!',
        'Seu cadastro foi enviado para análise. Você receberá um e-mail quando for aprovado.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informações Pessoais</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome completo *"
        value={formData.name}
        onChangeText={(text) => setFormData({...formData, name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="E-mail *"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha *"
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Telefone (WhatsApp) *"
        value={formData.phone}
        onChangeText={(text) => setFormData({...formData, phone: text})}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Cidade *"
        value={formData.city}
        onChangeText={(text) => setFormData({...formData, city: text})}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seus Serviços</Text>
      <Text style={styles.stepDescription}>Selecione as categorias em que você atua:</Text>
      
      <ScrollView style={styles.categoriesContainer}>
        {Object.keys(categories).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              selectedCategories.includes(category) && styles.categoryItemSelected
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategories.includes(category) && styles.categoryTextSelected
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategories.length > 0 && (
        <View style={styles.servicesSection}>
          <Text style={styles.servicesTitle}>Serviços específicos:</Text>
          {selectedCategories.map(category => (
            <View key={category} style={styles.serviceCategory}>
              <Text style={styles.serviceCategoryTitle}>{category}:</Text>
              <View style={styles.servicesGrid}>
                {categories[category]?.map(service => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.serviceItem,
                      selectedServices.includes(service) && styles.serviceItemSelected
                    ]}
                    onPress={() => handleServiceSelect(service)}
                  >
                    <Text style={[
                      styles.serviceText,
                      selectedServices.includes(service) && styles.serviceTextSelected
                    ]}>
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seu Perfil Profissional</Text>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Breve descrição sobre você (bio)"
        value={formData.bio}
        onChangeText={(text) => setFormData({...formData, bio: text})}
        multiline
        numberOfLines={4}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Experiência profissional"
        value={formData.experience}
        onChangeText={(text) => setFormData({...formData, experience: text})}
        multiline
        numberOfLines={3}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Valor hora (opcional)"
        value={formData.hourlyRate}
        onChangeText={(text) => setFormData({...formData, hourlyRate: text})}
        keyboardType="numeric"
      />
      
      <Text style={styles.sectionTitle}>Portfólio (Fotos do seu trabalho)</Text>
      <TouchableOpacity style={styles.addPhotoButton} onPress={handleImagePick}>
        <Text style={styles.addPhotoText}>+ Adicionar Foto</Text>
      </TouchableOpacity>
      
      <ScrollView horizontal style={styles.portfolioContainer}>
        {portfolioImages.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.portfolioImage} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro Profissional</Text>
          <Text style={styles.subtitle}>Passo {step} de 3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]} />
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.buttonsContainer}>
          {step > 1 && (
            <TouchableOpacity 
              style={[styles.button, styles.backButton]}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
          
          {step < 3 ? (
            <TouchableOpacity 
              style={[styles.button, styles.nextButton]}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>Próximo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Enviando...' : 'Finalizar Cadastro'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressStep: {
    width: 30,
    height: 6,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
    borderRadius: 3,
  },
  progressStepActive: {
    backgroundColor: '#4CAF50',
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
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
  categoriesContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  categoryItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryItemSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  servicesSection: {
    marginTop: 20,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  serviceCategory: {
    marginBottom: 20,
  },
  serviceCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  serviceItemSelected: {
    backgroundColor: '#2196F3',
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
  },
  serviceTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  addPhotoButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addPhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  portfolioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  portfolioImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#2196F3',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfessionalRegisterScreen;
