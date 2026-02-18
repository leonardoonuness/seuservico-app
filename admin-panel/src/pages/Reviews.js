import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { getErrorMessage, normalizePagination, request } from '../utils/http';

const Reviews = () => {
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await request.get('/admin/reviews', {
        reported: reportedOnly ? 'true' : '',
        page,
        limit: 10,
      });
      setItems(response.data.reviews || []);
      setPagination(normalizePagination(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, reportedOnly]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const moderate = async (review, action) => {
    const reason = action === 'remove' ? window.prompt('Motivo da remoção:') || 'Conteúdo inadequado' : '';

    try {
      await request.put(`/admin/reviews/${review._id}/moderate`, { action, reason });
      await loadReviews();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Header title="Avaliações" subtitle="Moderação de reviews e denúncias." />

      <div className="card">
        <div className="filters">
          <label className="control" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={reportedOnly}
              onChange={(event) => {
                setReportedOnly(event.target.checked);
                setPage(1);
              }}
            />
            Apenas denunciadas
          </label>
          <button type="button" className="ghost" onClick={loadReviews}>
            Atualizar
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando avaliações...</div> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Comentário</th>
                  <th>Nota</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((review) => (
                    <tr key={review._id}>
                      <td>{review.clientId?.name || '-'}</td>
                      <td>{review.comment || 'Sem comentário'}</td>
                      <td>{Number(review.rating || 0).toFixed(1)} ⭐</td>
                      <td>
                        {review.isRemoved ? (
                          <span className="badge danger">Removida</span>
                        ) : review.isReported ? (
                          <span className="badge warning">Denunciada</span>
                        ) : (
                          <span className="badge success">Ativa</span>
                        )}
                      </td>
                      <td>
                        {review.isRemoved ? (
                          <button type="button" className="primary" onClick={() => moderate(review, 'restore')}>
                            Restaurar
                          </button>
                        ) : (
                          <button type="button" className="danger" onClick={() => moderate(review, 'remove')}>
                            Remover
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty">
                      Nenhuma avaliação encontrada.
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

export default Reviews;
