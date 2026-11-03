import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({
    size = 18,
    strokeWidth = 1.8,
    children,
    ...props
}: IconProps & { children: ReactNode }) {
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
            {...props}
        >
            {children}
        </svg>
    );
}

export const HouseIcon = (props: IconProps) => (
    <Svg {...props}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M10 20v-5.5h4V20" />
    </Svg>
);

export const BedIcon = (props: IconProps) => (
    <Svg {...props}>
        <path d="M3 18v-5h18v5" />
        <path d="M3 13V8" />
        <path d="M21 13v-2a3 3 0 0 0-3-3h-6v5" />
        <circle cx="7.5" cy="10" r="1.8" />
    </Svg>
);

export const BathIcon = (props: IconProps) => (
    <Svg {...props}>
        <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
        <path d="M7 12V6a2 2 0 0 1 4 0" />
    </Svg>
);

export const GarageIcon = (props: IconProps) => (
    <Svg {...props}>
        <path d="M5 17h14" />
        <path d="M6 17v-4l2-5h8l2 5v4" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
    </Svg>
);

export const AreaIcon = (props: IconProps) => (
    <Svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="1.5" />
        <path d="M8 4v3M4 8h3" />
    </Svg>
);

export const HeartIcon = ({
    filled,
    ...props
}: IconProps & { filled?: boolean }) => (
    <Svg strokeWidth={1.9} fill={filled ? 'currentColor' : 'none'} {...props}>
        <path d="M12 20s-7-4.6-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
    </Svg>
);

export const SearchIcon = (props: IconProps) => (
    <Svg strokeWidth={2} {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </Svg>
);

export const MapIcon = (props: IconProps) => (
    <Svg strokeWidth={1.9} {...props}>
        <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
        <path d="M9 4v13M15 6.5v13" />
    </Svg>
);

export const CloseIcon = (props: IconProps) => (
    <Svg strokeWidth={2} {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
);

export const MenuIcon = (props: IconProps) => (
    <Svg strokeWidth={2} {...props}>
        <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
);

export const ArrowRightIcon = (props: IconProps) => (
    <Svg strokeWidth={2.2} {...props}>
        <path d="M5 12h13m-5-6 6 6-6 6" />
    </Svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
    <Svg strokeWidth={2.1} {...props}>
        <path d="M14 6l-6 6 6 6" />
    </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
    <Svg strokeWidth={2.1} {...props}>
        <path d="M10 6l6 6-6 6" />
    </Svg>
);

export const CheckIcon = (props: IconProps) => (
    <Svg strokeWidth={2.2} {...props}>
        <path d="M4 12.5 9 17.5 20 6.5" />
    </Svg>
);

export const PlusIcon = (props: IconProps) => (
    <Svg strokeWidth={2.2} {...props}>
        <path d="M12 5v14M5 12h14" />
    </Svg>
);

export function Logo({ inverted = false }: { inverted?: boolean }) {
    return (
        <span className="flex flex-none items-center gap-2.5">
            <span
                className={
                    'flex size-[34px] flex-none items-center justify-center rounded-[9px] text-white ' +
                    (inverted ? 'bg-m243-red' : 'bg-m243-blue')
                }
            >
                <HouseIcon size={19} strokeWidth={2} />
            </span>
            {inverted ? (
                <span className="text-[19px] font-extrabold tracking-[-.02em] text-white">
                    Maison243
                </span>
            ) : (
                <span className="text-[23px] font-extrabold tracking-[-.03em] text-m243-blue">
                    maison<span className="text-m243-red">243</span>
                </span>
            )}
        </span>
    );
}
