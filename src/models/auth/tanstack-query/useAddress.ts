import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAddresses,
  getDefaultAddress,
  getAddressById,
  addAddress,
  updateAddress,
  changeDefaultAddress,
  deleteAddress,
  type AddressDTO,
  type AddressRequestDTO,
} from '@/shared/api/auth/address'

const QK = {
  list: ['addresses'] as const,
  default: ['addresses', 'default'] as const,
  detail: (id: number) => ['addresses', id] as const,
}

export const useAddressesQuery = () =>
  useQuery({
    queryKey: QK.list,
    queryFn: getAddresses,
    staleTime: 60_000,
  })

export const useDefaultAddressQuery = () =>
  useQuery({
    queryKey: QK.default,
    queryFn: getDefaultAddress,
    staleTime: 60_000,
  })

export const useAddressQuery = (addressId: number) =>
  useQuery({
    queryKey: QK.detail(addressId),
    queryFn: () => getAddressById(addressId),
    enabled: !!addressId,
    staleTime: 60_000,
  })

export const useAddAddressMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddressRequestDTO) => addAddress(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
      qc.invalidateQueries({ queryKey: QK.default })
    },
  })
}

export const useUpdateAddressMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { addressId: number; payload: AddressRequestDTO }) =>
      updateAddress(vars.addressId, vars.payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: QK.list })
      qc.invalidateQueries({ queryKey: QK.detail(vars.addressId) })
      qc.invalidateQueries({ queryKey: QK.default })
    },
  })
}

export const useChangeDefaultMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (addressId: number) => changeDefaultAddress(addressId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
      qc.invalidateQueries({ queryKey: QK.default })
    },
  })
}

export const useDeleteAddressMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (addressId: number) => deleteAddress(addressId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
      qc.invalidateQueries({ queryKey: QK.default })
    },
  })
}

export type { AddressDTO, AddressRequestDTO }