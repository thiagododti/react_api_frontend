import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * URL base da API obtida das variáveis de ambiente ou localhost como fallback
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Instância do axios configurada para requisições à API
 * Inclui interceptors para gerenciamento automático de tokens e autenticação
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});