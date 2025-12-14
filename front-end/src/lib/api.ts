const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * API client for GeoTsuiseki backend
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Include cookies for auth
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred');
        }

        return data;
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(name: string, email: string, password: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Products endpoints
    async getProducts(page = 1, limit = 10, search = '') {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        return this.request(`/products?${params}`);
    }

    async getProduct(id: string) {
        return this.request(`/products/${id}`);
    }

    async createProduct(data: {
        name: string;
        description?: string;
        price: number;
        stock: number;
    }) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProduct(id: string, data: Partial<{
        name: string;
        description: string;
        price: number;
        stock: number;
    }>) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteProduct(id: string) {
        return this.request(`/products/${id}`, { method: 'DELETE' });
    }

    // Partners endpoints
    async getPartners(page = 1, limit = 10) {
        return this.request(`/partners?page=${page}&limit=${limit}`);
    }

    async getPartner(id: string) {
        return this.request(`/partners/${id}`);
    }

    async getPartnerAnalytics(id: string) {
        return this.request(`/partners/${id}/analytics`);
    }

    async getPendingPartners() {
        return this.request('/partners/pending');
    }

    async approvePartner(id: string) {
        return this.request(`/partners/pending/${id}/approve`, { method: 'POST' });
    }

    async rejectPartner(id: string) {
        return this.request(`/partners/pending/${id}/reject`, { method: 'POST' });
    }

    async requestPartnerStatus(data: { businessName: string; phone?: string; description?: string }) {
        return this.request('/partners/request', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Users endpoints (admin)
    async getUsers(page = 1, limit = 10) {
        return this.request(`/users?page=${page}&limit=${limit}`);
    }

    async getUser(email: string) {
        return this.request(`/users/${email}`);
    }

    async createUser(data: {
        email: string;
        password: string;
        name: string;
        role: string;
    }) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateUserRole(email: string, role: string) {
        return this.request(`/users/${email}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        });
    }

    async deleteUser(email: string) {
        return this.request(`/users/${email}`, { method: 'DELETE' });
    }
}

export const api = new ApiClient();
export default api;
