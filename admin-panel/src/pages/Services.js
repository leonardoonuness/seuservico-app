import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { getErrorMessage, normalizePagination, request } from '../utils/http';

const Services = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await request.get('/admin/services', { status, page, limit: 10 });
      setItems(response.data.services || []);
      setPagination(normalizePagination(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const getStatusClass = (value) => {
    if (value === 'completed') return 'success';
    if (value === 'cancelled') return 'danger';
    if (value === 'pending') return 'warning';
    return 'info';
  };

  return (
    <div>
      <Header title="Serviços" subtitle="Acompanhamento de solicitações de serviço." />

      <div className="card">
        <div className="filters">
          <select
            className="control"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos status</option>
            <option value="pending">pending</option>
            <option value="accepted">accepted</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button type="button" className="ghost" onClick={loadServices}>
            Atualizar
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando serviços...</div> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Cliente</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Preço</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((service) => (
                    <tr key={service._id}>
                      <td>
                        <strong>{service.service || 'Sem nome'}</strong>
                        <div className="hint">{service.description || '-'}</div>
                      </td>
                      <td>{service.clientId?.name || '-'}</td>
                      <td>{service.category || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusClass(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td>
                        {typeof service.price === 'number'
                          ? `R$ ${service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                      <td>{service.createdAt ? new Date(service.createdAt).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty">
                      Nenhum serviço encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="pagination">
          <button type="button" className="ghost" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <button
            type="button"
            className="ghost"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
