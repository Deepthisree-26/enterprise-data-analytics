import api from '../services/api';

export async function fetchKPIs(): Promise<Array<{ label: string; value: string | number }>> {
  const response = await api.get('/api/kpis'); // assume endpoint returns array of {label,value}
  return response.data;
}

export async function fetchForecast(): Promise<Array<{ date: string; forecast: number }>> {
  const response = await api.get('/api/forecast'); // assume endpoint returns forecast data
  return response.data;
}

export async function fetchDataRecords(): Promise<Array<any>> {
  const response = await api.get('/api/data/records'); // list all records
  return response.data;
}

export async function uploadFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  // Do NOT manually specify Content-Type: multipart/form-data so Axios/browser automatically appends boundary
  const response = await api.post('/api/upload', formData);
  return response.data;
}
