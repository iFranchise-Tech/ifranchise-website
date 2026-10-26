import {publishedPage} from '../../lib/cms/public';
import {ManagedLegalPage} from '../../components/managed-legal-page';
export const metadata={title:'Terms & Conditions',description:'Terms for using the iFranchise website, franchise information, content and enquiry services.',alternates:{canonical:'/terms-and-conditions'}};
export default async function Page(){const [page,contact]=await Promise.all([publishedPage('terms-and-conditions'),publishedPage('contact-us')]);return <ManagedLegalPage page={page} contact={contact}/>}
