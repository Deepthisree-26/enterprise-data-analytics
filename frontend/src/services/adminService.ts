import api from './api';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  full_name?: string;
  department?: string;
  created_at?: string;
  last_login?: string;
}

export interface AdminOverviewData {
  kpis: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    total_departments: number;
    total_datasets: number;
    total_records: number;
    total_uploads: number;
    system_status: string;
    quality_pass_rate: number;
  };
  recent_user_activity: Array<{
    id: number;
    username: string;
    activity_type: string;
    role?: string;
    department?: string;
    status: string;
    timestamp: string;
    details?: string;
  }>;
  recent_uploads: Array<{
    id: number;
    file_name: string;
    department: string;
    dataset_type: string;
    uploaded_by: string;
    upload_timestamp: string;
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    status: string;
  }>;
  data_quality_summary: {
    total_checked: number;
    valid_records: number;
    invalid_records: number;
    warnings_total: number;
    quality_rate: number;
  };
  recent_audit: Array<{
    id: number;
    user: string;
    action: string;
    resource?: string;
    status: string;
    details?: string;
    timestamp: string;
  }>;
  system_alerts: Array<{
    id: number;
    title: string;
    severity: string;
    category: string;
    department?: string;
    message: string;
    status: string;
    created_at: string;
  }>;
  department_data_status: Array<{
    department: string;
    record_count: number;
    has_data: boolean;
    is_active: boolean;
    last_upload: string;
    last_file: string;
    status: string;
  }>;
}

export interface RoleAccessControl {
  [role: string]: {
    title: string;
    description: string;
    permissions: string[];
    routes: string[];
    user_count: number;
    active_count: number;
  };
}

export interface DepartmentItem {
  name: string;
  description: string;
  user_count: number;
  dataset_count: number;
  record_count: number;
  last_upload: string;
  is_active: boolean;
  data_status: string;
}

export interface DatasetItem {
  id: number;
  dataset_name: string;
  department: string;
  dataset_type: string;
  uploaded_by: string;
  upload_timestamp: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  warnings_count: number;
  status: string;
  validation_status: string;
  import_status: string;
}

export interface SystemHealthData {
  status: string;
  checked_at: string;
  services: Array<{
    name: string;
    category: string;
    status: string;
    latency_ms: number;
    endpoint: string;
    details: string;
  }>;
}

// ==========================================
// API CLIENT CALLS
// ==========================================

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  const resp = await api.get('/api/admin/overview');
  return resp.data;
}

export async function fetchAdminUsers(params?: {
  q?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}): Promise<AdminUser[]> {
  const resp = await api.get('/api/admin/users', { params });
  return resp.data;
}

export async function createAdminUser(data: {
  username: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  full_name?: string;
}): Promise<{ message: string; user_id: number }> {
  const resp = await api.post('/api/admin/users', data);
  return resp.data;
}

export async function updateAdminUser(
  userId: number,
  data: {
    role?: string;
    department?: string;
    full_name?: string;
    is_active?: boolean;
    password?: string;
  }
): Promise<{ message: string }> {
  const resp = await api.put(`/api/admin/users/${userId}`, data);
  return resp.data;
}

export async function toggleAdminUserStatus(userId: number, is_active: boolean): Promise<{ message: string }> {
  const resp = await api.patch(`/api/admin/users/${userId}/status`, { is_active });
  return resp.data;
}

export async function resetAdminUserPassword(userId: number, new_password: string): Promise<{ message: string }> {
  const resp = await api.post(`/api/admin/users/${userId}/reset-password`, { new_password });
  return resp.data;
}

export async function deleteAdminUser(userId: number): Promise<{ message: string }> {
  const resp = await api.delete(`/api/admin/users/${userId}`);
  return resp.data;
}

export async function fetchRoleAccessControl(): Promise<RoleAccessControl> {
  const resp = await api.get('/api/admin/access-control');
  return resp.data;
}

export async function fetchAdminDepartments(): Promise<DepartmentItem[]> {
  const resp = await api.get('/api/admin/departments');
  return resp.data;
}

export async function toggleDepartmentStatus(name: string, is_active: boolean): Promise<{ message: string }> {
  const resp = await api.patch(`/api/admin/departments/${name}/status`, { is_active });
  return resp.data;
}

export async function fetchAdminDatasets(params?: {
  department?: string;
  status_filter?: string;
  q?: string;
}): Promise<DatasetItem[]> {
  const resp = await api.get('/api/admin/datasets', { params });
  return resp.data;
}

export async function fetchDatasetPreview(id: number): Promise<any> {
  const resp = await api.get(`/api/admin/datasets/${id}/preview`);
  return resp.data;
}

export async function deleteAdminDataset(id: number): Promise<{ message: string }> {
  const resp = await api.delete(`/api/admin/datasets/${id}`);
  return resp.data;
}

export async function fetchAdminUploadHistory(params?: {
  q?: string;
  department?: string;
  dataset_type?: string;
  uploaded_by?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: any[]; total: number; page: number; pages: number }> {
  const resp = await api.get('/api/admin/upload-history', { params });
  return resp.data;
}

export async function fetchAdminDataQuality(): Promise<any> {
  const resp = await api.get('/api/admin/data-quality');
  return resp.data;
}

export async function fetchAdminAuditLogs(params?: {
  q?: string;
  action?: string;
  status?: string;
  user?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: any[]; total: number; page: number; pages: number }> {
  const resp = await api.get('/api/admin/audit-logs', { params });
  return resp.data;
}

export async function fetchAdminActivity(params?: {
  username?: string;
  role?: string;
  activity_type?: string;
  page?: number;
  limit?: number;
}): Promise<{ summary: any; items: any[]; total: number; page: number; pages: number }> {
  const resp = await api.get('/api/admin/activity', { params });
  return resp.data;
}

export async function fetchSystemHealth(): Promise<SystemHealthData> {
  const resp = await api.get('/api/admin/system-health');
  return resp.data;
}

export async function fetchAdminAlerts(params?: { status?: string; severity?: string }): Promise<any[]> {
  const resp = await api.get('/api/admin/alerts', { params });
  return resp.data;
}

export async function updateAdminAlertStatus(id: number, status: 'open' | 'acknowledged' | 'resolved'): Promise<{ message: string }> {
  const resp = await api.patch(`/api/admin/alerts/${id}/status`, { status });
  return resp.data;
}

export async function createAdminAlert(data: {
  title: string;
  message: string;
  severity: string;
  category: string;
  department?: string;
}): Promise<{ message: string; id: number }> {
  const resp = await api.post('/api/admin/alerts', data);
  return resp.data;
}

export async function fetchAdminReportsData(report_type: string): Promise<any> {
  const resp = await api.get('/api/admin/reports/data', { params: { report_type } });
  return resp.data;
}

export async function exportAdminReport(report_type: string, format: 'excel' | 'pdf'): Promise<void> {
  const resp = await api.get('/api/admin/reports/export', {
    params: { report_type, format },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([resp.data]));
  const link = document.createElement('a');
  link.href = url;
  const ext = format === 'excel' ? 'xlsx' : 'pdf';
  link.setAttribute('download', `admin_${report_type}_report.${ext}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function fetchAdminSettings(): Promise<Record<string, { value: string; category: string; description: string }>> {
  const resp = await api.get('/api/admin/settings');
  return resp.data;
}

export async function updateAdminSettings(settings: Record<string, string>): Promise<{ message: string; updated: string[] }> {
  const resp = await api.put('/api/admin/settings', settings);
  return resp.data;
}
