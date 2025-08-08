// shared/api/festival/FestivalApi.ts
import axios from 'axios';
import type { Festival } from '@models/festival/FestivalType';

export const getFestivals = async (): Promise<Festival[]> => {
  const res = await axios.get('/api/festival');
  return res.data.data.content;
};

export const getFestivalViews = async (id: string): Promise<number> => {
  const res = await axios.get(`/api/festival/views/${id}`);
  return res.data.data;
};

export const getFestivalCategories = async (): Promise<string[]> => {
  const res = await axios.get('/api/festival/categories');
  return res.data.data; // SuccessResponse<List<String>>
};