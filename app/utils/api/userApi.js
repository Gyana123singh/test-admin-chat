import instanceApi from "../../utils/api/axiosConfig";

export const userApi = {
  getAllUser: async () => {
    try {
      const response = await instanceApi.get("/api/get-all-user");
      return response.data; // ✅ RETURN DATA
    } catch (error) {
      throw error;
    }
  },
};
