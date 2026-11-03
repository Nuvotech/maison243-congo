/**
 * Demo data for the private seller portal, taken from the design. Dates are
 * stored as "days ago" offsets so the data always looks current.
 */
import type {
    LeadStatus,
    ScreeningStatus,
    Invoice,
} from '@/components/portal/shared-views';
import type { Deal } from '@/components/portal/listing-form';

export type SellerPlanId = 'Sale' | 'Lite' | 'Rental';

export type SellerPlan = {
    id: SellerPlanId;
    name: string;
    deal: Deal;
    price: number;
    months: number;
    days: number;
    max?: number;
    blurb: string;
    features: string[];
    more: string[];
};

export const sellerPlans: SellerPlan[] = [
    {
        id: 'Sale',
        name: 'Sale Listing',
        deal: 'Sale',
        price: 2299,
        months: 6,
        days: 183,
        blurb: 'Build your listing step by step. For any property type at any price.',
        features: [
            'All property types and prices',
            'Instant lead notifications',
            'Listing performance dashboard',
            'Auto email alerts to relevant buyers',
            'Advertised for 6 months',
        ],
        more: [
            'Up to 40 photos and a floor plan',
            'Reviewed within one working day',
            'Change the price and description any time',
        ],
    },
    {
        id: 'Lite',
        name: 'Sale Listing (Lite)',
        deal: 'Sale',
        price: 499,
        months: 6,
        days: 183,
        max: 500000,
        blurb: 'The same listing tools for homes priced up to R 500 000.',
        features: [
            'Residential properties up to R 500 000',
            'Instant lead notifications',
            'Listing performance dashboard',
            'Auto email alerts to relevant buyers',
            'Advertised for 6 months',
        ],
        more: [
            'Up to 20 photos',
            'Houses, apartments, townhouses and clusters only',
            'Upgrade to Sale Listing if the price goes above R 500 000',
        ],
    },
    {
        id: 'Rental',
        name: 'Rental Listing',
        deal: 'Rent',
        price: 729,
        months: 3,
        days: 92,
        blurb: 'Build your rental listing step by step and find a tenant faster.',
        features: [
            'All property types and rentals',
            'Instant lead notifications',
            'Listing performance dashboard',
            'Auto email alerts to potential tenants',
            'Advertised for 3 months',
        ],
        more: [
            'Up to 30 photos',
            'Request tenant screenings from the listing',
            'Mark as let to stop new enquiries',
        ],
    },
];

export type SellerPropertyStatus =
    | 'Unpublished'
    | 'Pending review'
    | 'Live'
    | 'Under offer'
    | 'Sold'
    | 'Let'
    | 'Expired';

export type SellerProperty = {
    id: string;
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
    status: SellerPropertyStatus;
    modifiedDaysAgo: number;
    plan: SellerPlanId | null;
    listedDaysAgo: number | null;
    desc: string;
};

export type SellerLead = {
    id: string;
    name: string;
    email: string;
    phone: string;
    propertyId: string;
    message: string;
    daysAgo: number;
    via: string;
    status: LeadStatus;
};

export type SellerScreening = {
    id: string;
    name: string;
    email: string;
    propertyId: string;
    daysAgo: number;
    status: ScreeningStatus;
    result: '' | 'Recommended' | 'Not recommended';
};

export type SellerPortalData = {
    properties: SellerProperty[];
    leads: SellerLead[];
    screenings: SellerScreening[];
    invoices: Invoice[];
};

const describe = (type: string, beds: number, suburb: string): string =>
    type === 'Vacant land'
        ? 'Level, serviced stand in a secure estate with views over the Moreleta valley. Building plans approved for a four-bedroom home.'
        : `${beds}-bedroom ${type.toLowerCase()} in ${suburb}, close to schools, shops and the Gautrain bus route. Secure parking and fibre ready.`;

const property = (
    id: string,
    street: string,
    unit: string,
    suburb: string,
    type: string,
    deal: Deal,
    price: number,
    beds: number,
    baths: number,
    size: number,
    status: SellerPropertyStatus,
    modifiedDaysAgo: number,
    plan: SellerPlanId | null,
    listedDaysAgo: number | null,
): SellerProperty => ({
    id,
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
    plan,
    listedDaysAgo,
    desc: describe(type, beds, suburb),
});

export function seedSellerPortal(): SellerPortalData {
    return {
        properties: [
            property(
                '116132662',
                '14 Willow Lane',
                'Unit 7, Acacia Gardens',
                'Muckleneuk',
                'Townhouse',
                'Rent',
                6500,
                2,
                1,
                96,
                'Expired',
                17,
                'Rental',
                77,
            ),
            property(
                '116169257',
                '14 Willow Lane',
                'Unit 12, Acacia Gardens',
                'Muckleneuk',
                'Townhouse',
                'Rent',
                4000,
                1,
                1,
                58,
                'Unpublished',
                17,
                null,
                null,
            ),
            property(
                '116204118',
                '221 Justice Mahomed St',
                'Flat 304, The Fountains',
                'Brooklyn',
                'Apartment',
                'Rent',
                8900,
                2,
                2,
                104,
                'Live',
                4,
                'Rental',
                24,
            ),
            property(
                '116211940',
                '38 Rhino Rd',
                '',
                'Waterkloof',
                'House',
                'Sale',
                3450000,
                4,
                3,
                312,
                'Live',
                9,
                'Sale',
                41,
            ),
            property(
                '116230571',
                '9 Koedoe St',
                '',
                'Lynnwood',
                'House',
                'Sale',
                2150000,
                3,
                2,
                228,
                'Pending review',
                1,
                'Sale',
                null,
            ),
            property(
                '116098433',
                '5 Duncan St',
                'Flat 11, Duncan Court',
                'Hatfield',
                'Apartment',
                'Rent',
                5200,
                1,
                1,
                62,
                'Let',
                62,
                'Rental',
                95,
            ),
            property(
                '116241006',
                'Erf 1182, Mooikloof Ridge',
                '',
                'Mooikloof',
                'Vacant land',
                'Sale',
                980000,
                0,
                0,
                1150,
                'Unpublished',
                3,
                null,
                null,
            ),
        ],
        leads: [
            {
                id: 'LD1',
                name: 'Thabo Nkosi',
                email: 'thabo.nkosi@gmail.com',
                phone: '082 551 7720',
                propertyId: '116204118',
                message:
                    'Hi Naledi, is the flat still available from 1 November? I work at the University of Pretoria and can provide three months of payslips. Can I view it this Saturday?',
                daysAgo: 0,
                via: 'Enquiry form',
                status: 'New',
            },
            {
                id: 'LD2',
                name: 'Megan Botha',
                email: 'megan.botha@outlook.com',
                phone: '071 334 0918',
                propertyId: '116211940',
                message:
                    'We love the house. Is the asking price negotiable, and has the borehole been tested recently? We are pre-approved with our bank.',
                daysAgo: 0,
                via: 'Enquiry form',
                status: 'New',
            },
            {
                id: 'LD3',
                name: 'Kabelo Masilo',
                email: 'kabelo.m@icloud.com',
                phone: '083 902 4411',
                propertyId: '116204118',
                message:
                    'Does the rent include water and electricity? And is there a second parking bay?',
                daysAgo: 1,
                via: 'WhatsApp',
                status: 'New',
            },
            {
                id: 'LD4',
                name: 'Riaan Swart',
                email: 'riaan@swartfamily.co.za',
                phone: '076 218 5530',
                propertyId: '116211940',
                message:
                    'Please call me back about a viewing next week. I am relocating from Cape Town in January.',
                daysAgo: 3,
                via: 'Call back',
                status: 'Contacted',
            },
            {
                id: 'LD5',
                name: 'Jessica Moodley',
                email: 'jess.moodley@gmail.com',
                phone: '084 776 1029',
                propertyId: '116204118',
                message:
                    'I would like to apply. I have a pet cat. Is that allowed in the complex?',
                daysAgo: 5,
                via: 'Enquiry form',
                status: 'Contacted',
            },
            {
                id: 'LD6',
                name: 'Sibusiso Mthethwa',
                email: 'sbu.mthethwa@gmail.com',
                phone: '072 640 3358',
                propertyId: '116211940',
                message: 'What are the monthly rates and levies?',
                daysAgo: 8,
                via: 'Enquiry form',
                status: 'Contacted',
            },
            {
                id: 'LD7',
                name: 'Lauren Pillay',
                email: 'lauren.pillay@yahoo.com',
                phone: '061 409 8873',
                propertyId: '116132662',
                message:
                    'Is the townhouse still available? The listing says expired.',
                daysAgo: 12,
                via: 'Enquiry form',
                status: 'Closed',
            },
            {
                id: 'LD8',
                name: 'Hendrik Visser',
                email: 'hvisser@mweb.co.za',
                phone: '082 117 2264',
                propertyId: '116098433',
                message:
                    'Interested in renting from December. Two adults, no pets.',
                daysAgo: 70,
                via: 'Enquiry form',
                status: 'Closed',
            },
        ],
        screenings: [
            {
                id: 'SC1',
                name: 'Thabo Nkosi',
                email: 'thabo.nkosi@gmail.com',
                propertyId: '116204118',
                daysAgo: 6,
                status: 'Complete',
                result: 'Recommended',
            },
            {
                id: 'SC2',
                name: 'Jessica Moodley',
                email: 'jess.moodley@gmail.com',
                propertyId: '116204118',
                daysAgo: 3,
                status: 'In progress',
                result: '',
            },
            {
                id: 'SC3',
                name: 'Pieter Erasmus',
                email: 'p.erasmus@gmail.com',
                propertyId: '116132662',
                daysAgo: 20,
                status: 'Complete',
                result: 'Not recommended',
            },
            {
                id: 'SC4',
                name: 'Amahle Dube',
                email: 'amahle.dube@gmail.com',
                propertyId: '116204118',
                daysAgo: 1,
                status: 'Invite sent',
                result: '',
            },
        ],
        invoices: [
            {
                number: 'INV-24530',
                daysAgo: 1,
                description: 'Sale Listing · 9 Koedoe St',
                amount: 2299,
                status: 'Due',
            },
            {
                number: 'INV-24477',
                daysAgo: 6,
                description: 'Tenant screening · Thabo Nkosi',
                amount: 250,
                status: 'Paid',
            },
            {
                number: 'INV-24102',
                daysAgo: 24,
                description: 'Rental Listing · 221 Justice Mahomed St',
                amount: 729,
                status: 'Paid',
            },
            {
                number: 'INV-24318',
                daysAgo: 41,
                description: 'Sale Listing · 38 Rhino Rd',
                amount: 2299,
                status: 'Paid',
            },
            {
                number: 'INV-23891',
                daysAgo: 77,
                description: 'Rental Listing · 14 Willow Lane, Unit 7',
                amount: 729,
                status: 'Paid',
            },
            {
                number: 'INV-23660',
                daysAgo: 95,
                description: 'Rental Listing · 5 Duncan St',
                amount: 729,
                status: 'Paid',
            },
        ],
    };
}

export const sellerFaqs: [string, string][] = [
    [
        'How long does the review take?',
        'Most listings are approved within one working day. We check that the photos match the address and that the price and details are realistic.',
    ],
    [
        'What happens when my package runs out?',
        'The listing moves to Expired and comes off the site. Renew it from the Properties list with any package and it goes back into review.',
    ],
    [
        'Can I change my price while the listing is live?',
        'Yes. Edit the listing and save. Price and description changes go live straight away without another review.',
    ],
    [
        'How do tenant screenings work?',
        'We email your applicant a secure link. Once they consent and complete it, you get a report covering ID, credit record and affordability. You are charged R 250 only for completed screenings.',
    ],
    [
        'How do I mark my property as sold or let?',
        'Use Under offer or Mark let in the Properties list. When the sale goes through, mark it sold. This stops new enquiries.',
    ],
];
