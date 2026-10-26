import {publishedPage} from '../../lib/cms/public';
import {ManagedLegalPage} from '../../components/managed-legal-page';
export const metadata={title:'Privacy Policy',description:'What iFranchise collects, why we use it, how it is stored and how to exercise your privacy choices.',alternates:{canonical:'/privacy-policy'}};
export default async function Page(){const [page,contact]=await Promise.all([publishedPage('privacy-policy'),publishedPage('contact-us')]);return <ManagedLegalPage page={page} contact={contact}/>}
