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
  toggleUserBan: async (userId, isBanned) => {
    try {
      const response = await instanceApi.post("/api/toggle-user-ban", { userId, isBanned });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
