import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function ProfessionalsScreen({ navigation, route }) {
  const category = route?.params?.category;
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const query = category ? `?category=${encodeURIComponent(category)}` : '';
        const response = await api.get(`/professionals${query}`);
        setProfessionals(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, [category]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Buscando profissionais...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category ? `Profissionais em ${category}` : 'Profissionais disponíveis'}</Text>

      <FlatList
        data={professionals}
        keyExtractor={(item, index) => item._id || `${item.userId?._id || 'professional'}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const professionalName = item.userId?.name || item.name || 'Profissional';
          const profileImage = item.userId?.profileImage || item.profileImage;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProfessionalProfile', { id: item._id })}
            >
              <Image
                source={{ uri: profileImage || 'https://via.placeholder.com/60' }}
                style={styles.avatar}
              />
              <View style={styles.infoBlock}>
                <Text style={styles.name}>{professionalName}</Text>
                <Text numberOfLines={2} style={styles.metaText}>
                  {(item.services || []).slice(0, 3).join(' • ') || 'Serviços gerais'}
                </Text>
                <Text style={styles.metaText}>⭐ {item.ratingAverage?.toFixed?.(1) || 'Novo'} · {item.city || 'Cidade não informada'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum profissional encontrado</Text>
            <Text style={styles.emptySubtitle}>Tente outra categoria ou volte mais tarde.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F9FC' },
  loadingText: { marginTop: 12, color: '#4B5563' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 14 },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E5E7EB', marginRight: 12 },
  infoBlock: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  metaText: { color: '#6B7280', fontSize: 13 },
  emptyContainer: { marginTop: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: { color: '#6B7280', marginTop: 6 },
});
