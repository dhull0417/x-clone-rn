import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";

const API_BASE_URL = "https://x-clone-rn-three.vercel.app/"

export const createApiClient = (getToken:() => Promise<string|null>):AxiosInstance => {
    const api = axios.create({baseURL:API_BASE_URL});

    api.interceptors.request.use(async (config) => {
        const token = await getToken();

        // LOGGING RECOMMENDATION: Check if a token was retrieved
        console.log("Retrieved token:", token ? "Token retrieved" : "No token found");

        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        // LOGGING RECOMMENDATION: Check the headers just before the request is sent
        console.log("Request headers:", config.headers);

        return config;
    });

    return api;
};

export const useApiClient = (): AxiosInstance => {
    const {getToken}= useAuth();
    return createApiClient(getToken);
};

export const userApi= {
    syncUser: (api:AxiosInstance) => api.post("/api/users/sync"),
    getCurrentUser: (api:AxiosInstance) => api.get("/users/me"),
    updateProfile: (api:AxiosInstance, data:any) => api.put("/users/profile", data),
}