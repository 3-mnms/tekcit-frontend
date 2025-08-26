// src/models/user/tanstack-query/useAddress.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAddresses,
  addAddress,
  updateAddress,
  changeDefaultAddress,
  deleteAddress,
  type AddressDTO,
  type AddressRequestDTO,
} from '@/shared/api/auth/address'

const QK = {
  list: ['addresses'] as const,
}

export const useAddressesQuery = () =>
  useQuery({
    queryKey: QK.list,
    queryFn: getAddresses,
    staleTime: 60_000,
  })

export const useAddAddressMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddressRequestDTO) => addAddress(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
    },
  })
}

export const useUpdateAddressMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { addressId: number; payload: AddressRequestDTO }) =>
      updateAddress(vars.addressId, vars.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
    },
  })
}

export const useChangeDefaultMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (addressId: number) => changeDefaultAddress(addressId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
    },
  })
}

export const useDeleteAddressMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (addressId: number) => deleteAddress(addressId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list })
    },
  })
}

export type { AddressDTO, AddressRequestDTO }
