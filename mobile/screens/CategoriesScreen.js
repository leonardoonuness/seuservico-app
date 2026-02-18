import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';

const fallbackCategories = {
  Limpeza: ['Faxina residencial', 'Limpeza pós-obra'],
  Elétrica: ['Instalação elétrica', 'Troca de disjuntor'],
  Hidráulica: ['Reparo de vazamentos', 'Desentupimento'],
  Reformas: ['Pintura', 'Gesso', 'Pequenos reparos'],
};

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data || fallbackCategories);
      } catch (error) {
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const categoryList = useMemo(
    () => Object.entries(categories).map(([name, services]) => ({ name, services })),
    [categories]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha uma categoria</Text>
      <FlatList
        data={categoryList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Professionals', {
                category: item.name,
              })
            }
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.services.slice(0, 2).join(' • ')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma categoria disponível no momento.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F9FC' },
  loadingText: { marginTop: 12, color: '#4B5563' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#6B7280' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 24 },
});
