/**
 * Demo data for the platform admin console, generated deterministically
 * from a seed so it matches the design. Dates are "days ago" offsets.
 */
import { daysAgo, seededRandom, smoothPath } from '@/lib/portal';

export type AccountKind = 'sellers' | 'agents' | 'agencies';
export type RecordKind = 'listings' | AccountKind | 'screenings' | 'payments';

export type LogEntry = { daysAgo: number; text: string };

export type Agency = {
    id: string;
    name: string;
    city: string;
    plan: string;
    status: string;
    reg: string;
    email: string;
    phone: string;
    joined: number;
    log: LogEntry[];
};
export type Agent = {
    id: string;
    name: string;
    companyId: string;
    city: string;
    status: string;
    ffc: string;
    email: string;
    phone: string;
    joined: number;
    role: 'Principal' | 'Agent';
    log: LogEntry[];
};
export type Seller = {
    id: string;
    name: string;
    city: string;
    status: string;
    email: string;
    phone: string;
    joined: number;
    log: LogEntry[];
};
export type AdminListing = {
    id: string;
    ref: string;
    type: string;
    sale: boolean;
    beds: number;
    baths: number;
    size: number;
    suburb: string;
    city: string;
    province: string;
    price: number;
    listerKind: 'agents' | 'sellers';
    listerId: string;
    status: string;
    updated: number;
    log: LogEntry[];
    plan?: 'Sale' | 'Lite' | 'Rental';
    mandate?: 'Sole' | 'Open';
    mandDays?: number;
    featured?: boolean;
};
export type AdminScreening = {
    id: string;
    name: string;
    email: string;
    listingId: string;
    status: string;
    result: string;
    updated: number;
    log: LogEntry[];
};
export type AdminPayment = {
    id: string;
    accKind: 'agencies' | 'sellers';
    accId: string;
    desc: string;
    amt: number;
    status: string;
    updated: number;
    log: LogEntry[];
};
export type AgencyPlanRecord = {
    id: string;
    name: string;
    price: number;
    seats: number;
    listings: number;
    featured: number;
    analytics: string;
    status: string;
};
export type ListingPack = {
    id: string;
    name: string;
    deal: 'Sale' | 'Rent';
    price: number;
    months: number;
    photos: number;
    max: number;
    status: string;
};

export type AdminData = {
    listings: AdminListing[];
    sellers: Seller[];
    agents: Agent[];
    agencies: Agency[];
    screenings: AdminScreening[];
    payments: AdminPayment[];
    plans: AgencyPlanRecord[];
    packs: ListingPack[];
    activity: { label: string; sale: number; rent: number }[];
    fees: { screening: string; credit: string };
};

export const singular: Record<RecordKind, string> = {
    listings: 'listing',
    sellers: 'private seller',
    agents: 'agent',
    agencies: 'agency',
    screenings: 'screening',
    payments: 'payment',
};

export const packNames: Record<string, string> = {
    Sale: 'Sale Listing',
    Lite: 'Sale Listing (Lite)',
    Rental: 'Rental Listing',
};

export const activeStatus: Record<AccountKind, string> = {
    sellers: 'Verified',
    agents: 'Active',
    agencies: 'Active',
};

export const pendingStatus: Record<AccountKind, string> = {
    sellers: 'ID pending',
    agents: 'FFC pending',
    agencies: 'Pending',
};

export const suburbs: [string, string, string][] = [
    ['Irene', 'Centurion', 'Gauteng'],
    ['Eldoraigne', 'Centurion', 'Gauteng'],
    ['Waterkloof', 'Pretoria', 'Gauteng'],
    ['Brooklyn', 'Pretoria', 'Gauteng'],
    ['Bryanston', 'Sandton', 'Gauteng'],
    ['Morningside', 'Sandton', 'Gauteng'],
    ['Sea Point', 'Cape Town', 'Western Cape'],
    ['Claremont', 'Cape Town', 'Western Cape'],
    ['Die Boord', 'Stellenbosch', 'Western Cape'],
    ['Umhlanga Ridge', 'Umhlanga', 'KwaZulu-Natal'],
    ['Ballito', 'Ballito', 'KwaZulu-Natal'],
    ['Heatherlands', 'George', 'Western Cape'],
    ['Bendor', 'Polokwane', 'Limpopo'],
];

export const adminCities = [...new Set(suburbs.map((entry) => entry[1]))];

export const provinceOf: Record<string, string> = Object.fromEntries(
    suburbs.map((entry) => [entry[1], entry[2]]),
);

const slug = (value: string): string =>
    value.toLowerCase().replace(/[^a-z]+/g, '.');

export function seedAdminData(): AdminData {
    const random = seededRandom(243);
    const pick = <T>(items: T[]): T =>
        items[Math.floor(random() * items.length)];
    const phone = (): string =>
        `0${pick(['82', '83', '72', '71', '61', '12', '21', '31'])} ${100 + Math.floor(random() * 900)} ${1000 + Math.floor(random() * 9000)}`;

    const agencies: Agency[] = (
        [
            ['Highveld Realty', 'Centurion', 'Enterprise', 'Active'],
            ['Jacaranda Estates', 'Pretoria', 'Pro', 'Active'],
            ['Sandton Prime Properties', 'Sandton', 'Enterprise', 'Active'],
            ['Cape Coast Properties', 'Cape Town', 'Enterprise', 'Active'],
            ['Winelands Homes', 'Stellenbosch', 'Pro', 'Active'],
            ['Umhlanga Shores Realty', 'Umhlanga', 'Pro', 'Active'],
            ['Garden Route Realty', 'George', 'Starter', 'Pending'],
            ['Bushveld Property Group', 'Polokwane', 'Starter', 'Suspended'],
        ] as const
    ).map(([name, city, plan, status], index) => ({
        id: `C${String(index + 1).padStart(2, '0')}`,
        name,
        city,
        plan,
        status,
        reg: `${2008 + index}/${100000 + Math.floor(random() * 899999)}/07`,
        email: `admin@${name.toLowerCase().split(' ')[0]}.co.za`,
        phone: phone(),
        joined: 200 + Math.floor(random() * 1400),
        log: [],
    }));

    const agentNames = [
        'Thandi Mokoena',
        'Johan van der Merwe',
        'Priya Naidoo',
        'Sipho Dlamini',
        'Annelie Botha',
        'Lerato Khumalo',
        'Ruan Pretorius',
        'Ayesha Patel',
        'Kagiso Molefe',
        'Michelle Jacobs',
        'Bongani Zulu',
        'Carla du Plessis',
        'Nomvula Ndlovu',
        'Werner Steyn',
        'Fatima Essop',
        'Tshepo Mahlangu',
        'Lindiwe Sithole',
        'Pieter Joubert',
        'Zanele Mthembu',
        'Grant Fourie',
    ];
    const agents: Agent[] = agentNames.map((name, index) => {
        const agency = agencies[index % agencies.length];
        const status =
            agency.status === 'Suspended'
                ? 'Suspended'
                : [3, 11, 17].includes(index)
                  ? 'FFC pending'
                  : index === 14
                    ? 'Suspended'
                    : 'Active';

        return {
            id: `A${String(index + 1).padStart(2, '0')}`,
            name,
            companyId: agency.id,
            city: agency.city,
            status,
            ffc: `2026${1000000 + Math.floor(random() * 8999999)}`,
            email: `${slug(name)}@${agency.email.split('@')[1]}`,
            phone: phone(),
            joined: 20 + Math.floor(random() * 900),
            role: 'Agent',
            log: [],
        };
    });

    const sellerNames = [
        'Dawid Kruger',
        'Naledi Mabaso',
        'Sarah Williams',
        'Mandla Shabalala',
        'Elize Venter',
        'Yusuf Adams',
        'Refilwe Moloi',
        'Craig Hendricks',
        'Busisiwe Nkosi',
        'Hennie Coetzee',
    ];
    const sellers: Seller[] = sellerNames.map((name, index) => ({
        id: `S${String(index + 1).padStart(2, '0')}`,
        name,
        city: pick(adminCities),
        status: [2, 6, 9].includes(index)
            ? 'ID pending'
            : index === 4
              ? 'Suspended'
              : 'Verified',
        email: `${slug(name)}@gmail.com`,
        phone: phone(),
        joined: 3 + Math.floor(random() * 400),
        log: [],
    }));

    const listings: AdminListing[] = [];

    for (let index = 0; index < 42; index++) {
        const byAgent = random() < 0.72;
        const lister: Agent | Seller = byAgent ? pick(agents) : pick(sellers);
        const local = suburbs.filter((entry) => entry[1] === lister.city);
        const place =
            local.length && random() < 0.8 ? pick(local) : pick(suburbs);
        const type = pick([
            'House',
            'House',
            'Apartment',
            'Townhouse',
            'Vacant land',
        ]);
        const sale = random() < 0.78;
        const beds =
            type === 'Vacant land'
                ? 0
                : type === 'Apartment'
                  ? 1 + Math.floor(random() * 3)
                  : 2 + Math.floor(random() * 4);
        const price = sale
            ? Math.round(
                  (type === 'Vacant land'
                      ? 400000 + random() * 2500000
                      : 950000 + random() * 8800000) / 50000,
              ) * 50000
            : Math.round((8500 + random() * 38000) / 500) * 500;
        const roll = random();
        const status =
            roll < 0.52
                ? 'Live'
                : roll < 0.72
                  ? 'Pending review'
                  : roll < 0.82
                    ? 'Under offer'
                    : roll < 0.91
                      ? 'Sold'
                      : 'Removed';
        const number = 10400 + index * 7;

        listings.push({
            id: `L${number}`,
            ref: `M243-${number}`,
            type,
            sale,
            beds,
            baths: beds ? Math.max(1, beds - Math.floor(random() * 2)) : 0,
            size:
                type === 'Vacant land'
                    ? Math.round(400 + random() * 1600)
                    : Math.round(55 + beds * 48 + random() * 90),
            suburb: place[0],
            city: place[1],
            province: place[2],
            price,
            listerKind: byAgent ? 'agents' : 'sellers',
            listerId: lister.id,
            status:
                !byAgent && lister.status === 'Suspended' ? 'Removed' : status,
            updated: Math.floor(random() * 38),
            log: [],
        });
    }

    agencies.forEach((agency) => {
        const principal = agents.find((agent) => agent.companyId === agency.id);

        if (principal) {
            principal.role = 'Principal';
        }
    });

    listings.forEach((listing) => {
        if (listing.listerKind === 'sellers') {
            listing.plan = listing.sale
                ? listing.price <= 500000 && listing.type !== 'Vacant land'
                    ? 'Lite'
                    : 'Sale'
                : 'Rental';
        } else {
            listing.mandate = random() < 0.7 ? 'Sole' : 'Open';
            listing.mandDays = [
                'Live',
                'Pending review',
                'Under offer',
            ].includes(listing.status)
                ? Math.round(20 + random() * 140)
                : -Math.round(1 + random() * 40);
            listing.featured = listing.status === 'Live' && random() < 0.25;
        }
    });

    const rentals = listings.filter((listing) => !listing.sale);
    const applicants = [
        'Kabelo Masilo',
        'Zanele Mthembu',
        'Bongani Zulu',
        'Amahle Dube',
        'Thabo Nkosi',
        'Jessica Moodley',
        'Pieter Erasmus',
        'Lauren Pillay',
        'Hendrik Visser',
        'Nadia Osei',
    ];
    const screeningStatuses = [
        'Invite sent',
        'In progress',
        'Complete',
        'Complete',
        'Complete',
        'Cancelled',
    ];
    const screenings: AdminScreening[] = applicants.map((name, index) => {
        const status = screeningStatuses[index % screeningStatuses.length];

        return {
            id: `SC${String(index + 1).padStart(2, '0')}`,
            name,
            email: `${slug(name)}@gmail.com`,
            listingId: rentals[index % rentals.length].id,
            status,
            result:
                status === 'Complete'
                    ? index % 3
                        ? 'Recommended'
                        : 'Not recommended'
                    : '',
            updated: Math.floor(random() * 30),
            log: [],
        };
    });

    const payments: AdminPayment[] = [];
    let invoiceNumber = 24400;
    const addPayment = (
        accKind: AdminPayment['accKind'],
        accId: string,
        desc: string,
        amt: number,
        status: string,
        updated: number,
    ): void => {
        payments.push({
            id: `INV-${invoiceNumber++}`,
            accKind,
            accId,
            desc,
            amt,
            status,
            updated,
            log: [],
        });
    };
    const planPrices: Record<string, number> = {
        Starter: 1290,
        Pro: 3490,
        Enterprise: 8990,
    };
    const packPrices: Record<string, number> = {
        Sale: 2299,
        Lite: 499,
        Rental: 729,
    };

    agencies.forEach((agency) =>
        ['October', 'September', 'August'].forEach((month, index) =>
            addPayment(
                'agencies',
                agency.id,
                `${agency.plan} plan · ${month} 2026`,
                Math.round(planPrices[agency.plan] * 115) / 100,
                agency.status === 'Suspended' && index < 2
                    ? 'Overdue'
                    : index === 0 && random() < 0.4
                      ? 'Due'
                      : 'Paid',
                1 + index * 30,
            ),
        ),
    );
    listings
        .filter((listing) => listing.listerKind === 'sellers')
        .forEach((listing) =>
            addPayment(
                'sellers',
                listing.listerId,
                `${packNames[listing.plan!]} · ${listing.suburb}`,
                packPrices[listing.plan!],
                listing.status === 'Removed' ? 'Refunded' : 'Paid',
                listing.updated + 2,
            ),
        );
    screenings
        .filter((screening) => screening.status === 'Complete')
        .forEach((screening) => {
            const listing = listings.find(
                (item) => item.id === screening.listingId,
            )!;
            const isAgentListing = listing.listerKind === 'agents';
            addPayment(
                isAgentListing ? 'agencies' : 'sellers',
                isAgentListing
                    ? agents.find((agent) => agent.id === listing.listerId)!
                          .companyId
                    : listing.listerId,
                `Tenant screening · ${screening.name}`,
                250,
                'Paid',
                screening.updated,
            );
        });
    [agencies[1], agencies[2]].forEach((agency, index) =>
        addPayment(
            'agencies',
            agency.id,
            'Featured credits top-up · 5 credits',
            750,
            'Paid',
            12 + index * 9,
        ),
    );
    payments.sort((a, b) => a.updated - b.updated);

    const activity: AdminData['activity'] = [];

    for (let week = 11; week >= 0; week--) {
        activity.push({
            label: daysAgo(week * 7 + 3).toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'short',
            }),
            sale: Math.round(16 + (11 - week) * 1.5 + random() * 14),
            rent: Math.round(7 + random() * 9 + (11 - week) * 0.6),
        });
    }

    return {
        listings,
        sellers,
        agents,
        agencies,
        screenings,
        payments,
        activity,
        fees: { screening: '250', credit: '150' },
        plans: [
            {
                id: 'Starter',
                name: 'Starter',
                price: 1290,
                seats: 3,
                listings: 25,
                featured: 0,
                analytics: 'Basic',
                status: 'Active',
            },
            {
                id: 'Pro',
                name: 'Pro',
                price: 3490,
                seats: 12,
                listings: 150,
                featured: 10,
                analytics: 'Full',
                status: 'Active',
            },
            {
                id: 'Enterprise',
                name: 'Enterprise',
                price: 8990,
                seats: 0,
                listings: 0,
                featured: 40,
                analytics: 'Full + API',
                status: 'Active',
            },
        ],
        packs: [
            {
                id: 'Sale',
                name: 'Sale Listing',
                deal: 'Sale',
                price: 2299,
                months: 6,
                photos: 40,
                max: 0,
                status: 'Active',
            },
            {
                id: 'Lite',
                name: 'Sale Listing (Lite)',
                deal: 'Sale',
                price: 499,
                months: 6,
                photos: 20,
                max: 500000,
                status: 'Active',
            },
            {
                id: 'Rental',
                name: 'Rental Listing',
                deal: 'Rent',
                price: 729,
                months: 3,
                photos: 30,
                max: 0,
                status: 'Active',
            },
        ],
    };
}

/** A small seeded sparkline for the overview stat cards. */
export function sparkline(seed: number): { line: string; area: string } {
    const random = seededRandom(seed);
    const points: [number, number][] = [];
    let y = 20;

    for (let index = 0; index < 10; index++) {
        y = Math.max(4, Math.min(36, y + (random() - 0.42) * 14));
        points.push([(index * 120) / 9, 42 - y]);
    }

    const line = smoothPath(points);

    return { line, area: `${line} L120 44 L0 44 Z` };
}
