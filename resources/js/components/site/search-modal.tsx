import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    CheckIcon,
    CloseIcon,
    HouseIcon,
    PlusIcon,
    SearchIcon,
} from '@/components/site/icons';
import type { SearchMode } from '@/lib/listings';
import { cn } from '@/lib/utils';

type SearchModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: SearchMode;
    onModeChange: (mode: SearchMode) => void;
    areas: string[];
    onToggleArea: (area: string) => void;
    onSearch: () => void;
};

const suggestedAreas = ['Monument Park', 'Centurion', 'Lynnwood'];
const propertyTypes = ['All types', 'House', 'Apartment', 'Townhouse', 'Land'];
const countOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];
const featureOptions = [
    'Garden',
    'Flatlet',
    'Pets allowed',
    'Pool',
    'Sea view',
    'Staff quarters',
];
const securityOptions = [
    'Access gate',
    'Alarm',
    'Electric fencing',
    'Intercom',
    'Security post',
];
const generalOptions = ['Bank-assisted sales & repossessions', 'On show'];

const categories: { label: string; icon: ReactNode }[] = [
    { label: 'Residential', icon: <HouseIcon size={26} strokeWidth={1.7} /> },
    {
        label: 'Commercial',
        icon: (
            <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <rect x="5" y="3" width="14" height="18" />
                <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
            </svg>
        ),
    },
    {
        label: 'Farms',
        icon: (
            <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M3 11 12 5l9 6" />
                <path d="M5 11v9h14v-9" />
                <path d="M9 20v-5h6v5" />
            </svg>
        ),
    },
    {
        label: 'Developments',
        icon: (
            <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M4 21V7l6-3v17" />
                <path d="M10 10h10v11" />
                <path d="M14 14h1M14 17h1" />
            </svg>
        ),
    },
];

const toggled = (values: string[], value: string): string[] =>
    values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

function ToggleChip({
    isActive,
    onClick,
    children,
}: {
    isActive: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={onClick}
            className={cn(
                'flex cursor-pointer items-center gap-2 rounded-[5px] border px-4 py-[11px] text-[15px] font-semibold whitespace-nowrap',
                isActive
                    ? 'border-m243-blue bg-m243-sky text-m243-blue'
                    : 'border-m243-line-strong bg-white text-m243-ink',
            )}
        >
            {children}
        </button>
    );
}

function Checkbox({
    isChecked,
    onClick,
    label,
}: {
    isChecked: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            onClick={onClick}
            className="flex cursor-pointer items-center gap-[9px] py-1"
        >
            <span
                className={cn(
                    'flex size-[22px] flex-none items-center justify-center rounded border-2 text-white',
                    isChecked
                        ? 'border-m243-blue bg-m243-blue'
                        : 'border-m243-mist bg-white',
                )}
            >
                {isChecked && <CheckIcon size={14} strokeWidth={3} />}
            </span>
            <span className="text-[15.5px] font-semibold text-m243-ink">
                {label}
            </span>
        </button>
    );
}

function Segmented({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <div className="text-[15.5px] font-bold text-m243-navy">
                {label}
            </div>
            <div
                role="radiogroup"
                aria-label={label}
                className="mt-2 flex overflow-hidden rounded-md border border-m243-line-strong"
            >
                {countOptions.map((option) => (
                    <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={value === option}
                        onClick={() => onChange(option)}
                        className={cn(
                            'h-[50px] flex-1 cursor-pointer border-l border-m243-line-strong text-[15.5px] font-bold first:border-l-0',
                            value === option
                                ? 'bg-m243-sky text-m243-blue'
                                : 'bg-white text-m243-slate',
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

function RangeSelect({ label, options }: { label: string; options: string[] }) {
    return (
        <label className="block">
            <span className="text-[15.5px] font-bold text-m243-navy">
                {label}
            </span>
            <select
                defaultValue="Any"
                className="mt-2 h-[52px] w-full cursor-pointer appearance-none rounded-md border border-m243-line-strong bg-white px-3 text-base font-semibold text-m243-ink"
            >
                {['Any', ...options].map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </label>
    );
}

export default function SearchModal({
    open,
    onOpenChange,
    mode,
    onModeChange,
    areas,
    onToggleArea,
    onSearch,
}: SearchModalProps) {
    const [category, setCategory] = useState('Residential');
    const [types, setTypes] = useState<string[]>(['All types']);
    const [counts, setCounts] = useState<Record<string, string>>({});
    const [features, setFeatures] = useState<string[]>([]);
    const [security, setSecurity] = useState<string[]>([]);
    const [general, setGeneral] = useState<string[]>([]);
    const [includeSold, setIncludeSold] = useState(true);

    const toggleType = (type: string): void => {
        if (type === 'All types') {
            setTypes(['All types']);

            return;
        }

        const picked = toggled(
            types.filter((item) => item !== 'All types'),
            type,
        );
        setTypes(picked.length ? picked : ['All types']);
    };

    const chipGroup = (
        title: string,
        options: string[],
        selected: string[],
        setSelected: (values: string[]) => void,
    ) => (
        <>
            <div className="mt-6 text-base font-bold text-m243-navy">
                {title}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
                {options.map((option) => (
                    <ToggleChip
                        key={option}
                        isActive={selected.includes(option)}
                        onClick={() => setSelected(toggled(selected, option))}
                    >
                        {option}
                    </ToggleChip>
                ))}
            </div>
        </>
    );

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[300] bg-m243-navy/55" />
                <Dialog.Content className="fixed top-3 left-1/2 z-[301] flex max-h-[88vh] w-[calc(100%-24px)] max-w-[880px] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] bg-white font-jakarta text-m243-ink shadow-[0_30px_80px_rgba(5,41,79,.45)] lg:top-[5vh] lg:w-[calc(100%-48px)]">
                    <Dialog.Title className="sr-only">
                        Search properties
                    </Dialog.Title>
                    <Dialog.Description className="sr-only">
                        Choose areas and filters, then search.
                    </Dialog.Description>
                    <div className="flex-none border-b border-m243-line px-6 pt-[18px]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-[26px]">
                                {(['buy', 'rent'] as const).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => onModeChange(option)}
                                        className={cn(
                                            'cursor-pointer border-b-[3px] px-0.5 pt-1 pb-3 text-[17px] font-bold capitalize',
                                            mode === option
                                                ? 'border-m243-red text-m243-navy'
                                                : 'border-transparent text-m243-slate',
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <Dialog.Close
                                aria-label="Close"
                                className="flex cursor-pointer p-1 text-m243-slate hover:text-m243-red"
                            >
                                <CloseIcon size={24} />
                            </Dialog.Close>
                        </div>
                        <div className="mt-4 mb-5 flex items-center gap-2.5 rounded-md border border-m243-line-strong py-1.5 pr-1.5 pl-3.5">
                            <SearchIcon
                                size={20}
                                className="flex-none text-m243-slate"
                            />
                            <input
                                type="text"
                                placeholder="Search city, suburb or area"
                                aria-label="Search city, suburb or area"
                                className="min-w-0 flex-1 border-0 bg-transparent text-[16.5px] font-medium text-m243-ink outline-none"
                            />
                            <button
                                type="button"
                                onClick={onSearch}
                                className="h-12 flex-none cursor-pointer rounded-[5px] bg-m243-red px-7 text-[16.5px] font-bold text-white hover:bg-m243-red-dark"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto px-6 pt-[22px] pb-7">
                        <div className="text-[12.5px] font-extrabold tracking-[.08em] text-m243-steel uppercase">
                            Suggested areas
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2.5">
                            {suggestedAreas.map((area) => (
                                <ToggleChip
                                    key={area}
                                    isActive={areas.includes(area)}
                                    onClick={() => onToggleArea(area)}
                                >
                                    <PlusIcon size={16} />
                                    {area}
                                </ToggleChip>
                            ))}
                        </div>

                        <div className="mt-[22px] grid grid-cols-2 overflow-hidden rounded-md border border-m243-line lg:grid-cols-4">
                            {categories.map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    aria-pressed={category === item.label}
                                    onClick={() => setCategory(item.label)}
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center justify-center gap-2 border-r border-m243-line px-2.5 py-[18px] text-[15.5px] font-bold',
                                        category === item.label
                                            ? 'bg-m243-sky text-m243-blue'
                                            : 'bg-white text-m243-slate',
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-[26px] text-base font-bold text-m243-navy">
                            Property type
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                            {propertyTypes.map((type) => (
                                <Checkbox
                                    key={type}
                                    label={type}
                                    isChecked={types.includes(type)}
                                    onClick={() => toggleType(type)}
                                />
                            ))}
                        </div>

                        <div className="mt-6 grid gap-[18px] lg:grid-cols-2">
                            <RangeSelect
                                label="Min price"
                                options={[
                                    'R 500 000',
                                    'R 950 000',
                                    'R 1 500 000',
                                    'R 2 500 000',
                                ]}
                            />
                            <RangeSelect
                                label="Max price"
                                options={[
                                    'R 1 500 000',
                                    'R 2 500 000',
                                    'R 5 000 000',
                                    'R 10 000 000+',
                                ]}
                            />
                            {[
                                'Bedrooms',
                                'Bathrooms',
                                'Garages',
                                'Parkings',
                            ].map((label) => (
                                <Segmented
                                    key={label}
                                    label={label}
                                    value={counts[label] ?? 'Any'}
                                    onChange={(value) =>
                                        setCounts({ ...counts, [label]: value })
                                    }
                                />
                            ))}
                            <RangeSelect
                                label="Min floor size"
                                options={[
                                    '60 m²',
                                    '100 m²',
                                    '200 m²',
                                    '400 m²',
                                ]}
                            />
                            <RangeSelect
                                label="Max floor size"
                                options={[
                                    '150 m²',
                                    '300 m²',
                                    '600 m²',
                                    '1 000 m²',
                                ]}
                            />
                            <RangeSelect
                                label="Min land size"
                                options={[
                                    '250 m²',
                                    '500 m²',
                                    '1 000 m²',
                                    '1 ha',
                                ]}
                            />
                            <RangeSelect
                                label="Max land size"
                                options={[
                                    '800 m²',
                                    '2 000 m²',
                                    '1 ha',
                                    '5 ha+',
                                ]}
                            />
                        </div>

                        {chipGroup(
                            'Features',
                            featureOptions,
                            features,
                            setFeatures,
                        )}
                        {chipGroup(
                            'Security',
                            securityOptions,
                            security,
                            setSecurity,
                        )}
                        {chipGroup(
                            'General',
                            generalOptions,
                            general,
                            setGeneral,
                        )}

                        <div className="mt-[26px] text-base font-bold text-m243-navy">
                            Property status
                        </div>
                        <div className="mt-3">
                            <Checkbox
                                label="Include under offer & sold"
                                isChecked={includeSold}
                                onClick={() => setIncludeSold(!includeSold)}
                            />
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
