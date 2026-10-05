import api from '../services/api';

export async function fetchKPIs(): Promise<Array<{ label: string; value: string | number }>> {
  const response = await api.get('/api/kpis');
  return response.data;
}

export async function fetchForecast(): Promise<Array<{ date: string; forecast: number }>> {
  const response = await api.get('/api/forecast');
  return response.data;
}

export async function fetchDataRecords(): Promise<Array<any>> {
  const response = await api.get('/api/data/records');
  return response.data;
}

export async function uploadFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload', formData);
  return response.data;
}

// =====================================
// MULTI-DEPARTMENT DATA INGESTION APIS
// =====================================

export async function fetchDepartments(): Promise<any[]> {
  const response = await api.get('/api/ingestion/departments');
  return response.data;
}

export async function validateDataset(formData: FormData): Promise<any> {
  const response = await api.post('/api/ingestion/validate', formData);
  return response.data;
}

export async function importDataset(formData: FormData): Promise<any> {
  const response = await api.post('/api/ingestion/import', formData);
  return response.data;
}

export async function fetchUploadHistory(): Promise<any[]> {
  const response = await api.get('/api/ingestion/history');
  return response.data;
}

// =====================================
// MULTI-DEPARTMENT ANALYTICS APIS
// =====================================

export async function fetchDepartmentStatus(): Promise<Record<string, { has_data: boolean; count: number }>> {
  const response = await api.get('/api/analytics/status');
  return response.data;
}

export async function fetchExecutiveOverview(): Promise<any> {
  const response = await api.get('/api/analytics/executive');
  return response.data;
}

export async function fetchDepartmentAnalytics(department: string): Promise<any> {
  const response = await api.get(`/api/analytics/${department.toLowerCase()}`);
  return response.data;
}

export async function fetchDepartmentRecords(department: string, page = 1, limit = 50, search = ''): Promise<any> {
  const params: any = { page, limit };
  if (search) params.search = search;
  const response = await api.get(`/api/analytics/records/${department}`, { params });
  return response.data;
}

// =====================================
// MULTI-DEPARTMENT PREDICTIVE APIS
// =====================================

export async function predictRevenue(unitsSold: number, profitMargin: number): Promise<any> {
  const response = await api.post('/api/predict', {
    order_id: 'SIM-001',
    date: new Date().toISOString().split('T')[0],
    region: 'North America',
    category: 'Enterprise',
    product: 'Software Suite',
    units_sold: unitsSold,
    revenue: 0,
    profit_margin: profitMargin,
    customer_role: 'Corporate',
  });
  return response.data;
}

export async function predictCustomerChurn(data: { age: number; total_orders: number; total_spend: number; days_since_last_purchase: number }): Promise<any> {
  const response = await api.post('/api/predict/churn', data);
  return response.data;
}

export async function predictStockout(data: { product_name: string; stock_quantity: number; daily_run_rate: number; lead_time_days: number }): Promise<any> {
  const response = await api.post('/api/predict/stockout', data);
  return response.data;
}

export async function predictMarketing(data: { channel: string; marketing_spend: number; target_customers: number }): Promise<any> {
  const response = await api.post('/api/predict/marketing', data);
  return response.data;
}

// =====================================
// REPORTS EXPORT
// =====================================

export async function exportReportFile(department: string, format: 'pdf' | 'excel'): Promise<Blob> {
  const response = await api.get('/api/reports/export', {
    params: { department, format },
    responseType: 'blob',
  });
  return response.data;
}
