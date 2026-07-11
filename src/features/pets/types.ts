import type { PetSex } from '@/shared/types';

export interface PetResponse {
  id: string;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  sex?: PetSex;
  color?: string;
  weight?: string;
  microchipId?: string;
  tattooNumber?: string;
  photoUrl?: string;
  active: boolean;
  clientId: string;
}

export interface PetRequest {
  name: string;
  clientId: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  sex?: PetSex;
  color?: string;
  weight?: string;
  microchipId?: string;
  tattooNumber?: string;
  photoUrl?: string;
}

export interface UpdatePetRequest {
  name?: string;
  species?: string;
  breed?: string;
  dateOfBirth?: string;
  sex?: PetSex;
  color?: string;
  weight?: string;
  microchipId?: string;
  tattooNumber?: string;
  photoUrl?: string;
}

export interface PhotoUploadResponse {
  photoUrl: string;
}
