import instanceApi from "../api/axiosConfig";

export const adminApi = {
  loginAdmin: async (email, password) => {
    try {
      const response = await instanceApi.post("/api/admin/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
