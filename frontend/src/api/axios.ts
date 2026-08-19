import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1"
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest =
            error.config?.url?.includes('/auth/login') ||
            error.config?.url?.includes('/auth/register')

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                window.location.href = "/login"
            }
        }
        return Promise.reject(error)
    }
)

export default api