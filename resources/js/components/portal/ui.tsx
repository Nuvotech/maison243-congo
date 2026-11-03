import * as Dialog from '@radix-ui/react-dialog';
import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tone } from '@/lib/portal';
import { statusTone } from '@/lib/portal';
import { cn } from '@/lib/utils';

/* ----------------------------------------------------------------- Icons */

export const iconPaths = {
    home: 'M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5M10 21v-6h4v6',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    shield: 'M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4',
    chart: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    card: 'M2 5h20v14H2zM2 10h20M6 15h4',
    help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
    team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    building: 'M4 21V4h10v17M14 9h6v12M7 8h3M7 12h3M7 16h3M2 21h20',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    briefcase: 'M4 8h16v12H4zM9 8V5h6v3M4 13h16',
    rand: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    plus: 'M12 5v14M5 12h14',
    check: 'M20 6 9 17l-5-5',
    close: 'M6 6l12 12M18 6 6 18',
    chevronDown: 'm6 9 6 6 6-6',
    chevronLeft: 'm15 18-6-6 6-6',
    chevronRight: 'm9 18 6-6-6-6',
    mail: 'M2 4h20v16H2zM22 6l-10 7L2 6',
    phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
    settings:
        'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
    pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    bed: 'M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9',
    bath: 'M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M2 12h20M7 19v2M17 19v2',
    area: 'M3 3h18v18H3zM3 9h6V3M15 21v-6h6',
    external: 'M7 17 17 7M8 7h9v9',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
} as const;

export type IconName = keyof typeof iconPaths;

export function Icon({
    name,
    size = 18,
    strokeWidth = 1.8,
    className,
}: {
    name: IconName;
    size?: number;
    strokeWidth?: number;
    className?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn('flex-none', className)}
        >
            <path d={iconPaths[name]} />
        </svg>
    );
}

/* --------------------------------------------------------------- Buttons */

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonSizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3',
    md: 'h-[38px] px-3.5',
    lg: 'h-[42px] px-3.5',
};

export const buttonClass = (
    variant: ButtonVariant = 'secondary',
    size: ButtonSize = 'md',
): string =>
    cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border text-[13px] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45',
        buttonSizes[size],
        variant === 'primary'
            ? 'border-portal-accent bg-portal-accent text-white hover:border-portal-accent-hover hover:bg-portal-accent-hover hover:text-white'
            : 'border-portal-input bg-white text-portal-ink hover:bg-portal-soft hover:text-portal-ink',
    );

export function Button({
    variant = 'secondary',
    size = 'md',
    className,
    type = 'button',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
}) {
    return (
        <button
            type={type}
            className={cn(buttonClass(variant, size), className)}
            {...props}
        />
    );
}

export type PortalAction = {
    label: string;
    run: () => void;
    primary?: boolean;
};

export function ActionButtons({
    actions,
    size = 'sm',
    className,
}: {
    actions: PortalAction[];
    size?: ButtonSize;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-wrap gap-1.5', className)}>
            {actions.map((action) => (
                <Button
                    key={action.label}
                    size={size}
                    variant={action.primary ? 'primary' : 'secondary'}
                    onClick={(event) => {
                        event.stopPropagation();
                        action.run();
                    }}
                >
                    {action.label}
                </Button>
            ))}
        </div>
    );
}

/* ---------------------------------------------------------------- Badges */

const toneClasses: Record<Tone, string> = {
    success: 'bg-portal-success-bg text-portal-success',
    warning: 'bg-portal-warning-bg text-portal-warning',
    error: 'bg-portal-error-bg text-portal-error',
    info: 'bg-portal-accent-tint text-portal-accent-text',
    neutral: 'bg-portal-neutral-bg text-portal-neutral',
};

export function Badge({
    tone,
    children,
    className,
}: {
    tone: Tone | 'dark' | 'white';
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-[3px] text-xs font-semibold whitespace-nowrap',
                tone === 'dark'
                    ? 'bg-portal-ink text-white'
                    : tone === 'white'
                      ? 'bg-white text-portal-ink'
                      : toneClasses[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}

export function StatusBadge({
    status,
    toneOverrides,
}: {
    status: string;
    toneOverrides?: Record<string, Tone>;
}) {
    return <Badge tone={statusTone(status, toneOverrides)}>{status}</Badge>;
}

/* ------------------------------------------------------------ Segmented */

export type SegmentOption<T extends string> = {
    value: T;
    label: string;
    count?: number;
};

export function Segmented<T extends string>({
    options,
    value,
    onChange,
    label,
}: {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label?: string;
}) {
    return (
        <div
            role="tablist"
            aria-label={label}
            className="flex flex-wrap gap-0.5 self-start rounded-[10px] bg-portal-hover p-1"
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={value === option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'flex cursor-pointer items-center gap-1.5 rounded-[7px] px-3 py-[7px] text-[13px] font-semibold',
                        value === option.value
                            ? 'bg-white text-portal-ink shadow-[0_1px_2px_rgba(20,22,27,.1)]'
                            : 'text-portal-muted',
                    )}
                >
                    {option.label}
                    {option.count !== undefined && (
                        <span className="font-medium text-portal-subtle">
                            {option.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

/* ---------------------------------------------------------------- Fields */

export const inputClass =
    'h-10 w-full rounded-[9px] border border-portal-input bg-white px-3 text-sm font-normal text-portal-ink outline-none focus:border-portal-accent focus:shadow-[0_0_0_3px_var(--color-portal-accent-soft)] disabled:bg-portal-soft disabled:text-portal-muted';

export function Field({
    label,
    hint,
    className,
    children,
}: {
    label: ReactNode;
    hint?: ReactNode;
    className?: string;
    children: ReactNode;
}) {
    return (
        <label
            className={cn(
                'flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold text-portal-body',
                className,
            )}
        >
            {label}
            {children}
            {hint && (
                <span className="text-xs font-medium text-portal-subtle">
                    {hint}
                </span>
            )}
        </label>
    );
}

export function TextInput({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={cn(inputClass, className)} {...props} />;
}

export function SelectInput({
    className,
    options,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
    options: (string | { value: string; label: string })[];
}) {
    return (
        <select className={cn(inputClass, className)} {...props}>
            {options.map((option) => {
                const item =
                    typeof option === 'string'
                        ? { value: option, label: option }
                        : option;

                return (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                );
            })}
        </select>
    );
}

export function TextArea({
    className,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                inputClass,
                'h-[110px] resize-y px-3 py-2.5 leading-normal',
                className,
            )}
            {...props}
        />
    );
}

export function SearchInput({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
}) {
    return (
        <div className={cn('relative w-[280px] max-w-full', className)}>
            <Icon
                name="search"
                size={16}
                strokeWidth={2}
                className="absolute top-3 left-3 text-portal-subtle"
            />
            <input
                type="search"
                value={value}
                placeholder={placeholder}
                aria-label={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={cn(inputClass, 'pl-9')}
            />
        </div>
    );
}

export function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={cn(
                'flex h-6 w-[42px] flex-none cursor-pointer rounded-xl p-[3px]',
                checked
                    ? 'justify-end bg-portal-accent'
                    : 'justify-start bg-[#d5d9e1]',
            )}
        >
            <span className="size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]" />
        </button>
    );
}

export function ErrorList({ errors }: { errors: string[] }) {
    if (!errors.length) {
        return null;
    }

    return (
        <div
            role="alert"
            className="flex flex-col gap-1 rounded-[10px] bg-portal-error-bg px-3.5 py-3 text-[13px] font-semibold text-portal-error"
        >
            {errors.map((error) => (
                <span key={error}>{error}</span>
            ))}
        </div>
    );
}

/* ----------------------------------------------------------------- Cards */

export function Card({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            className={cn(
                'rounded-[14px] border border-portal-line bg-white',
                className,
            )}
        >
            {children}
        </section>
    );
}

export function CardTitle({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <h3
            className={cn(
                'text-[17px] font-bold tracking-[-0.01em] text-portal-ink',
                className,
            )}
        >
            {children}
        </h3>
    );
}

export function Avatar({
    name,
    initials,
    size = 'md',
    square = false,
}: {
    name?: string;
    initials: string;
    size?: 'sm' | 'md' | 'lg';
    square?: boolean;
}) {
    return (
        <span
            aria-label={name}
            className={cn(
                'grid flex-none place-items-center bg-portal-accent-tint font-bold text-portal-accent-text',
                square ? 'rounded-[10px]' : 'rounded-full',
                size === 'sm' && 'size-8 text-xs',
                size === 'md' && 'size-[38px] text-[13px]',
                size === 'lg' && 'size-12 text-base',
            )}
        >
            {initials}
        </span>
    );
}

export function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-[14px] border border-portal-line bg-white p-[18px]">
            <span className="text-[13px] font-semibold text-portal-body">
                {label}
            </span>
            <span className="text-[28px] leading-none font-bold tracking-[-0.02em]">
                {value}
            </span>
            <span className="text-xs text-portal-subtle">{sub}</span>
        </div>
    );
}

/* ---------------------------------------------------------------- Tables */

export function Table({
    minWidth,
    children,
}: {
    minWidth: number;
    children: ReactNode;
}) {
    return (
        <div className="overflow-x-auto">
            <table
                style={{ minWidth }}
                className="w-full border-collapse text-sm"
            >
                {children}
            </table>
        </div>
    );
}

export function Th({
    children,
    align = 'left',
    className,
}: {
    children?: ReactNode;
    align?: 'left' | 'right';
    className?: string;
}) {
    return (
        <th
            className={cn(
                'border-b border-[#eef0f3] bg-portal-thead px-3.5 py-3 text-xs font-semibold whitespace-nowrap text-portal-head',
                align === 'right' ? 'text-right' : 'text-left',
                className,
            )}
        >
            {children}
        </th>
    );
}

export function Td({
    children,
    align = 'left',
    className,
}: {
    children?: ReactNode;
    align?: 'left' | 'right';
    className?: string;
}) {
    return (
        <td
            className={cn(
                'border-b border-portal-hair px-3.5 py-[13px] align-middle',
                align === 'right' && 'text-right',
                className,
            )}
        >
            {children}
        </td>
    );
}

export function CellText({
    main,
    sub,
    strong = false,
}: {
    main: ReactNode;
    sub?: ReactNode;
    strong?: boolean;
}) {
    return (
        <>
            <div className={cn('whitespace-nowrap', strong && 'font-semibold')}>
                {main}
            </div>
            {sub && (
                <div className="mt-0.5 text-xs whitespace-nowrap text-portal-subtle">
                    {sub}
                </div>
            )}
        </>
    );
}

export function Pagination({
    total,
    page,
    size,
    onPage,
    onSize,
}: {
    total: number;
    page: number;
    size: number;
    onPage: (page: number) => void;
    onSize: (size: number) => void;
}) {
    const pages = Math.max(1, Math.ceil(total / size));
    const start = (page - 1) * size;

    return (
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
            <span className="flex-1 text-[13px] text-portal-subtle">
                {total > 0 &&
                    `Showing ${start + 1}–${Math.min(start + size, total)} of ${total}`}
            </span>
            <label className="flex items-center gap-2 text-[13px] text-portal-muted">
                Rows
                <SelectInput
                    value={String(size)}
                    onChange={(event) => onSize(Number(event.target.value))}
                    options={['5', '10', '25']}
                    className="h-[34px] w-[72px]"
                />
            </label>
            <Button
                className="h-[34px]"
                disabled={page <= 1}
                onClick={() => onPage(page - 1)}
            >
                Previous
            </Button>
            {Array.from({ length: pages }, (_, index) => index + 1).map(
                (number) => (
                    <button
                        key={number}
                        type="button"
                        aria-current={number === page ? 'page' : undefined}
                        onClick={() => onPage(number)}
                        className={cn(
                            buttonClass(
                                number === page ? 'primary' : 'secondary',
                            ),
                            'h-[34px] min-w-[34px] justify-center px-2.5',
                        )}
                    >
                        {number}
                    </button>
                ),
            )}
            <Button
                className="h-[34px]"
                disabled={page >= pages}
                onClick={() => onPage(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}

/** Slices a list for the current page, clamping the page to the range. */
export function paginate<T>(
    items: T[],
    page: number,
    size: number,
): { rows: T[]; page: number } {
    const pages = Math.max(1, Math.ceil(items.length / size));
    const current = Math.min(page, pages);
    const start = (current - 1) * size;

    return { rows: items.slice(start, start + size), page: current };
}

/* ---------------------------------------------------------------- Dialog */

export function PortalDialog({
    open,
    onClose,
    title,
    description,
    children,
    error,
    cancelLabel = 'Cancel',
    confirmLabel,
    onConfirm,
    width = 520,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    error?: string;
    cancelLabel?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
    width?: number;
}) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-30 bg-portal-ink/36" />
                <Dialog.Content
                    style={{ width: `min(${width}px, calc(100% - 32px))` }}
                    className="fixed top-1/2 left-1/2 z-31 flex max-h-[calc(100vh-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 overflow-y-auto rounded-2xl bg-white p-6 font-jakarta text-sm text-portal-ink shadow-[0_24px_60px_rgba(20,22,27,.22)]"
                >
                    <Dialog.Title className="text-[19px] font-bold tracking-[-0.01em]">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description asChild>
                        <div
                            className={cn(
                                'leading-normal text-portal-muted',
                                !description && 'sr-only',
                            )}
                        >
                            {description ?? title}
                        </div>
                    </Dialog.Description>
                    {children}
                    {error && (
                        <div
                            role="alert"
                            className="text-[13px] font-semibold text-portal-error"
                        >
                            {error}
                        </div>
                    )}
                    <div className="mt-1.5 flex justify-end gap-2">
                        <Button className="h-10" onClick={onClose}>
                            {cancelLabel}
                        </Button>
                        {confirmLabel && onConfirm && (
                            <Button
                                variant="primary"
                                className="h-10"
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export function ChoiceCard({
    selected,
    onSelect,
    title,
    meta,
    price,
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    meta: string;
    price: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
                'flex cursor-pointer items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-portal-ink',
                selected
                    ? 'border-2 border-portal-accent bg-portal-accent-wash'
                    : 'border border-portal-input bg-white',
            )}
        >
            <span
                className={cn(
                    'size-[18px] flex-none rounded-full bg-white',
                    selected
                        ? 'border-[5px] border-portal-accent'
                        : 'border-[1.5px] border-[#c5cad4]',
                )}
            />
            <span className="flex flex-1 flex-col gap-0.5">
                <span className="font-bold">{title}</span>
                <span className="text-xs text-portal-head">{meta}</span>
            </span>
            <span className="font-bold whitespace-nowrap">{price}</span>
        </button>
    );
}

/* ----------------------------------------------------------------- Toast */

export function useFlash(duration = 2600) {
    const [message, setMessage] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const flash = useCallback(
        (text: string) => {
            clearTimeout(timer.current);
            setMessage(text);
            timer.current = setTimeout(() => setMessage(''), duration);
        },
        [duration],
    );

    return { message, flash };
}

export function Toast({ message }: { message: string }) {
    return (
        <div aria-live="polite" className="contents">
            {message && (
                <div className="fixed bottom-6 left-1/2 z-40 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2.5 rounded-xl bg-portal-ink px-4 py-3 font-jakarta text-sm font-semibold text-white shadow-[0_12px_30px_rgba(20,22,27,.25)]">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d={iconPaths.check} />
                    </svg>
                    {message}
                </div>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------- Photos */

export function PhotoSlot({ label }: { label: string }) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(
        () => () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        },
        [preview],
    );

    return (
        <label className="relative flex h-[130px] cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[#cfd4dd] bg-[#eef0f4] text-[13px] font-semibold text-portal-subtle hover:border-portal-accent">
            {preview ? (
                <img
                    src={preview}
                    alt={label}
                    className="absolute inset-0 size-full object-cover"
                />
            ) : (
                <span className="flex flex-col items-center gap-1.5">
                    <Icon name="plus" size={18} />
                    {label}
                </span>
            )}
            <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label={label}
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        setPreview(URL.createObjectURL(file));
                    }
                }}
            />
        </label>
    );
}
