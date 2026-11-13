import './globals.css';
import SiteAnimations from './animations';

export const metadata = {
  title: 'GRAMASEVA | Rural Complaint Management System',
  description: 'A simple, transparent way to report local issues and help your village thrive.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><SiteAnimations/>{children}</body></html>;
}
