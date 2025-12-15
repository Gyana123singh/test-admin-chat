export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("activeMenu");
  localStorage.removeItem("sidebarOpen");
  window.location.href = "/Login";
};
