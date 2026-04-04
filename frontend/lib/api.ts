const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) => 
      apiFetch<{ success: boolean; token: string; user: { id: number; name: string; email: string; role: string } }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    signup: (data: { name: string; email: string; password: string; role?: string }) =>
      apiFetch<{ success: boolean; token: string; user: { id: number; name: string; email: string; role: string } }>('/auth/signup', {
        method: 'POST',
        body: data,
      }),
    me: (token: string) =>
      apiFetch<{ success: boolean; user: { id: number; name: string; email: string; role: string } }>('/auth/me', { token }),
  },
  
  products: {
    getAll: (token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>('/products', { token }),
    getById: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/products/${id}`, { token }),
    getByCategory: (categoryId: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>(`/products/category/${categoryId}`, { token }),
    create: (data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/products', { method: 'POST', body: data, token }),
    update: (id: number, data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/products/${id}`, { method: 'PUT', body: data, token }),
    delete: (id: number, token: string) =>
      apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE', token }),
  },
  
  categories: {
    getAll: (token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>('/categories', { token }),
    create: (data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/categories', { method: 'POST', body: data, token }),
    update: (id: number, data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/categories/${id}`, { method: 'PUT', body: data, token }),
    delete: (id: number, token: string) =>
      apiFetch<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE', token }),
  },
  
  floors: {
    getAll: (token: string) =>
      apiFetch<{ success: boolean; data: { id: number; name: string; tables: unknown[] }[] }>('/floors', { token }),
    create: (data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/floors', { method: 'POST', body: data, token }),
    update: (id: number, data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/floors/${id}`, { method: 'PUT', body: data, token }),
    delete: (id: number, token: string) =>
      apiFetch<{ success: boolean }>(`/floors/${id}`, { method: 'DELETE', token }),
  },
  
  tables: {
    getAll: (token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>('/tables', { token }),
    getByFloor: (floorId: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>(`/tables/floor/${floorId}`, { token }),
    getById: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/tables/${id}`, { token }),
    create: (data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/tables', { method: 'POST', body: data, token }),
    update: (id: number, data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/tables/${id}`, { method: 'PUT', body: data, token }),
    updateStatus: (id: number, status: string, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/tables/${id}/status`, { method: 'PUT', body: { status }, token }),
    delete: (id: number, token: string) =>
      apiFetch<{ success: boolean }>(`/tables/${id}`, { method: 'DELETE', token }),
  },
  
  sessions: {
    getAll: (token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>('/sessions', { token }),
    getActive: (token: string) =>
      apiFetch<{ success: boolean; data: unknown | null }>('/sessions/active', { token }),
    open: (data: { terminalName: string; openingCash: number }, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/sessions/open', { method: 'POST', body: data, token }),
    close: (id: number, data: { closingCash: number; notes?: string }, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/sessions/${id}/close`, { method: 'PUT', body: data, token }),
  },
  
  orders: {
    getAll: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown[] }>(`/orders${query}`, { token });
    },
    getById: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/orders/${id}`, { token }),
    getByTable: (tableId: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown | null }>(`/orders/table/${tableId}`, { token }),
    create: (data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/orders', { method: 'POST', body: data, token }),
    update: (id: number, data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/orders/${id}`, { method: 'PUT', body: data, token }),
    sendToKitchen: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/orders/${id}/send-kitchen`, { method: 'PUT', token }),
    updateStatus: (id: number, status: string, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/orders/${id}/status`, { method: 'PUT', body: { status }, token }),
    delete: (id: number, token: string) =>
      apiFetch<{ success: boolean }>(`/orders/${id}`, { method: 'DELETE', token }),
  },
  
  payments: {
    getAll: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown[] }>(`/payments${query}`, { token });
    },
    process: (data: { orderId: number; method: string; amountPaid: number; upiRef?: string }, token: string) =>
      apiFetch<{ success: boolean; paymentId: number; receiptNumber: string; amountPaid: number; change: number; method: string; status: string }>('/payments', {
        method: 'POST',
        body: data,
        token,
      }),
    getByOrder: (orderId: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown[] }>(`/payments/order/${orderId}`, { token }),
    confirmUPI: (data: { orderId: number; upiRef: string }, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>('/payments/upi/confirm', { method: 'POST', body: data, token }),
  },
  
  paymentMethods: {
    getAll: (token: string) =>
      apiFetch<{ success: boolean; data: { id: number; name: string; type: string; isEnabled: boolean; upiId?: string }[] }>('/payment-methods', { token }),
    toggle: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/payment-methods/${id}/toggle`, { method: 'PUT', token }),
    saveUPI: (id: number, upiId: string, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/payment-methods/${id}/upi`, { method: 'PUT', body: { upiId }, token }),
    getQR: (id: number, token: string) =>
      apiFetch<{ success: boolean; qrBase64: string; upiId: string }>(`/payment-methods/${id}/qr`, { token }),
  },

  customers: {
    getAll: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown[] }>(`/customers${query}`, { token });
    },
    getById: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/customers/${id}`, { token }),
    create: (data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/customers`, { method: 'POST', body: data, token }),
    update: (id: number, data: unknown, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/customers/${id}`, { method: 'PUT', body: data, token }),
    delete: (id: number, token: string) =>
      apiFetch<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE', token }),
  },
  
  kitchen: {
    getTickets: (token: string, stage?: string) => {
      const query = stage ? `?stage=${stage}` : '';
      return apiFetch<{ success: boolean; data: unknown[] }>(`/kitchen/tickets${query}`, { token });
    },
    getTicketById: (id: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/kitchen/tickets/${id}`, { token }),
    updateStage: (id: number, stage: string, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/kitchen/tickets/${id}/stage`, { method: 'PUT', body: { stage }, token }),
    markItemPrepared: (ticketId: number, itemId: number, token: string) =>
      apiFetch<{ success: boolean; data: unknown }>(`/kitchen/tickets/${ticketId}/items/${itemId}/prepared`, { method: 'PUT', token }),
  },
  
  reports: {
    dashboard: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown }>(`/reports/dashboard${query}`, { token });
    },
    sales: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown }>(`/reports/sales${query}`, { token });
    },
    orders: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown[] }>(`/reports/orders${query}`, { token });
    },
    products: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ success: boolean; data: unknown[] }>(`/reports/products${query}`, { token });
    },
    exportPdf: async (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const response = await fetch(`${API_BASE}/reports/export/pdf${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let message = 'Failed to export PDF';
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          // Ignore parse errors for binary responses.
        }
        throw new Error(message);
      }
      return response.blob();
    },
    exportXls: async (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const response = await fetch(`${API_BASE}/reports/export/xls${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let message = 'Failed to export XLS';
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          // Ignore parse errors for binary responses.
        }
        throw new Error(message);
      }
      return response.blob();
    },
  },

  selfOrder: {
    getPageSettings: (token: string) =>
      apiFetch<{
        success: boolean;
        data: {
          restaurantName: string;
          logo: string | null;
          backgroundImages: string[];
          backgroundColor: string;
          tableId: number;
          tableName: string;
          mode: 'online_ordering' | 'qr_menu';
        };
      }>(`/self-order/page-settings/${token}`),

    getProductsForPage: (token: string) =>
      apiFetch<{
        success: boolean;
        categories: { id: number; name: string; color: string }[];
        products: {
          id: number;
          name: string;
          price: number;
          categoryId: number | null;
          image: string | null;
          emoji?: string;
          variants: { id: number; attribute: string; value: string; extraPrice: number }[];
          addons: { id: number; name: string; price: number }[];
        }[];
      }>(`/self-order/products/${token}`),

    getSettings: (token: string) =>
      apiFetch<{
        success: boolean;
        data: {
          isEnabled: boolean;
          mode: 'online_ordering' | 'qr_menu';
          payAtCounter: boolean;
          backgroundColor: string;
          backgroundImages: string[];
        };
      }>('/self-order/settings', { token }),

    saveSettings: (
      data: { isEnabled: boolean; mode: 'online_ordering' | 'qr_menu'; payAtCounter?: boolean; backgroundColor?: string },
      token: string,
    ) => apiFetch<{ success: boolean; data: { isEnabled: boolean; mode: 'online_ordering' | 'qr_menu'; payAtCounter: boolean; backgroundColor: string; backgroundImages: string[] } }>(
      '/self-order/settings',
      { method: 'PUT', body: data, token },
    ),

    uploadBackgroundImages: async (files: File[], token: string) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const response = await fetch(`${API_BASE}/self-order/settings/background`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Background image upload failed');
      }

      return data as { success: boolean; images: string[] };
    },

    removeBackgroundImage: (imageUrl: string, token: string) =>
      apiFetch<{ success: boolean; data: { backgroundImages: string[] } }>('/self-order/settings/background', {
        method: 'DELETE',
        body: { imageUrl },
        token,
      }),

    generateTokens: (token: string) =>
      apiFetch<{ success: boolean; tokens: { tableId: number; tableName: string; token: string; url: string }[] }>(
        '/self-order/generate-tokens',
        { method: 'POST', token },
      ),

    getTokens: (token: string) =>
      apiFetch<{ success: boolean; tokens: { tableId: number; tableName: string; token: string; url: string }[] }>(
        '/self-order/tokens',
        { token },
      ),

    regenerateToken: (tableId: number, token: string) =>
      apiFetch<{ success: boolean; token: { tableId: number; tableName: string; token: string; url: string } }>(
        `/self-order/tokens/${tableId}/regenerate`,
        { method: 'POST', token },
      ),

    downloadQrPdf: async (token: string) => {
      const response = await fetch(`${API_BASE}/self-order/download-qr-pdf`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let message = 'Failed to download QR PDF';
        try {
          const err = await response.json();
          message = err.message || message;
        } catch {
          // Ignore JSON parse errors for non-JSON responses.
        }
        throw new Error(message);
      }

      return response.blob();
    },

    validateToken: (token: string) =>
      apiFetch<{
        success: boolean;
        valid: boolean;
        tableId: number;
        tableName: string;
        sessionId: number | null;
        mode: 'online_ordering' | 'qr_menu';
        payAtCounter: boolean;
        backgroundImages: string[];
      }>(`/self-order/validate/${token}`),

    placeOrderByToken: (
      token: string,
      data: {
        customerName?: string;
        items: {
          productId: number;
          variantId?: number | null;
          addons?: number[];
          quantity: number;
          unitPrice?: number;
          notes?: string;
        }[];
        totalAmount?: number;
      },
    ) =>
      apiFetch<{
        success: boolean;
        orderNumber: string;
        orderId: number;
        tableId: number;
        tableName: string;
        totalAmount: number;
        status: string;
        message: string;
      }>(`/self-order/place-order/${token}`, { method: 'POST', body: data }),

    trackOrder: (orderId: number) =>
      apiFetch<{
        success: boolean;
        orderId: number;
        orderNumber: string;
        items: { id: number; productName: string; quantity: number; status: string }[];
        overallStatus: string;
        kitchenStage: string;
      }>(`/self-order/track/${orderId}`),

    getOrderHistory: (token: string) =>
      apiFetch<{
        success: boolean;
        orders: {
          orderId: number;
          orderNumber: string;
          totalAmount: number;
          status: string;
          kitchenStage: string;
          createdAt: string;
        }[];
      }>(`/self-order/history/${token}`),
  },
};

export type ApiType = typeof api;
