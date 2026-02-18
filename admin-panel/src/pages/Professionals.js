import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { getErrorMessage, normalizePagination, request } from '../utils/http';

const Professionals = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfessionals = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await request.get('/admin/professionals', { status, page, limit: 10 });
      setItems(response.data.professionals || []);
      setPagination(normalizePagination(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  const verify = async (id) => {
    try {
      await request.put(`/admin/professionals/${id}/verify`);
      await loadProfessionals();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleFeature = async (id, featured) => {
    try {
      await request.put(`/admin/professionals/${id}/feature`, { featured });
      await loadProfessionals();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Header title="Profissionais" subtitle="Aprovação e destaque de prestadores." />

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
            <option value="">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="verified">Verificados</option>
          </select>
          <button type="button" className="ghost" onClick={loadProfessionals}>
            Atualizar
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando profissionais...</div> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Categorias</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((professional) => (
                    <tr key={professional._id}>
                      <td>
                        <strong>{professional.userId?.name || '-'}</strong>
                        <div className="hint">{professional.userId?.city || '-'}</div>
                      </td>
                      <td>
                        <div>{professional.userId?.email || '-'}</div>
                        <div className="hint">{professional.userId?.phone || '-'}</div>
                      </td>
                      <td>{professional.categories?.join(', ') || 'Não informado'}</td>
                      <td>
                        <span className={`badge ${professional.isVerified ? 'success' : 'warning'}`}>
                          {professional.isVerified ? 'Verificado' : 'Pendente'}
                        </span>{' '}
                        {professional.isFeatured ? <span className="badge info">Destaque</span> : null}
                      </td>
                      <td>
                        {!professional.isVerified ? (
                          <button
                            type="button"
                            className="primary"
                            onClick={() => verify(professional._id)}
                          >
                            Verificar
                          </button>
                        ) : null}{' '}
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => toggleFeature(professional._id, !professional.isFeatured)}
                        >
                          {professional.isFeatured ? 'Remover destaque' : 'Destacar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty">
                      Nenhum profissional encontrado.
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

export default Professionals;
