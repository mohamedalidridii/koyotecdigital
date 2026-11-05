import { about } from './about';
import { contactPage } from './contact';
import { home } from './home';
import type { PageId } from './parts';
import { services } from './services';

/** Page id → HTML. Pure functions: also run at build time to prerender each page into its HTML file. */
export const renders: Record<PageId, () => string> = { home, about, services, contact: contactPage };
