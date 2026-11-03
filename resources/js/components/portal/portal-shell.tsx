import { Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { IconName } from '@/components/portal/ui';
import { Icon, Toast } from '@/components/portal/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/portal';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';

export type NavItem<T extends string> = {
    id: T;
    label: string;
    icon: IconName;
    badge?: string | number;
    badgeTone?: 'danger' | 'success';
};

export type NavGroup<T extends string> = {
    label: string;
    items: NavItem<T>[];
};

type PortalShellProps<T extends string> = {
    groups: NavGroup<T>[];
    active: T;
    onNavigate: (id: T) => void;
    brandTagline?: string;
    collapsible?: boolean;
    crumb?: string;
    title: string;
    headerActions?: ReactNode;
    toast: string;
    showFooter?: boolean;
    children: ReactNode;
};

export default function PortalShell<T extends string>({
    groups,
    active,
    onNavigate,
    brandTagline,
    collapsible = true,
    crumb,
    title,
    headerActions,
    toast,
    showFooter = true,
    children,
}: PortalShellProps<T>) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const collapsed = collapsible && isCollapsed;

    return (
        <div
            className={cn(
                'grid min-h-screen grid-cols-[minmax(0,1fr)] bg-portal-canvas font-jakarta text-sm text-portal-ink antialiased',
                collapsed
                    ? 'lg:grid-cols-[76px_minmax(0,1fr)]'
                    : 'lg:grid-cols-[248px_minmax(0,1fr)]',
            )}
        >
            <aside className="sticky top-0 z-5 flex flex-row gap-[22px] self-start overflow-x-auto border-b border-portal-line bg-portal-rail px-3.5 py-5 lg:h-screen lg:flex-col lg:border-r lg:border-b-0">
                <div className="flex flex-none items-center gap-2.5 px-2 pt-0.5 pb-1.5">
                    <span className="grid size-8 flex-none place-items-center rounded-[9px] bg-portal-ink text-[15px] font-extrabold text-white">
                        M
                    </span>
                    {!collapsed && (
                        <span className="flex flex-col leading-[1.15]">
                            <span className="text-[19px] font-bold tracking-[-0.02em]">
                                Maison243
                            </span>
                            {brandTagline && (
                                <span className="text-[11px] font-semibold text-portal-accent">
                                    {brandTagline}
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {groups.map((group) => (
                    <div
                        key={group.label}
                        className="flex flex-none flex-col gap-2"
                    >
                        {!collapsed && (
                            <div className="hidden px-3 text-xs text-portal-subtle lg:block">
                                {group.label}
                            </div>
                        )}
                        <nav
                            aria-label={group.label}
                            className="flex flex-row gap-0.5 lg:flex-col"
                        >
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    title={item.label}
                                    aria-current={
                                        active === item.id ? 'page' : undefined
                                    }
                                    onClick={() => onNavigate(item.id)}
                                    className={cn(
                                        'relative flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-left text-sm font-medium whitespace-nowrap hover:bg-portal-hover hover:text-portal-ink',
                                        collapsed
                                            ? 'justify-center'
                                            : 'justify-start',
                                        active === item.id
                                            ? 'bg-portal-hover text-portal-ink'
                                            : 'text-portal-muted',
                                    )}
                                >
                                    <Icon name={item.icon} />
                                    {collapsed ? (
                                        <span className="sr-only">
                                            {item.label}
                                        </span>
                                    ) : (
                                        <span className="flex-1">
                                            {item.label}
                                        </span>
                                    )}
                                    {item.badge !== undefined &&
                                        item.badge !== '' &&
                                        item.badge !== 0 && (
                                            <span
                                                className={cn(
                                                    'grid h-5 min-w-5 place-items-center rounded-[10px] px-[7px] text-[11px] font-bold',
                                                    collapsed &&
                                                        'absolute top-1 right-1.5',
                                                    item.badgeTone === 'success'
                                                        ? 'bg-portal-success-bg text-portal-success'
                                                        : 'bg-portal-danger text-white',
                                                )}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                </button>
                            ))}
                        </nav>
                    </div>
                ))}

                {collapsible && (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-expanded={!collapsed}
                        className={cn(
                            'mt-auto hidden cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-[13px] font-medium text-portal-muted hover:bg-portal-hover hover:text-portal-ink lg:flex',
                            collapsed ? 'justify-center' : 'justify-start',
                        )}
                    >
                        <Icon
                            name={collapsed ? 'chevronRight' : 'chevronLeft'}
                        />
                        {collapsed ? (
                            <span className="sr-only">Expand menu</span>
                        ) : (
                            <span>Collapse menu</span>
                        )}
                    </button>
                )}
            </aside>

            <main className="flex min-w-0 flex-col">
                <header className="top-0 z-4 flex min-h-[72px] items-center gap-4 border-b border-portal-line bg-white px-7 py-3 lg:sticky">
                    <div className="min-w-0 flex-1">
                        {crumb && (
                            <div className="text-xs text-portal-subtle">
                                {crumb}
                            </div>
                        )}
                        <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em]">
                            {title}
                        </h1>
                    </div>
                    {headerActions}
                </header>

                <div className="flex flex-1 flex-col gap-5 p-4 lg:px-7 lg:py-6">
                    {children}
                    {showFooter && (
                        <div className="mt-auto pt-3 text-xs text-portal-subtle">
                            © Maison243 2026
                        </div>
                    )}
                </div>
            </main>

            <Toast message={toast} />
        </div>
    );
}

/** The signed-in person's account menu at the right of the portal header. */
export function HeaderPerson({
    role,
    onProfile,
}: {
    role: string;
    onProfile?: () => void;
}) {
    const { auth } = usePage().props;
    const name = auth.user?.name ?? '';
    const itemClass =
        'flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-portal-ink';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                data-test="portal-user-menu"
                className="flex cursor-pointer items-center gap-2.5 rounded-[10px] p-1 text-portal-ink outline-none hover:bg-portal-soft focus-visible:ring-2 focus-visible:ring-portal-accent data-[state=open]:bg-portal-soft"
            >
                <span className="grid size-[38px] flex-none place-items-center rounded-full bg-portal-accent-soft text-[13px] font-bold text-portal-accent-text">
                    {initials(name)}
                </span>
                <span className="hidden flex-col text-left leading-[1.25] min-[1100px]:flex">
                    <span className="text-sm font-semibold">{name}</span>
                    <span className="text-xs text-portal-subtle">{role}</span>
                </span>
                <Icon name="chevronDown" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-60 rounded-[10px] border-portal-line font-jakarta"
            >
                <DropdownMenuLabel className="flex flex-col px-2.5 py-2 font-normal leading-[1.3]">
                    <span className="text-sm font-semibold text-portal-ink">
                        {name}
                    </span>
                    <span className="truncate text-xs text-portal-subtle">
                        {auth.user?.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onProfile && (
                    <DropdownMenuItem className={itemClass} onSelect={onProfile}>
                        <Icon name="user" />
                        My profile
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href={editProfile()} className={itemClass}>
                        <Icon name="settings" />
                        Account settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        as="button"
                        onClick={() => router.flushAll()}
                        data-test="portal-logout-button"
                        className={itemClass}
                    >
                        <Icon name="logout" />
                        Log out
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
