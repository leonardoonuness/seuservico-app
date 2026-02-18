import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.name || 'Não informado'}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email || 'Não informado'}</Text>

        <Text style={styles.label}>Telefone</Text>
        <Text style={styles.value}>{user?.phone || 'Não informado'}</Text>

        <Text style={styles.label}>Cidade</Text>
        <Text style={styles.value}>{user?.city || 'Não informada'}</Text>

        <Text style={styles.label}>Tipo de conta</Text>
        <Text style={styles.value}>{user?.type === 'professional' ? 'Profissional' : 'Cliente'}</Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadUser}>
        <Text style={styles.refreshButtonText}>Atualizar dados locais</Text>
      </TouchableOpacity>

      {typeof onLogout === 'function' && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert('Sair da conta', 'Deseja encerrar sua sessão?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: onLogout },
            ])
          }
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F9FC' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 14, color: '#111827' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  label: { fontSize: 12, color: '#6B7280', marginTop: 10 },
  value: { fontSize: 16, color: '#111827', fontWeight: '600', marginTop: 2 },
  refreshButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#fff', fontWeight: '700' },
});
