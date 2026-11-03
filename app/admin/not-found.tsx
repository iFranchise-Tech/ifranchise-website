import Link from 'next/link';

export default function AdminNotFound(){
 return <div className="cms-root"><section className="cms-panel"><h1>Page not found</h1><p>This CMS address is unavailable.</p><Link className="cms-button" href="/admin">Go to Overview</Link></section></div>;
}
