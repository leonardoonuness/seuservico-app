import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { getErrorMessage, request } from '../utils/http';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    totalServices: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });
  const [metrics, setMetrics] = useState({
    categoryMetrics: [],
    growthMetrics: [],
    topProfessionals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, metricsRes] = await Promise.all([
        request.get('/admin/dashboard/stats'),
        request.get('/admin/reports/metrics'),
      ]);

      setStats(statsRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const formattedRevenue = useMemo(
    () => `R$ ${Number(stats.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    [stats.totalRevenue]
  );

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Visão geral de performance e operação do painel."
        actions={
          <button type="button" className="ghost" onClick={loadDashboard}>
            Atualizar
          </button>
        }
      />

      {error ? <div className="error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard title="Usuários" value={stats.totalUsers} />
        <StatCard title="Profissionais Verificados" value={stats.totalProfessionals} />
        <StatCard title="Serviços Concluídos" value={stats.totalServices} />
        <StatCard title="Aprovações Pendentes" value={stats.pendingApprovals} />
        <StatCard title="Faturamento" value={formattedRevenue} />
      </div>

      {loading ? <div className="loading">Carregando métricas...</div> : null}

      {!loading ? (
        <div className="grid-2">
          <div className="card">
            <h3>Top categorias</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Total Serviços</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.categoryMetrics?.length ? (
                    metrics.categoryMetrics.slice(0, 6).map((item) => (
                      <tr key={item._id || 'sem-categoria'}>
                        <td>{item._id || 'Sem categoria'}</td>
                        <td>{item.totalServices || 0}</td>
                        <td>
                          R$ {Number(item.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty">
                        Sem dados de categoria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>Top profissionais</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Profissional</th>
                    <th>Avaliação</th>
                    <th>Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topProfessionals?.length ? (
                    metrics.topProfessionals.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name || item.email || item._id}</td>
                        <td>{Number(item.avgRating || 0).toFixed(1)} ⭐</td>
                        <td>{item.totalReviews || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty">
                        Sem profissionais com volume mínimo de reviews.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Crescimento mensal</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mês/Ano</th>
                    <th>Serviços</th>
                    <th>Clientes ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.growthMetrics?.length ? (
                    metrics.growthMetrics.map((item) => (
                      <tr key={`${item.year}-${item.month}`}>
                        <td>{`${item.month}/${item.year}`}</td>
                        <td>{item.totalServices || 0}</td>
                        <td>{item.totalUsers || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty">
                        Sem dados de crescimento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
