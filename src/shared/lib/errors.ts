import type { AxiosError } from 'axios';

interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  path: string;
  timestamp: string;
}

interface ApiErrorResponse {
  success: boolean;
  error?: ApiErrorBody;
}

export function getApiErrorMessage(error: unknown, context: string): { title: string; message: string } {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (axiosError.response) {
    const { status, data } = axiosError.response;
    const apiMessage = data?.error?.message;

    switch (status) {
      case 400:
        return {
          title: `Error de validación`,
          message: apiMessage || 'Los datos enviados son incorrectos. Verificá los campos.',
        };
      case 401:
        return {
          title: 'No autorizado',
          message: apiMessage || 'Credenciales incorrectas o sesión expirada.',
        };
      case 404:
        return {
          title: 'No encontrado',
          message: apiMessage || `${context} no encontrado.`,
        };
      case 409:
        return {
          title: 'Conflicto',
          message: apiMessage || 'El registro ya existe o entra en conflicto con uno existente.',
        };
      case 500:
        return {
          title: 'Error del servidor',
          message: apiMessage || 'Ocurrió un error inesperado. Intentá nuevamente.',
        };
      default:
        return {
          title: 'Error',
          message: apiMessage || `Error inesperado (${status}).`,
        };
    }
  }

  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
    return {
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Verificá tu conexión.',
    };
  }

  return {
    title: 'Error',
    message: 'Ocurrió un error inesperado.',
  };
}
