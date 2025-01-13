export interface AuditLog {
  id?: string;
  timestamp: Date;
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent?: string;
  status: 'success' | 'failure';
  details?: string;
  method: string;
  path: string;
  requestId?: string;
}
