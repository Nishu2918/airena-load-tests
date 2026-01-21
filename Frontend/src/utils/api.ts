// API Configuration and Service
// Using relative path with Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Always reload token from localStorage before making a request
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
      }
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - token might be invalid
        if (response.status === 401) {
          this.clearToken();
          const error = await response.json().catch(() => ({ message: 'Unauthorized - Please login again' }));
          const errorMsg = error.message || 'Invalid credentials';
          if (errorMsg.includes('Invalid credentials') || errorMsg.includes('Invalid email or password')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
          throw new Error(errorMsg);
        }
        
        // Handle 403 Forbidden - insufficient permissions
        if (response.status === 403) {
          const error = await response.json().catch(() => ({ message: 'Forbidden resource' }));
          throw new Error(error.message || 'You do not have permission to perform this action.');
        }
        
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    return this.request<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<{ id: string; email: string; firstName: string; lastName: string; role: string; status: string }>('/auth/me');
  }

  async updateProfile(data: { role?: string }) {
    console.log('🔄 API: updateProfile called with:', data);
    console.log('🔑 API: Current token:', this.token ? 'EXISTS' : 'MISSING');
    console.log('🔑 API: Token from localStorage:', localStorage.getItem('auth_token') ? 'EXISTS' : 'MISSING');
    
    try {
      const result = await this.request<any>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      console.log('✅ API: updateProfile success:', result);
      return result;
    } catch (error) {
      console.error('❌ API: updateProfile error:', error);
      throw error;
    }
  }

  // Hackathon endpoints
  async getHackathons(filters?: { status?: string; category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return this.request<any[]>(`/hackathons${query ? `?${query}` : ''}`);
  }

  async getHackathon(id: string) {
    return this.request<any>(`/hackathons/${id}`);
  }

  async getHackathonParticipants(hackathonId: string) {
    return this.request<any[]>(`/hackathons/${hackathonId}/participants`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }

  async getMyHackathons() {
    return this.request<any[]>('/hackathons/my-hackathons', {
      method: 'GET',
    });
  }

  async registerForHackathon(
    hackathonId: string,
    registrationData?: {
      teamName?: string;
      teamDescription?: string;
      selectedTrack?: number;
      teamMembers?: Array<{ name: string; email: string; role: string }>;
    }
  ) {
    return this.request<{ success: boolean; message: string }>(`/hackathons/${hackathonId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData || {}),
    });
  }

  async createHackathon(data: any) {
    return this.request<any>('/hackathons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHackathon(id: string, data: any) {
    return this.request<any>(`/hackathons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteHackathon(id: string) {
    return this.request<{ message: string }>(`/hackathons/${id}`, {
      method: 'DELETE',
    });
  }

  async updateHackathonStatus(id: string, status: string) {
    return this.request<any>(`/hackathons/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Submission endpoints
  async getSubmissions(filters?: { hackathonId?: string; userId?: string; teamId?: string; status?: string; isDraft?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.hackathonId) params.append('hackathonId', filters.hackathonId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isDraft !== undefined) params.append('isDraft', filters.isDraft.toString());
    
    const query = params.toString();
    return this.request<any[]>(`/submissions${query ? `?${query}` : ''}`);
  }

  async getSubmission(id: string) {
    return this.request<any>(`/submissions/${id}`);
  }

  async createSubmission(data: any) {
    return this.request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubmission(id: string, data: any) {
    return this.request<any>(`/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // AI Mentor endpoints
  async mentorChat(data: {
    message: string;
    hackathonId?: string;
    conversationHistory?: Array<{ role: string; content: string; timestamp?: string }>;
  }) {
    return this.request<{
      response: string;
      suggestions?: string[];
      timestamp: string;
    }>('/ai/mentor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Analysis endpoints
  async analyzeProject(data: {
    hackathonId: string;
    title: string;
    description: string;
    requirements?: Record<string, any>;
  }) {
    return this.request<{
      submissionId: string;
      matchPercentage: number;
      decision: string;
      explanation: string;
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
    }>('/ai/analyze-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File Upload endpoints
  async uploadFile(file: File, folder?: string): Promise<{
    success: boolean;
    file: {
      url: string;
      key: string;
      size: number;
      originalName: string;
      mimeType: string;
    };
    storage: {
      configured: boolean;
      type: 'aws' | 'b2' | null;
      bucket: string | null;
      endpoint: string | null;
    };
  }> {
    // Always reload token from localStorage before making a request
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
      }
    }

    const url = `${this.baseURL}/uploads${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`;
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized - Please login again');
        }
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }

  async uploadFiles(files: File[], folder?: string): Promise<{
    success: boolean;
    files: Array<{
      url: string;
      key: string;
      size: number;
      originalName: string;
    }>;
    storage: {
      configured: boolean;
      type: 'aws' | 'b2' | null;
      bucket: string | null;
      endpoint: string | null;
    };
  }> {
    // Always reload token from localStorage before making a request
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
      }
    }

    const url = `${this.baseURL}/uploads/multiple`;
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized - Please login again');
        }
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }

  // Team endpoints
  async createTeam(data: {
    name: string;
    description?: string;
    hackathonId: string;
    members: Array<{ email: string; name?: string }>;
  }) {
    return this.request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeamsByHackathon(hackathonId: string) {
    return this.request<any[]>(`/teams/hackathon/${hackathonId}`);
  }

  async getTeam(id: string) {
    return this.request<any>(`/teams/${id}`);
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;

