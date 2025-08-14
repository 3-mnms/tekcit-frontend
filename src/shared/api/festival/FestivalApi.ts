// shared/api/festival/FestivalApi.ts
import axios from 'axios';
import type { Festival } from '@models/festival/FestivalType';

export const getFestivals = async (): Promise<Festival[]> => {
  const res = await axios.get('/api/festival');
  console.log("페스티벌", res.data.data);
  return res.data.data.content;
};

export const getFestivalViews = async (fid: string): Promise<number> => {
  const res = await axios.get(`/api/festival/views/${fid}`);
  return res.data.data;
};

export const getFestivalCategories = async (): Promise<string[]> => {
  const res = await axios.get('/api/festival/categories');
    console.log("페스티벌 카테고리", res.data.data);
  return res.data.data; // SuccessResponse<List<String>>
};