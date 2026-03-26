import api from '../api/axios';

const petitionService = {
  getAllPetitions: async (params = {}) => {
    try {
      const response = await api.get('/petitions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPetitionById: async (id) => {
    try {
      const response = await api.get(`/petitions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createPetition: async (petitionData) => {
    try {
      const response = await api.post('/petitions', petitionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  signPetition: async (id) => {
    try {
      const response = await api.post(`/petitions/${id}/sign`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePetition: async (id, petitionData) => {
    try {
      const response = await api.put(`/petitions/${id}`, petitionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  respondToPetition: async (id, responseData) => {
    try {
      const response = await api.post(`/petitions/${id}/respond`, responseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePetition: async (id) => {
    try {
      const response = await api.delete(`/petitions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default petitionService;
