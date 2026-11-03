/**
 * Static showcase content for the public Maison243 pages, taken from the
 * landing page design. Replace with server-provided props once listings
 * are stored in the database.
 */

export type SearchMode = 'buy' | 'rent';

export type ListingSummary = {
    id: string;
    image: string;
    badge?: 'Featured' | 'New';
    price: string;
    priceSuffix?: string;
    title: string;
    location: string;
    beds: number;
    baths: number;
    garages: number;
    size: string;
};

export type Development = {
    image: string;
    name: string;
    location: string;
    priceFrom: string;
    units: number;
};

export type SearchResult = {
    image: string;
    prices: Record<SearchMode, string>;
    agency: string;
    type: string;
    suburb: string;
    address: string;
    description: Record<SearchMode, string>;
    beds: number;
    baths: number;
    garages: number;
    size: string;
};

const pexels = (id: number, width: number): string =>
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const heroImage = pexels(7587880, 1800);

export const sellImage = pexels(8112187, 1400);

export const featuredForSale: ListingSummary[] = [
    {
        id: 's1',
        image: pexels(8134821, 900),
        badge: 'Featured',
        price: 'R 1 450 000',
        title: '3 bed house in Garsfontein',
        location: 'Pretoria East, Gauteng',
        beds: 3,
        baths: 2,
        garages: 2,
        size: '620 m²',
    },
    {
        id: 's2',
        image: pexels(6934189, 900),
        badge: 'New',
        price: 'R 3 295 000',
        title: '2 bed apartment in Sea Point',
        location: 'Cape Town, Western Cape',
        beds: 2,
        baths: 2,
        garages: 1,
        size: '96 m²',
    },
    {
        id: 's3',
        image: pexels(8134820, 900),
        badge: 'Featured',
        price: 'R 5 900 000',
        title: '4 bed cluster in Bryanston',
        location: 'Sandton, Johannesburg',
        beds: 4,
        baths: 3,
        garages: 3,
        size: '410 m²',
    },
    {
        id: 's4',
        image: pexels(30484316, 900),
        badge: 'New',
        price: 'R 2 180 000',
        title: '3 bed townhouse in Umhlanga Ridge',
        location: 'Durban, KwaZulu-Natal',
        beds: 3,
        baths: 2,
        garages: 2,
        size: '184 m²',
    },
];

export const featuredToRent: ListingSummary[] = [
    {
        id: 'r1',
        image: pexels(6588599, 900),
        badge: 'New',
        price: 'R 12 500',
        priceSuffix: '/ month',
        title: '2 bed apartment in Menlyn',
        location: 'Pretoria, Gauteng',
        beds: 2,
        baths: 1,
        garages: 1,
        size: '78 m²',
    },
    {
        id: 'r2',
        image: pexels(6422929, 900),
        badge: 'Featured',
        price: 'R 24 000',
        priceSuffix: '/ month',
        title: '3 bed house in Claremont',
        location: 'Cape Town, Western Cape',
        beds: 3,
        baths: 2,
        garages: 2,
        size: '240 m²',
    },
    {
        id: 'r3',
        image: pexels(20390760, 900),
        price: 'R 9 800',
        priceSuffix: '/ month',
        title: '1 bed loft in Maboneng',
        location: 'Johannesburg, Gauteng',
        beds: 1,
        baths: 1,
        garages: 1,
        size: '64 m²',
    },
    {
        id: 'r4',
        image: pexels(1643383, 900),
        price: 'R 16 750',
        priceSuffix: '/ month',
        title: '2 bed apartment in Umhlanga',
        location: 'Durban, KwaZulu-Natal',
        beds: 2,
        baths: 2,
        garages: 1,
        size: '112 m²',
    },
];

export const developments: Development[] = [
    {
        image: pexels(29145562, 900),
        name: 'Olivewood Estate',
        location: 'Centurion, Gauteng',
        priceFrom: 'R 1 195 000',
        units: 42,
    },
    {
        image: pexels(17672408, 900),
        name: 'The Bluff Collection',
        location: 'Umhlanga, KwaZulu-Natal',
        priceFrom: 'R 2 450 000',
        units: 18,
    },
    {
        image: pexels(38274451, 900),
        name: 'Vineyard Walk',
        location: 'Stellenbosch, Western Cape',
        priceFrom: 'R 3 100 000',
        units: 9,
    },
    {
        image: pexels(18362805, 900),
        name: 'Linden Yard Lofts',
        location: 'Randburg, Johannesburg',
        priceFrom: 'R 849 000',
        units: 66,
    },
    {
        image: pexels(34443159, 900),
        name: 'Waterkloof Rise',
        location: 'Pretoria East, Gauteng',
        priceFrom: 'R 1 675 000',
        units: 27,
    },
];

export const popularAreas = [
    { image: pexels(4064211, 800), name: 'Sea Point', listings: '2 406' },
    { image: pexels(6422929, 800), name: 'Centurion', listings: '3 274' },
    {
        image: pexels(37833044, 800),
        name: 'Cape Town City Bowl',
        listings: '3 912',
    },
    { image: pexels(35374021, 800), name: 'Camps Bay', listings: '742' },
    { image: pexels(18362805, 800), name: 'Sandton', listings: '5 160' },
    { image: pexels(129494, 800), name: 'Umhlanga', listings: '1 938' },
];

export const agents = [
    {
        image: pexels(30004322, 400),
        name: 'Megan Kruger',
        agency: 'Keystone Properties · Pretoria East',
        listings: 64,
        years: 11,
    },
    {
        image: pexels(8815878, 400),
        name: 'Riaan de Villiers',
        agency: 'Cape Reach Realty · Sea Point',
        listings: 38,
        years: 7,
    },
    {
        image: pexels(34381970, 400),
        name: 'Chantal Oosthuizen',
        agency: 'Ridge & Bay · Umhlanga',
        listings: 51,
        years: 9,
    },
];

export const articles = [
    {
        image: pexels(1743227, 800),
        tag: 'Buying',
        tone: 'blue',
        title: "Transfer duty in 2026: what you'll actually pay on a R 1,8m home",
        readTime: '6 min read',
    },
    {
        image: pexels(6492403, 800),
        tag: 'Renting',
        tone: 'red',
        title: 'Your deposit rights as a tenant — and how to get it back in full',
        readTime: '4 min read',
    },
    {
        image: pexels(6933852, 800),
        tag: 'Market',
        tone: 'blue',
        title: 'Semigration slows: where Western Cape prices are cooling',
        readTime: '5 min read',
    },
] as const;

export const centurionSuburbs = [
    'Laudium',
    'Kosmosdal',
    'Wierda Park',
    'Erasmia',
    'Thatch Hill Estate',
    'Zwartkop',
    'Celtisdal',
    'Hennopspark',
    'Irene',
    'Heuweloord',
    'Olievenhoutbosch',
    'Die Hoewes',
    'Raslouw',
    'Valhalla',
    'Lyttelton Manor',
];

export const showcaseReference = 'M243-117647';

export const searchResults: SearchResult[] = [
    {
        image: pexels(6588599, 800),
        prices: { buy: 'R 1 450 000', rent: 'R 11 250' },
        agency: 'Keystone Capital',
        type: '3 bedroom apartment',
        suburb: 'Raslouw',
        address: '258 Ephrams View, 1 Erasmus Avenue',
        description: {
            buy: 'Modern three-bedroom apartment in a secure Raslouw complex, with a private patio and fibre already installed.',
            rent: 'Modern three-bedroom apartment in a secure Raslouw complex, with a private patio and fibre already installed.',
        },
        beds: 3,
        baths: 2,
        garages: 1,
        size: '131 m²',
    },
    {
        image: pexels(6422929, 800),
        prices: { buy: 'R 1 795 000', rent: 'R 12 000' },
        agency: 'Listed by owner',
        type: '3 bedroom house',
        suburb: 'Heuweloord',
        address: '24 Wit-Elshout Avenue',
        description: {
            buy: 'Spacious three-bedroom, two-bathroom home for sale in Heuweloord, complete with a walled garden and borehole.',
            rent: 'Spacious three-bedroom, two-bathroom home to let in Heuweloord, complete with a walled garden and borehole.',
        },
        beds: 3,
        baths: 2,
        garages: 2,
        size: '186 m²',
    },
    {
        image: pexels(20390760, 800),
        prices: { buy: 'R 1 095 000', rent: 'R 11 000' },
        agency: 'Jacaranda Group',
        type: '2 bedroom apartment',
        suburb: 'Die Hoewes',
        address: '12 Glover Avenue, Unit 304',
        description: {
            buy: 'Bright corner unit a short walk from Centurion Gate, with secure parking and a north-facing balcony.',
            rent: 'Bright corner unit a short walk from Centurion Gate, with secure parking and a north-facing balcony.',
        },
        beds: 2,
        baths: 1,
        garages: 1,
        size: '98 m²',
    },
    {
        image: pexels(1643383, 800),
        prices: { buy: 'R 2 650 000', rent: 'R 14 500' },
        agency: 'Ridge & Bay',
        type: '3 bedroom townhouse',
        suburb: 'Irene Farm Villages',
        address: '8 Nellmapius Drive',
        description: {
            buy: 'Three-bedroom townhouse in a village estate with clubhouse access, pet friendly on request.',
            rent: 'Three-bedroom townhouse in a village estate with clubhouse access, pet friendly on request.',
        },
        beds: 3,
        baths: 2,
        garages: 2,
        size: '164 m²',
    },
];

export const showcaseGallery = [
    pexels(6588599, 1600),
    pexels(6934189, 900),
    pexels(6492403, 900),
];

export const showcaseThumbnails = [
    6588599, 6934189, 6492403, 20390760, 1643383, 1743227, 6933852, 6422929,
    8134821,
].map((id) => pexels(id, 500));

export const agentPortrait = pexels(30004322, 400);
