import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState({});
  const [featuredProfessionals, setFeaturedProfessionals] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, professionalsRes] = await Promise.all([
        axios.get('/categories'),
        axios.get('/professionals?isPremium=true&limit=5'),
      ]);
      
      setCategories(categoriesRes.data);
      setFeaturedProfessionals(professionalsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const renderCategoryCard = (categoryName, services) => (
    <TouchableOpacity
      key={categoryName}
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Professionals', { category: categoryName })}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{categoryName.charAt(0)}</Text>
      </View>
      <Text style={styles.categoryName}>{categoryName}</Text>
      <Text style={styles.categoryServices}>
        {services.slice(0, 3).join(' • ')}
        {services.length > 3 ? '...' : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SeuServiço</Text>
        <Text style={styles.headerSubtitle}>Encontre profissionais na sua cidade</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Buscar Serviço */}
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => navigation.navigate('Buscar')}
        >
          <Text style={styles.searchBoxText}>Buscar serviço...</Text>
        </TouchableOpacity>

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesGrid}>
            {Object.entries(categories).slice(0, 6).map(([name, services]) => 
              renderCategoryCard(name, services)
            )}
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Buscar')}
          >
            <Text style={styles.seeAllText}>Ver todas categorias</Text>
          </TouchableOpacity>
        </View>

        {/* Profissionais em Destaque */}
        {featuredProfessionals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profissionais em Destaque</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProfessionals.map((professional) => (
                <TouchableOpacity
                  key={professional._id}
                  style={styles.professionalCard}
                  onPress={() => navigation.navigate('ProfessionalProfile', { id: professional._id })}
                >
                  <Image
                    source={{ uri: professional.userId?.profileImage || 'https://via.placeholder.com/80' }}
                    style={styles.professionalImage}
                  />
                  <Text style={styles.professionalName}>
                    {professional.userId?.name}
                  </Text>
                  <Text style={styles.professionalService}>
                    {professional.services?.[0] || 'Profissional'}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {professional.rating?.toFixed(1) || '5.0'}</Text>
                  </View>
                  {professional.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>PREMIUM</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Como Funciona */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como Funciona</Text>
          <View style={styles.stepsContainer}>
            {[
              { title: 'Encontre', desc: 'Busque o profissional ideal' },
              { title: 'Contrate', desc: 'Combine todos os detalhes' },
              { title: 'Avalie', desc: 'Deixe sua avaliação' },
            ].map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBoxText: {
    color: '#999',
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  categoryServices: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  professionalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  professionalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  professionalService: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    width: '30%',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;