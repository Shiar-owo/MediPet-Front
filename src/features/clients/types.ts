export interface ClientResponse {
  id: string;
  name: string;
  dni: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
}

export interface ClientRequest {
  name: string;
  dni: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateClientRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
