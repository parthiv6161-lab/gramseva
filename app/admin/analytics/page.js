import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import AnalyticsDashboard from './ui';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  if (!await isAdmin()) redirect('/admin/login');
  return <AnalyticsDashboard/>;
}
