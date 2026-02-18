import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const StatCard = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProfessionalDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Profissional</Text>
      <Text style={styles.subtitle}>Resumo rápido da sua operação.</Text>

      <View style={styles.statsGrid}>
        <StatCard label="Solicitações abertas" value="0" />
        <StatCard label="Atendimentos concluídos" value="0" />
        <StatCard label="Avaliação média" value="-" />
        <StatCard label="Mensagens não lidas" value="0" />
      </View>

      <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Chat')}>
        <Text style={styles.ctaText}>Ir para Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.cta, styles.ctaSecondary]} onPress={() => navigation.navigate('Perfil')}>
        <Text style={[styles.ctaText, styles.ctaSecondaryText]}>Editar meu perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 6, marginBottom: 16, color: '#6B7280' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statLabel: { marginTop: 4, color: '#6B7280' },
  cta: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ctaSecondary: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  ctaSecondaryText: { color: '#3730A3' },
});
