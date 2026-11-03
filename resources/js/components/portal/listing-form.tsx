import type { ReactNode } from 'react';
import {
    Button,
    CardTitle,
    ErrorList,
    Field,
    PhotoSlot,
    SelectInput,
    TextArea,
    TextInput,
} from '@/components/portal/ui';

export const propertyTypes = [
    'House',
    'Apartment',
    'Townhouse',
    'Cluster',
    'Vacant land',
];

export const cities = [
    'Pretoria',
    'Centurion',
    'Johannesburg',
    'Sandton',
    'Cape Town',
    'Durban',
    'Stellenbosch',
    'George',
    'Polokwane',
];

export type Deal = 'Sale' | 'Rent';

/** Fields shared by the seller and agency listing forms. */
export type ListingFields = {
    deal: Deal;
    type: string;
    street: string;
    unit: string;
    suburb: string;
    city: string;
    price: string;
    beds: string;
    baths: string;
    size: string;
    desc: string;
};

export const minimumDescriptionLength = 40;

/** Errors that apply to every listing, whether it is saved or submitted. */
export function baseListingErrors(form: ListingFields): string[] {
    const errors: string[] = [];

    if (!form.street.trim()) {
        errors.push('Add the street address.');
    }

    if (!form.suburb.trim()) {
        errors.push('Add the suburb.');
    }

    if (!(Number(form.price) > 0)) {
        errors.push(
            `Enter a ${form.deal === 'Rent' ? 'monthly rent' : 'price'} above zero.`,
        );
    }

    if (!(Number(form.size) > 0)) {
        errors.push(
            `Enter the ${form.type === 'Vacant land' ? 'erf' : 'floor'} size.`,
        );
    }

    return errors;
}

/** Normalises form strings into the stored listing values. */
export function listingValues(form: ListingFields) {
    const isLand = form.type === 'Vacant land';

    return {
        deal: form.deal,
        type: form.type,
        street: form.street.trim(),
        unit: form.unit.trim(),
        suburb: form.suburb.trim(),
        city: form.city,
        price: Number(form.price),
        beds: isLand ? 0 : Number(form.beds) || 0,
        baths: isLand ? 0 : Number(form.baths) || 0,
        size: Number(form.size),
        desc: form.desc.trim(),
    };
}

export function FormSection({
    title,
    intro,
    children,
    first = false,
}: {
    title: string;
    intro?: string;
    children: ReactNode;
    first?: boolean;
}) {
    return (
        <section
            className={
                first
                    ? 'flex flex-col gap-3.5'
                    : 'flex flex-col gap-3.5 border-t border-portal-hair pt-[22px]'
            }
        >
            <div>
                <CardTitle>{title}</CardTitle>
                {intro && (
                    <p className="mt-1 text-[13px] text-portal-subtle">
                        {intro}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

export function ListingFormSections<T extends ListingFields>({
    form,
    onChange,
    streetPlaceholder,
    unitPlaceholder,
    descriptionPlaceholder,
    photoIntro,
}: {
    form: T;
    onChange: (key: keyof ListingFields, value: string) => void;
    streetPlaceholder: string;
    unitPlaceholder: string;
    descriptionPlaceholder: string;
    photoIntro: string;
}) {
    const isLand = form.type === 'Vacant land';
    const descriptionLength = form.desc.trim().length;
    const input = (key: keyof ListingFields) => ({
        value: form[key],
        onChange: (event: { target: { value: string } }) =>
            onChange(key, event.target.value),
    });

    return (
        <>
            <FormSection title="Address">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                    <Field label="Street address">
                        <TextInput
                            placeholder={streetPlaceholder}
                            {...input('street')}
                        />
                    </Field>
                    <Field label="Unit & complex (optional)">
                        <TextInput
                            placeholder={unitPlaceholder}
                            {...input('unit')}
                        />
                    </Field>
                    <Field label="Suburb">
                        <TextInput
                            placeholder="e.g. Waterkloof"
                            {...input('suburb')}
                        />
                    </Field>
                    <Field label="City">
                        <SelectInput options={cities} {...input('city')} />
                    </Field>
                </div>
            </FormSection>
            <FormSection title="Details">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
                    <Field
                        label={
                            form.deal === 'Rent'
                                ? 'Monthly rent (R)'
                                : 'Asking price (R)'
                        }
                    >
                        <TextInput
                            type="number"
                            min="0"
                            placeholder="0"
                            {...input('price')}
                        />
                    </Field>
                    {!isLand && (
                        <>
                            <Field label="Bedrooms">
                                <TextInput
                                    type="number"
                                    min="0"
                                    {...input('beds')}
                                />
                            </Field>
                            <Field label="Bathrooms">
                                <TextInput
                                    type="number"
                                    min="0"
                                    {...input('baths')}
                                />
                            </Field>
                        </>
                    )}
                    <Field label={isLand ? 'Erf size (m²)' : 'Floor size (m²)'}>
                        <TextInput
                            type="number"
                            min="0"
                            placeholder="0"
                            {...input('size')}
                        />
                    </Field>
                </div>
                <Field
                    label="Description"
                    hint={`${descriptionLength} characters${descriptionLength < minimumDescriptionLength ? ` · at least ${minimumDescriptionLength} to submit` : ''}`}
                >
                    <TextArea
                        placeholder={descriptionPlaceholder}
                        {...input('desc')}
                    />
                </Field>
            </FormSection>
            <FormSection title="Photos" intro={photoIntro}>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
                    {['Cover photo', 'Photo 2', 'Photo 3', 'Photo 4'].map(
                        (label) => (
                            <PhotoSlot key={label} label={label} />
                        ),
                    )}
                </div>
            </FormSection>
        </>
    );
}

export function ListingFormFooter({
    errors,
    onCancel,
    note,
    draftLabel,
    onSaveDraft,
    submitLabel,
    onSubmit,
}: {
    errors: string[];
    onCancel: () => void;
    note?: string;
    draftLabel: string;
    onSaveDraft: () => void;
    submitLabel?: string;
    onSubmit?: () => void;
}) {
    return (
        <>
            <ErrorList errors={errors} />
            <div className="flex flex-wrap items-center gap-2 border-t border-portal-hair pt-[22px]">
                <Button size="lg" onClick={onCancel}>
                    Cancel
                </Button>
                <span className="flex-1 text-right text-xs text-portal-subtle">
                    {note}
                </span>
                <Button size="lg" onClick={onSaveDraft}>
                    {draftLabel}
                </Button>
                {submitLabel && onSubmit && (
                    <Button size="lg" variant="primary" onClick={onSubmit}>
                        {submitLabel}
                    </Button>
                )}
            </div>
        </>
    );
}
