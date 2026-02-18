import axios from 'axios';

export const getErrorMessage = (error) => {
  return error?.response?.data?.error || error?.message || 'Erro inesperado';
};

export const normalizePagination = (payload = {}) => {
  return {
    total: Number(payload.total || 0),
    page: Number(payload.page || 1),
    totalPages: Number(payload.totalPages || 1),
  };
};

export const buildQuery = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

export const request = {
  get: (path, params = {}) => {
    const query = buildQuery(params);
    return axios.get(query ? `${path}?${query}` : path);
  },
  put: (path, body = {}) => axios.put(path, body),
};
