import { useState } from 'react';
import {
    AreaIcon,
    BathIcon,
    BedIcon,
    GarageIcon,
    HeartIcon,
} from '@/components/site/icons';
import { cn } from '@/lib/utils';

type ListingStatsProps = {
    beds: number;
    baths: number;
    garages: number;
    size: string;
    className?: string;
    iconSize?: number;
};

export function ListingStats({
    beds,
    baths,
    garages,
    size,
    className,
    iconSize = 17,
}: ListingStatsProps) {
    const stats = [
        { icon: BedIcon, value: beds, label: 'Bedrooms' },
        { icon: BathIcon, value: baths, label: 'Bathrooms' },
        { icon: GarageIcon, value: garages, label: 'Garages' },
        { icon: AreaIcon, value: size, label: 'Floor size' },
    ];

    return (
        <div className={cn('flex flex-wrap gap-3.5', className)}>
            {stats.map(({ icon: Icon, value, label }) => (
                <span
                    key={label}
                    title={label}
                    className="flex items-center gap-[5px] font-semibold"
                >
                    <Icon size={iconSize} />
                    <span className="sr-only">{label}:</span>
                    {value}
                </span>
            ))}
        </div>
    );
}

type SaveButtonProps = {
    initiallySaved?: boolean;
    variant?: 'floating' | 'outlined';
    className?: string;
};

export function SaveButton({
    initiallySaved = false,
    variant = 'floating',
    className,
}: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initiallySaved);

    return (
        <button
            type="button"
            aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
            aria-pressed={isSaved}
            onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setIsSaved(!isSaved);
            }}
            className={cn(
                'flex cursor-pointer items-center justify-center text-m243-red',
                variant === 'floating'
                    ? 'size-[38px] rounded-full bg-white/92 shadow-[0_2px_8px_rgba(5,41,79,.18)]'
                    : 'size-[42px] rounded-lg border border-m243-line-strong bg-white hover:border-m243-red',
                className,
            )}
        >
            <HeartIcon
                size={variant === 'floating' ? 19 : 20}
                filled={isSaved}
            />
        </button>
    );
}
