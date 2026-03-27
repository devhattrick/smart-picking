import type { MovementLog, Product, User } from '../types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  details?: unknown;
}

export const AUTH_STORAGE_KEY = 'authSession';
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface PickingInitialDataResponse {
  products: Product[];
  history: MovementLog[];
  locations: string[];
}

export interface PickingMovementResponse {
  product: Product;
  movement: MovementLog;
  locations: string[];
}

export interface DeleteProductResponse {
  productId: number;
  deletedProduct: Product;
}

export type ProductPayload = Omit<Product, 'id'>;

export interface MovementPayload {
  productId: number;
  quantity: number;
  location: string;
  person: string;
}

export class PickingSystemServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'PickingSystemServiceError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace(/\/$/, '');

const dispatchUnauthorizedEvent = () => {
  if (typeof window === 'undefined') {
    return;
  }

  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};

export const getStoredAuthSession = (): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const saveAuthSession = (session: AuthSession) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const getErrorMessage = (status: number): string => {
  if (status === 401) {
    return 'เซสชันหมดอายุหรือยังไม่ได้เข้าสู่ระบบ';
  }

  if (status >= 500) {
    return 'API เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง';
  }

  return 'คำขอไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่';
};

const request = async <T>(path: string, options: RequestInit = {}, authMode: 'include' | 'omit' = 'include'): Promise<T> => {
  let response: Response;
  const authSession = getStoredAuthSession();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authMode === 'include') {
    if (!authSession?.token) {
      dispatchUnauthorizedEvent();
      throw new PickingSystemServiceError('กรุณาเข้าสู่ระบบก่อนใช้งาน', 401);
    }

    headers.set('Authorization', `Bearer ${authSession.token}`);
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new PickingSystemServiceError(
      `ไม่สามารถเชื่อมต่อ API ได้ที่ ${API_BASE_URL}. กรุณาเปิด backend service ก่อนใช้งาน`,
    );
  }

  const rawPayload = await response.text();
  let payload: ApiEnvelope<T> | null = null;

  if (rawPayload) {
    try {
      payload = JSON.parse(rawPayload) as ApiEnvelope<T>;
    } catch {
      throw new PickingSystemServiceError(`API response is not valid JSON`, response.status);
    }
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 401 && authMode === 'include') {
      dispatchUnauthorizedEvent();
    }

    throw new PickingSystemServiceError(
      payload?.message ?? getErrorMessage(response.status),
      response.status,
      payload?.details,
    );
  }

  return payload.data;
};

export const pickingSystemService = {
  async login(payload: LoginPayload) {
    const session = await request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, 'omit');

    saveAuthSession(session);
    return session;
  },

  async logout() {
    try {
      await request<{ loggedOut: boolean }>('/auth/logout', {
        method: 'POST',
      }, 'include');
    } finally {
      clearAuthSession();
    }
  },

  getInitialData() {
    return request<PickingInitialDataResponse>('/picking/initial-data');
  },

  createProduct(payload: ProductPayload) {
    return request<Product>('/picking/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateProduct(productId: number, payload: ProductPayload) {
    return request<Product>(`/picking/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteProduct(productId: number) {
    return request<DeleteProductResponse>(`/picking/products/${productId}`, {
      method: 'DELETE',
    });
  },

  createInboundMovement(payload: MovementPayload) {
    return request<PickingMovementResponse>('/picking/movements/inbound', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createOutboundMovement(payload: MovementPayload) {
    return request<PickingMovementResponse>('/picking/movements/outbound', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
