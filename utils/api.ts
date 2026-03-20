export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: any = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'API Error');
        (error as any).response = { data };
        (error as any).status = response.status;
        throw error;
    }

    return { data };
};

const api = {
    get: async (url: string, config?: any) => {
        let fullUrl = `${BASE_URL}${url}`;
        if (config?.params) {
            const params = new URLSearchParams(config.params).toString();
            fullUrl += `?${params}`;
        }
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    post: async (url: string, data?: any, config?: any) => {
        const fullUrl = `${BASE_URL}${url}`;
        const headers = getHeaders();

        let body;
        if (data instanceof FormData) {
            delete headers['Content-Type'];
            body = data;
        } else {
            body = JSON.stringify(data);
        }

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: config?.headers ? { ...headers, ...config.headers } : headers,
            body,
        });

        return handleResponse(response);
    },
    put: async (url: string, data?: any, config?: any) => {
        const fullUrl = `${BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    delete: async (url: string, config?: any) => {
        const fullUrl = `${BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

/**
 * Helper: Returns Authorization headers for raw calls.
 */
export const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default api;
