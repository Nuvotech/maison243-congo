const navy = '#05294F';
const blue = '#0A5FC2';
const red = '#CE1021';
const yellow = '#F7D618';
const sky = '#E3EFFC';
const labelFont = {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontWeight: 800,
};

function Frame({ children }: { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 400 240"
            width="100%"
            height="240"
            preserveAspectRatio="xMidYMid meet"
            className="block"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export function BuyIllustration() {
    return (
        <Frame>
            <circle cx="300" cy="92" r="48" fill={yellow} opacity=".38" />
            <ellipse
                cx="108"
                cy="72"
                rx="34"
                ry="12"
                fill="#fff"
                opacity=".85"
            />
            <ellipse
                cx="132"
                cy="66"
                rx="22"
                ry="10"
                fill="#fff"
                opacity=".85"
            />
            <polygon points="136,126 202,74 268,126" fill={blue} />
            <rect x="236" y="80" width="15" height="28" fill={navy} />
            <rect
                x="152"
                y="124"
                width="140"
                height="76"
                fill="#fff"
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect
                x="166"
                y="140"
                width="32"
                height="28"
                fill={sky}
                stroke={navy}
                strokeWidth="2.5"
            />
            <path d="M182 140v28M166 154h32" stroke={navy} strokeWidth="2" />
            <rect
                x="208"
                y="150"
                width="26"
                height="50"
                fill={blue}
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect
                x="244"
                y="152"
                width="44"
                height="48"
                fill={yellow}
                stroke={navy}
                strokeWidth="2.5"
            />
            <path
                d="M244 164h44M244 176h44M244 188h44"
                stroke={navy}
                strokeWidth="1.6"
                opacity=".55"
            />
            <rect x="96" y="132" width="5" height="68" fill={navy} />
            <rect x="68" y="124" width="56" height="36" fill={red} />
            <text x="76" y="140" fontSize="12" fill="#fff" style={labelFont}>
                FOR
            </text>
            <text x="76" y="153" fontSize="12" fill="#fff" style={labelFont}>
                SALE
            </text>
            <circle cx="126" cy="196" r="16" fill={blue} opacity=".18" />
            <circle cx="146" cy="198" r="11" fill={blue} opacity=".25" />
            <circle cx="300" cy="196" r="14" fill={blue} opacity=".18" />
            <path d="M40 200h330" stroke={navy} strokeWidth="2.5" />
        </Frame>
    );
}

export function RentIllustration() {
    return (
        <Frame>
            <ellipse
                cx="300"
                cy="70"
                rx="36"
                ry="13"
                fill="#fff"
                opacity=".9"
            />
            <ellipse
                cx="272"
                cy="64"
                rx="22"
                ry="10"
                fill="#fff"
                opacity=".9"
            />
            <rect
                x="316"
                y="92"
                width="30"
                height="108"
                fill={sky}
                stroke={navy}
                strokeWidth="2.5"
            />
            <circle cx="331" cy="110" r="4" fill={navy} opacity=".5" />
            <circle cx="331" cy="126" r="4" fill={navy} opacity=".5" />
            <rect
                x="196"
                y="76"
                width="124"
                height="124"
                fill="#fff"
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect x="192" y="66" width="132" height="10" fill={blue} />
            <rect
                x="208"
                y="90"
                width="26"
                height="24"
                fill={sky}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="244"
                y="90"
                width="26"
                height="24"
                fill={yellow}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="280"
                y="90"
                width="26"
                height="24"
                fill={sky}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="208"
                y="126"
                width="26"
                height="24"
                fill={yellow}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="244"
                y="126"
                width="26"
                height="24"
                fill={sky}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="280"
                y="126"
                width="26"
                height="24"
                fill={sky}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="208"
                y="162"
                width="62"
                height="38"
                fill={sky}
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect
                x="282"
                y="162"
                width="24"
                height="38"
                fill={blue}
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect
                x="62"
                y="140"
                width="96"
                height="44"
                fill={yellow}
                stroke={navy}
                strokeWidth="2.5"
            />
            <path
                d="M62 140h-14l-10 18v26h24"
                fill={yellow}
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect x="86" y="148" width="50" height="22" fill={red} />
            <text x="92" y="165" fontSize="13" fill="#fff" style={labelFont}>
                RENT
            </text>
            <circle cx="60" cy="188" r="12" fill={navy} />
            <circle cx="138" cy="188" r="12" fill={navy} />
            <rect
                x="164"
                y="168"
                width="24"
                height="20"
                fill={yellow}
                stroke={navy}
                strokeWidth="2"
            />
            <rect
                x="170"
                y="186"
                width="20"
                height="14"
                fill="#fff"
                stroke={navy}
                strokeWidth="2"
            />
            <path d="M24 200h350" stroke={navy} strokeWidth="2.5" />
        </Frame>
    );
}

export function SellIllustration() {
    return (
        <Frame>
            <circle cx="304" cy="140" r="44" fill={red} opacity=".14" />
            <circle cx="104" cy="150" r="34" fill={red} opacity=".14" />
            <ellipse
                cx="268"
                cy="72"
                rx="32"
                ry="12"
                fill="#fff"
                opacity=".9"
            />
            <polygon points="130,124 216,70 302,124" fill={navy} />
            <rect
                x="146"
                y="122"
                width="150"
                height="78"
                fill="#fff"
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect
                x="162"
                y="146"
                width="28"
                height="54"
                fill={blue}
                stroke={navy}
                strokeWidth="2.5"
            />
            <rect
                x="202"
                y="138"
                width="32"
                height="28"
                fill={yellow}
                stroke={navy}
                strokeWidth="2.5"
            />
            <path d="M218 138v28M202 152h32" stroke={navy} strokeWidth="2" />
            <rect
                x="246"
                y="152"
                width="46"
                height="48"
                fill={sky}
                stroke={navy}
                strokeWidth="2.5"
            />
            <path
                d="M246 164h46M246 176h46M246 188h46"
                stroke={navy}
                strokeWidth="1.6"
                opacity=".5"
            />
            <rect x="92" y="118" width="5" height="82" fill={navy} />
            <g transform="rotate(-11 96 136)">
                <rect x="62" y="120" width="68" height="32" fill={red} />
                <text
                    x="72"
                    y="142"
                    fontSize="15"
                    fill="#fff"
                    style={labelFont}
                >
                    SOLD
                </text>
            </g>
            <path d="M36 200h338" stroke={navy} strokeWidth="2.5" />
        </Frame>
    );
}
