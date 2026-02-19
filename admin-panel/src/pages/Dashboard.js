import React, { useState, useEffect } from 'react';

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

  const loadDashboardData = () => {
    setStats({
      totalUsers: 1250,
      totalProfessionals: 320,
      totalServices: 2450,
      pendingApprovals: 15,
      revenue: 45680.5,
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
      { name: 'Manutenção', value: 35 },
      { name: 'Tecnologia', value: 20 },
      { name: 'Casa', value: 15 },
      { name: 'Beleza', value: 12 },
      { name: 'Automotivo', value: 10 },
      { name: 'Outros', value: 8 },
    ]);
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
        <StatCard title="Total de Usuários" value={stats.totalUsers.toLocaleString()} icon="👥" color="#4CAF50" />
        <StatCard title="Profissionais" value={stats.totalProfessionals} icon="👷" color="#2196F3" />
        <StatCard title="Serviços Realizados" value={stats.totalServices} icon="🔧" color="#FF9800" />
        <StatCard title="Aprovações Pendentes" value={stats.pendingApprovals} icon="⏳" color="#F44336" />
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
          <ul>
            {growthData.map((item) => (
              <li key={item.month}>{item.month}: {item.users} usuários / {item.services} serviços</li>
            ))}
          </ul>
        </div>

        <div className="chart-container">
          <h3>Serviços por Categoria</h3>
          <ul>
            {categoryData.map((item) => (
              <li key={item.name}>{item.name}: {item.value}%</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
