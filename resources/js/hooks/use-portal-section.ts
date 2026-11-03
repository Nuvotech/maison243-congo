import { router } from '@inertiajs/react';
import { useCallback } from 'react';

/**
 * Switches a portal section with a client-side visit, so the URL is
 * shareable while the in-memory portal state survives the change.
 */
export function usePortalSection<T extends string>(
    urlFor: (section: T) => string,
): (section: T) => void {
    return useCallback(
        (section: T) => {
            router.push({
                url: urlFor(section),
                props: (current) => ({ ...current, section }),
                preserveState: true,
                preserveScroll: false,
            });
        },
        [urlFor],
    );
}
