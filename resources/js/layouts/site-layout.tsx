import type { ReactNode } from 'react';
import SiteHeader from '@/components/site/site-header';

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white font-jakarta text-m243-ink antialiased selection:bg-m243-red selection:text-white">
            <SiteHeader />
            {children}
        </div>
    );
}
