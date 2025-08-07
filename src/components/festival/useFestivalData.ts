import { useQuery } from '@tanstack/react-query';
import type { Festival } from '@/models/festival/FestivalType';
import { fetchFestivalCategories, fetchFestivalsByCategory } from '@/shared/api/festival/FestivalApi';

export const useFestivalCategories = () =>
  useQuery({
    queryKey: ['festivalCategories'],
    queryFn: fetchFestivalCategories,
  });

export const useFestivalsByCategory = (category: string) =>
  useQuery<Festival[]>({
    queryKey: ['festivalList', category],
    queryFn: () => fetchFestivalsByCategory(category),
    enabled: !!category,
  });