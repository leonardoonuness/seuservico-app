import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    totalServices: 0,
    pendingApprovals: 0,
    revenue: 0,
  });
  const [growthData, setGrowthData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Em produção, essas chamadas viriam do backend
      setStats({
        totalUsers: 1250,
        totalProfessionals: 320,
        totalServices: 2450,
        pendingApprovals: 15,
        revenue: 45680.50,
      });

      setGrowthData([
        { month: 'Jan', users: 400, services: 240 },
        { month: 'Fev', users: 600, services: 320 },
        { month: 'Mar', users: 800, services: 450 },
        { month: 'Abr', users: 950, services: 520 },
        { month: 'Mai', users: 1100, services: 600 },
        { month: 'Jun', users: 1250, services: 710 },
      ]);

      setCategoryData([
        { name: 'Manutenção', value: 35, color: '#0088FE' },
        { name: 'Tecnologia', value: 20, color: '#00C49F' },
        { name: 'Casa', value: 15, color: '#FFBB28' },
        { name: 'Beleza', value: 12, color: '#FF8042' },
        { name: 'Automotivo', value: 10, color: '#8884D8' },
        { name: 'Outros', value: 8, color: '#82CA9D' },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-header">
        <h3>{title}</h3>
        <span className="stat-icon" style={{ backgroundColor: color }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <StatCard 
          title="Total de Usuários" 
          value={stats.totalUsers.toLocaleString()} 
          icon="👥" 
          color="#4CAF50" 
        />
        <StatCard 
          title="Profissionais" 
          value={stats.totalProfessionals} 
          icon="👷" 
          color="#2196F3" 
        />
        <StatCard 
          title="Serviços Realizados" 
          value={stats.totalServices} 
          icon="🔧" 
          color="#FF9800" 
        />
        <StatCard 
          title="Aprovações Pendentes" 
          value={stats.pendingApprovals} 
          icon="⏳" 
          color="#F44336" 
        />
        <StatCard 
          title="Faturamento Total" 
          value={`R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon="💰" 
          color="#9C27B0" 
        />
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Crescimento Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#4CAF50" name="Usuários" />
              <Line type="monotone" dataKey="services" stroke="#2196F3" name="Serviços" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Serviços por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Atividade Recente</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10/06/2023 14:30</td>
              <td>João Silva (Cliente)</td>
              <td>Solicitou serviço de Encanador</td>
              <td><span className="status completed">Concluído</span></td>
            </tr>
            <tr>
              <td>10/06/2023 12:15</td>
              <td>Maria Santos (Profissional)</td>
              <td>Cadastro pendente de aprovação</td>
              <td><span className="status pending">Pendente</span></td>
            </tr>
            <tr>
              <td>09/06/2023 18:45</td>
              <td>Carlos Oliveira</td>
              <td>Avaliou serviço ⭐⭐⭐⭐⭐</td>
              <td><span className="status approved">Aprovado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;