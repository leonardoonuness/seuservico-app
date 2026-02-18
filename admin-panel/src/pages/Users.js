import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { getErrorMessage, normalizePagination, request } from '../utils/http';

const Users = () => {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await request.get('/admin/users', { type, page, limit: 10 });
      setItems(response.data.users || []);
      setPagination(normalizePagination(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleBlock = async (user) => {
    const shouldBlock = !user.isBlocked;
    const reason = shouldBlock ? window.prompt('Motivo do bloqueio:') || 'Sem descrição' : '';

    try {
      await request.put(`/admin/users/${user._id}/block`, {
        blocked: shouldBlock,
        reason,
      });
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Header title="Usuários" subtitle="Gestão de contas da plataforma." />

      <div className="card">
        <div className="filters">
          <select
            className="control"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="client">Clientes</option>
            <option value="professional">Profissionais</option>
            <option value="admin">Admins</option>
          </select>
          <button type="button" className="ghost" onClick={loadUsers}>
            Atualizar
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="loading">Carregando usuários...</div> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Cidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <strong>{user.name}</strong>
                        <div className="hint">{user.email}</div>
                      </td>
                      <td>
                        <span className="badge info">{user.type}</span>
                      </td>
                      <td>{user.city || '-'}</td>
                      <td>
                        <span className={`badge ${user.isBlocked ? 'danger' : 'success'}`}>
                          {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={user.isBlocked ? 'primary' : 'danger'}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty">
                      Nenhum usuário encontrado.
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

export default Users;
