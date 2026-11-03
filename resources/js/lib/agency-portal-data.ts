/**
 * Demo data for the agency portal (Jacaranda Estates), taken from the
 * design. Dates are "days ago" offsets; mandate expiry is an ISO date.
 */
import type { Deal } from '@/components/portal/listing-form';
import type {
    Invoice,
    LeadStatus,
    ScreeningStatus,
} from '@/components/portal/shared-views';
import { isoInDays } from '@/lib/portal';

export type AgencyPlanId = 'Starter' | 'Pro' | 'Enterprise';

export type AgencyPlan = {
    id: AgencyPlanId;
    price: number;
    seats: number;
    listings: number;
    credits: number;
};

/** A limit of 0 means unlimited. */
export const agencyPlans: AgencyPlan[] = [
    { id: 'Starter', price: 1290, seats: 3, listings: 25, credits: 0 },
    { id: 'Pro', price: 3490, seats: 12, listings: 150, credits: 10 },
    { id: 'Enterprise', price: 8990, seats: 0, listings: 0, credits: 40 },
];

export type MemberRole = 'Principal' | 'Agent' | 'Admin';
export type MemberStatus = 'Active' | 'FFC pending' | 'Invited' | 'Deactivated';

export type TeamMember = {
    id: string;
    name: string;
    role: MemberRole;
    email: string;
    phone: string;
    ffc: string;
    status: MemberStatus;
};

export type AgencyListingStatus =
    | 'Draft'
    | 'Pending review'
    | 'Live'
    | 'Under offer'
    | 'Sold'
    | 'Let'
    | 'Withdrawn'
    | 'Expired';

export type AgencyListing = {
    id: string;
    agentId: string;
    street: string;
    unit: string;
    suburb: string;
    city: string;
    type: string;
    deal: Deal;
    price: number;
    beds: number;
    baths: number;
    size: number;
    status: AgencyListingStatus;
    modifiedDaysAgo: number;
    mandate: 'Sole' | 'Open';
    mandateExpires: string;
    featured: boolean;
    listedDaysAgo: number | null;
    desc: string;
};

export type AgencyLead = {
    id: string;
    name: string;
    email: string;
    phone: string;
    propertyId: string;
    agentId: string;
    message: string;
    daysAgo: number;
    via: string;
    status: LeadStatus;
};

export type AgencyScreening = {
    id: string;
    name: string;
    email: string;
    propertyId: string;
    daysAgo: number;
    status: ScreeningStatus;
    result: '' | 'Recommended' | 'Not recommended';
};

export type AgencyPortalData = {
    team: TeamMember[];
    listings: AgencyListing[];
    leads: AgencyLead[];
    screenings: AgencyScreening[];
    invoices: Invoice[];
};

/** Statuses that count towards the plan's listing quota. */
export const activeStatuses: AgencyListingStatus[] = [
    'Live',
    'Under offer',
    'Pending review',
];

/** Average time to first reply on a lead, per agent. */
export const firstReplyTimes: Record<string, string> = {
    A1: '2h 05m',
    A2: '38m',
    A3: '1h 14m',
    A4: '3h 40m',
    A5: '—',
    A7: '5h 10m',
};

const describe = (type: string, beds: number, suburb: string): string =>
    type === 'Vacant land'
        ? 'Level stand in a secure estate with mountain views. Services at the boundary, building plans available on request.'
        : `${beds}-bedroom ${type.toLowerCase()} in ${suburb}. Open-plan living, covered patio, secure parking and fibre. Walking distance to schools and shops.`;

const listing = (
    id: string,
    agentId: string,
    street: string,
    unit: string,
    suburb: string,
    type: string,
    deal: Deal,
    price: number,
    beds: number,
    baths: number,
    size: number,
    status: AgencyListingStatus,
    modifiedDaysAgo: number,
    mandate: 'Sole' | 'Open',
    mandateDays: number,
    featured: boolean,
    listedDaysAgo: number | null,
): AgencyListing => ({
    id,
    agentId,
    street,
    unit,
    suburb,
    city: 'Pretoria',
    type,
    deal,
    price,
    beds,
    baths,
    size,
    status,
    modifiedDaysAgo,
    mandate,
    mandateExpires: isoInDays(mandateDays),
    featured,
    listedDaysAgo,
    desc: describe(type, beds, suburb),
});

export function seedAgencyPortal(): AgencyPortalData {
    const listings = [
        listing(
            '117402215',
            'A2',
            '12 Albert St',
            '',
            'Waterkloof',
            'House',
            'Sale',
            5950000,
            5,
            4,
            480,
            'Live',
            2,
            'Sole',
            84,
            true,
            30,
        ),
        listing(
            '117402398',
            'A2',
            '63 Bronkhorst St',
            'Unit 4, The Oaks',
            'Groenkloof',
            'Townhouse',
            'Sale',
            1895000,
            3,
            2,
            165,
            'Under offer',
            5,
            'Sole',
            40,
            false,
            52,
        ),
        listing(
            '117403011',
            'A2',
            '221 Justice Mahomed St',
            'Flat 908, Brooklyn Towers',
            'Brooklyn',
            'Apartment',
            'Rent',
            11500,
            2,
            2,
            118,
            'Live',
            1,
            'Open',
            60,
            false,
            12,
        ),
        listing(
            '117403544',
            'A2',
            '7 Lois Ave',
            '',
            'Menlo Park',
            'House',
            'Sale',
            3250000,
            4,
            3,
            295,
            'Pending review',
            0,
            'Sole',
            120,
            false,
            null,
        ),
        listing(
            '117404102',
            'A2',
            '18 Hans Strijdom Dr',
            '',
            'Erasmuskloof',
            'House',
            'Sale',
            4100000,
            4,
            3,
            350,
            'Draft',
            3,
            'Sole',
            90,
            false,
            null,
        ),
        listing(
            '117399870',
            'A2',
            '45 Atterbury Rd',
            'Unit 12, Glen Manor',
            'Faerie Glen',
            'Townhouse',
            'Rent',
            9800,
            3,
            2,
            140,
            'Let',
            21,
            'Open',
            -21,
            false,
            70,
        ),
        listing(
            '117404460',
            'A3',
            '92 Garsfontein Rd',
            '',
            'Garsfontein',
            'House',
            'Sale',
            2780000,
            3,
            2,
            240,
            'Live',
            4,
            'Sole',
            70,
            true,
            18,
        ),
        listing(
            '117404781',
            'A3',
            '1115 Burnett St',
            'Flat 3, Hatfield Square',
            'Hatfield',
            'Apartment',
            'Rent',
            6200,
            1,
            1,
            52,
            'Live',
            6,
            'Open',
            45,
            false,
            25,
        ),
        listing(
            '117401908',
            'A3',
            '30 Rubida St',
            '',
            'Moreleta Park',
            'House',
            'Sale',
            2390000,
            3,
            2,
            210,
            'Expired',
            15,
            'Sole',
            -15,
            false,
            105,
        ),
        listing(
            '117405020',
            'A4',
            'Erf 640, Silver Lakes Golf Estate',
            '',
            'Silver Lakes',
            'Vacant land',
            'Sale',
            1450000,
            0,
            0,
            980,
            'Live',
            8,
            'Sole',
            100,
            false,
            33,
        ),
        listing(
            '117405233',
            'A4',
            '14 Pretorius St',
            'Unit 21, Arcadia Heights',
            'Arcadia',
            'Apartment',
            'Rent',
            7400,
            2,
            1,
            78,
            'Pending review',
            1,
            'Open',
            60,
            false,
            null,
        ),
        listing(
            '117398811',
            'A4',
            '5 Kingfisher Ave',
            '',
            'Equestria',
            'House',
            'Sale',
            2650000,
            3,
            2,
            260,
            'Sold',
            30,
            'Sole',
            -30,
            false,
            88,
        ),
        listing(
            '117405601',
            'A1',
            '3 Monument Rd',
            '',
            'Waterkloof Ridge',
            'House',
            'Sale',
            8900000,
            5,
            5,
            620,
            'Live',
            3,
            'Sole',
            150,
            true,
            9,
        ),
        listing(
            '117405744',
            'A5',
            '27 Cliff Ave',
            'Unit 8, Faerie Glen Villas',
            'Faerie Glen',
            'Townhouse',
            'Rent',
            10200,
            3,
            2,
            150,
            'Draft',
            2,
            'Open',
            60,
            false,
            null,
        ),
        listing(
            '117400302',
            'A7',
            '16 Lynnwood Rd',
            '',
            'Lynnwood',
            'House',
            'Sale',
            3100000,
            4,
            2,
            280,
            'Withdrawn',
            40,
            'Sole',
            -40,
            false,
            null,
        ),
        listing(
            '117405890',
            'A1',
            'Erf 22, Mooikloof Equestrian Estate',
            '',
            'Mooikloof',
            'Vacant land',
            'Sale',
            3200000,
            0,
            0,
            10000,
            'Live',
            11,
            'Sole',
            110,
            false,
            40,
        ),
    ];
    const ownerOf = (propertyId: string): string =>
        listings.find((item) => item.id === propertyId)!.agentId;
    const lead = (
        id: string,
        name: string,
        email: string,
        phone: string,
        propertyId: string,
        message: string,
        daysAgo: number,
        via: string,
        status: LeadStatus,
    ): AgencyLead => ({
        id,
        name,
        email,
        phone,
        propertyId,
        agentId: ownerOf(propertyId),
        message,
        daysAgo,
        via,
        status,
    });

    return {
        team: [
            {
                id: 'A1',
                name: 'Johan van der Merwe',
                role: 'Principal',
                email: 'johan@jacaranda.co.za',
                phone: '082 455 1023',
                ffc: '2026 1048231',
                status: 'Active',
            },
            {
                id: 'A2',
                name: 'Michelle Jacobs',
                role: 'Agent',
                email: 'michelle@jacaranda.co.za',
                phone: '083 671 2290',
                ffc: '2026 3317094',
                status: 'Active',
            },
            {
                id: 'A3',
                name: 'Lerato Khumalo',
                role: 'Agent',
                email: 'lerato@jacaranda.co.za',
                phone: '072 908 4416',
                ffc: '2026 2280561',
                status: 'Active',
            },
            {
                id: 'A4',
                name: 'Sipho Dlamini',
                role: 'Agent',
                email: 'sipho@jacaranda.co.za',
                phone: '061 223 7785',
                ffc: '2026 4419830',
                status: 'Active',
            },
            {
                id: 'A5',
                name: 'Pieter Joubert',
                role: 'Agent',
                email: 'pieter@jacaranda.co.za',
                phone: '076 512 3348',
                ffc: '2026 5502217',
                status: 'FFC pending',
            },
            {
                id: 'A6',
                name: 'Thandi Mokoena',
                role: 'Admin',
                email: 'thandi@jacaranda.co.za',
                phone: '084 300 9921',
                ffc: '',
                status: 'Invited',
            },
            {
                id: 'A7',
                name: 'Ruan Pretorius',
                role: 'Agent',
                email: 'ruan@jacaranda.co.za',
                phone: '079 640 1187',
                ffc: '2025 8810342',
                status: 'Deactivated',
            },
        ],
        listings,
        leads: [
            lead(
                'LD1',
                'Megan Botha',
                'megan.botha@outlook.com',
                '071 334 0918',
                '117402215',
                'We are pre-approved and would love to view on Sunday. Is the pool heated and is there a generator or solar backup?',
                0,
                'Enquiry form',
                'New',
            ),
            lead(
                'LD2',
                'Kabelo Masilo',
                'kabelo.m@icloud.com',
                '083 902 4411',
                '117403011',
                'Is the apartment available from 1 November? Does the rent include water and the second parking bay?',
                0,
                'WhatsApp',
                'New',
            ),
            lead(
                'LD3',
                'Riaan Swart',
                'riaan@swartfamily.co.za',
                '076 218 5530',
                '117405601',
                'Relocating from Cape Town in January. Could you send the floor plan and the rates and taxes figure?',
                1,
                'Enquiry form',
                'New',
            ),
            lead(
                'LD4',
                'Ayesha Patel',
                'ayesha.patel@gmail.com',
                '082 640 1199',
                '117404460',
                'Would the seller consider R 2.65 million? We have a cash deposit of 20%.',
                1,
                'Enquiry form',
                'New',
            ),
            lead(
                'LD5',
                'Craig Hendricks',
                'craig.h@mweb.co.za',
                '084 551 2270',
                '117402215',
                'Please call me back about a second viewing with my wife.',
                3,
                'Call back',
                'Contacted',
            ),
            lead(
                'LD6',
                'Zanele Mthembu',
                'zanele.m@gmail.com',
                '072 118 4436',
                '117404781',
                'Student at UP. My parents will sign surety. Is the flat furnished?',
                4,
                'Enquiry form',
                'Contacted',
            ),
            lead(
                'LD7',
                'Werner Steyn',
                'werner@steynbuild.co.za',
                '079 330 8812',
                '117405020',
                'What are the building guidelines and the levy for the estate?',
                6,
                'Enquiry form',
                'Contacted',
            ),
            lead(
                'LD8',
                'Fatima Essop',
                'fatima.essop@outlook.com',
                '061 772 9034',
                '117402398',
                'Is the offer accepted already, or can we still submit one?',
                9,
                'Enquiry form',
                'Closed',
            ),
        ],
        screenings: [
            {
                id: 'SC1',
                name: 'Kabelo Masilo',
                email: 'kabelo.m@icloud.com',
                propertyId: '117403011',
                daysAgo: 1,
                status: 'Invite sent',
                result: '',
            },
            {
                id: 'SC2',
                name: 'Zanele Mthembu',
                email: 'zanele.m@gmail.com',
                propertyId: '117404781',
                daysAgo: 3,
                status: 'In progress',
                result: '',
            },
            {
                id: 'SC3',
                name: 'Bongani Zulu',
                email: 'bongani.zulu@gmail.com',
                propertyId: '117399870',
                daysAgo: 24,
                status: 'Complete',
                result: 'Recommended',
            },
        ],
        invoices: [
            {
                number: 'JE-10931',
                daysAgo: 1,
                description: 'Pro plan · October 2026',
                amount: 3490,
                status: 'Due',
            },
            {
                number: 'JE-10844',
                daysAgo: 18,
                description: 'Featured credits top-up · 5 credits',
                amount: 750,
                status: 'Paid',
            },
            {
                number: 'JE-10790',
                daysAgo: 31,
                description: 'Pro plan · September 2026',
                amount: 3490,
                status: 'Paid',
            },
            {
                number: 'JE-10652',
                daysAgo: 62,
                description: 'Pro plan · August 2026',
                amount: 3490,
                status: 'Paid',
            },
            {
                number: 'JE-10511',
                daysAgo: 92,
                description: 'Pro plan · July 2026',
                amount: 3490,
                status: 'Paid',
            },
        ],
    };
}

export const agencyFaqs: [string, string][] = [
    [
        'How does the listing quota work?',
        'Every listing that is live, under offer or in review counts towards your plan. Drafts, expired and closed listings do not.',
    ],
    [
        'What are featured credits?',
        'One credit puts a live listing at the top of search results and in the homepage carousel for 7 days. Credits reset on the 1st of each month.',
    ],
    [
        'Why is an agent marked FFC pending?',
        'We check every Fidelity Fund Certificate with the PPRA before an agent can publish. It usually takes one working day. They can prepare drafts in the meantime.',
    ],
    [
        'An agent has left. What happens to their listings?',
        'Deactivate them under Team to free up the seat. Their listings stay live. Open each one and pick a new listing agent; the leads move with the listing.',
    ],
    [
        'Can we list on an open mandate?',
        'Yes. Sole mandates get a badge on the listing and rank slightly higher in search, but open mandates are allowed.',
    ],
];
