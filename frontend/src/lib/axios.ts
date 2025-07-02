import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const BASE_URL = 
import.meta.env.MODE === 'development' ? 
'http://localhost:5000/api' :
'/api'
;

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.data.message === 'jwt expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { setAccessToken, setAuthuser } = useAuthStore.getState();
        const res = await axiosInstance.get('/auth/refresh-token');
        setAccessToken(res.data.accessToken);
        setAuthuser(res.data.user);

        //  حدّث الهيدر وكمّل الطلب القديم
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);

      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);