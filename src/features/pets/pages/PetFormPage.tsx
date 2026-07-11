import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/shared/components/layout/Layout';
import { Input, Select, DatePicker, Button } from '@/shared/components/ui';
import { useToast } from '@/shared/components/shared/Toast';
import { petService } from '../services/petService';
import { clientService } from '@/features/clients/services/clientService';
import { getApiErrorMessage } from '@/shared/lib/errors';
import { FileInput } from '../components/FileInput';

const petSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  species: z.string().min(1, 'La especie es requerida'),
  breed: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE']).optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  microchipId: z.string().optional(),
  tattooNumber: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

export function PetFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const toast = useToast();

  const { data: petData, isLoading: loadingPet } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petService.getById(id!),
    enabled: isEditing,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => clientService.getAll({ page: 0, size: 100 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
  });

  useEffect(() => {
    if (petData?.data) {
      reset({
        name: petData.data.name,
        clientId: petData.data.clientId,
        species: petData.data.species,
        breed: petData.data.breed || '',
        dateOfBirth: petData.data.dateOfBirth || '',
        sex: petData.data.sex,
        color: petData.data.color || '',
        weight: petData.data.weight || '',
        microchipId: petData.data.microchipId || '',
        tattooNumber: petData.data.tattooNumber || '',
      });
    }
  }, [petData, reset]);

  const createMutation = useMutation({
    mutationFn: petService.create,
    onSuccess: async (response) => {
      if (photoFile && response.data?.id) {
        try {
          await petService.uploadPhoto(response.data.id, photoFile);
        } catch {
          toast.warning('Mascota creada', 'Se creó la mascota pero no se pudo subir la foto.');
        }
      }
      toast.success('Mascota creada', 'La mascota se registró correctamente.');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      navigate('/pets');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Mascota');
      toast.error(title, message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      const response = await petService.update(id!, data);
      if (photoFile && response.data?.id) {
        try {
          await petService.uploadPhoto(response.data.id, photoFile);
        } catch {
          toast.warning('Mascota actualizada', 'Se actualizaron los datos pero no se pudo subir la foto.');
        }
      }
      return response;
    },
    onSuccess: () => {
      toast.success('Mascota actualizada', 'Los datos se guardaron correctamente.');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      navigate('/pets');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Mascota');
      toast.error(title, message);
    },
  });

  const onSubmit = (data: PetFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;
  const clients = clientsData?.data?.content ?? [];

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Mascota' : 'Nueva Mascota'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Actualiza los datos de la mascota' : 'Registra una nueva mascota en el sistema'}
          </p>
        </div>

        {isEditing && loadingPet ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <Input
              label="Nombre"
              placeholder="Max"
              error={errors.name?.message}
              {...register('name')}
            />
            <Select
              label="Cliente"
              placeholder="Seleccionar cliente"
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.clientId?.message}
              {...register('clientId')}
            />
            <Input
              label="Especie"
              placeholder="Perro"
              error={errors.species?.message}
              {...register('species')}
            />
            <Input
              label="Raza"
              placeholder="Golden Retriever"
              error={errors.breed?.message}
              {...register('breed')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                label="Fecha de nacimiento"
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
              />
              <Select
                label="Sexo"
                placeholder="Seleccionar"
                options={[
                  { value: 'MALE', label: 'Macho' },
                  { value: 'FEMALE', label: 'Hembra' },
                ]}
                error={errors.sex?.message}
                {...register('sex')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Color"
                placeholder="Dorado"
                error={errors.color?.message}
                {...register('color')}
              />
              <Input
                label="Peso (kg)"
                placeholder="30.5"
                error={errors.weight?.message}
                {...register('weight')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Microchip"
                placeholder="MC12345"
                error={errors.microchipId?.message}
                {...register('microchipId')}
              />
              <Input
                label="Número de tatuaje"
                placeholder="TAT001"
                error={errors.tattooNumber?.message}
                {...register('tattooNumber')}
              />
            </div>
            <FileInput
              label="Foto de la mascota"
              value={photoFile}
              onChange={setPhotoFile}
              previewUrl={petData?.data?.photoUrl || undefined}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/pets')}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEditing ? 'Guardar Cambios' : 'Crear Mascota'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
