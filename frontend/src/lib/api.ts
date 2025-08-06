const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  subscription_tier: string;
  subscribed: boolean;
  daily_ai_queries_used: number;
  is_verified: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; message: string }>> {
    return this.request<{ user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  // AI Chat methods
  async getConversations(): Promise<ApiResponse<any[]>> {
    const response = await this.request<{ conversations: any[] }>('/ai/conversations');
    if (response.data) {
      return { data: response.data.conversations };
    }
    return { error: response.error };
  }

  async createConversation(data: { title: string }): Promise<ApiResponse<any>> {
    const response = await this.request<{ conversation: any }>('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data) {
      return { data: response.data.conversation };
    }
    return { error: response.error };
  }

  async getConversationMessages(conversationId: string): Promise<ApiResponse<any[]>> {
    const response = await this.request<{ messages: any[] }>(`/ai/conversations/${conversationId}/messages`);
    if (response.data) {
      return { data: response.data.messages };
    }
    return { error: response.error };
  }

  async sendMessage(message: string, conversationId?: string, language?: string): Promise<ApiResponse<any>> {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, language }),
    });
  }

  // Calendar methods
  async getEvents(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/calendar/events');
  }

  async createEvent(eventData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Store/Map methods
  async getStores(latitude?: number, longitude?: number, radius?: number): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (latitude) params.append('latitude', latitude.toString());
    if (longitude) params.append('longitude', longitude.toString());
    if (radius) params.append('radius', radius.toString());

    return this.request<any[]>(`/stores?${params.toString()}`);
  }

  async getStoreCategories(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/stores/categories');
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markNotificationAsUnread(notificationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${notificationId}/unread`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllReadNotifications(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/delete-read', {
      method: 'DELETE',
    });
  }

  // User profile
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const url = `${this.baseURL}/users/avatar`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('Avatar upload failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Subscription
  async getSubscription(): Promise<ApiResponse<any>> {
    return this.request<any>('/subscribers');
  }

  async updateSubscription(subscriptionData: { subscription_tier: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/subscribers', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 