// components/BreadcrumbNav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, ChevronRight } from 'lucide-react';

export default function BreadcrumbNav() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = paths.map((path, index) => ({
    name: path.charAt(0).toUpperCase() + path.slice(1),
    href: `/${paths.slice(0, index + 1).join('/')}`,
    current: index === paths.length - 1
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <Link href="/" className="text-gray-400 hover:text-gray-500">
            <HomeIcon className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbs.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <Link
                href={page.href}
                aria-current={page.current ? 'page' : undefined}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}