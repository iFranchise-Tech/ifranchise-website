'use client';
import {useState} from 'react';
import {ArrowUpRight,Search,MapPin,BriefcaseBusiness,Award} from 'lucide-react';
import {PhotoHero} from './photo-hero';
import {PremiumLink} from './premium';
export function CareersPage({jobs}:{jobs:any[]}){
 const [query,setQuery]=useState(''),[department,setDepartment]=useState('all');
 const departments=[...new Set(jobs.map(j=>j.dept))];
 const filtered=jobs.filter(j=>(department==='all'||j.dept===department)&&(j.title+' '+j.dept+' '+j.location).toLowerCase().includes(query.toLowerCase()));
 return <main id="main" className="p-page careers-page">
  <PhotoHero compact image="/assets/stock-heroes/careers-client-team.webp" imageAlt="Colleagues reviewing documents together in their office" breadcrumb="Careers" title={<>Careers at<span>iFranchise.</span></>} description="Work with business owners and prospective franchise partners on the decisions behind business expansion." actions={<PremiumLink href="#open-roles">Explore open roles</PremiumLink>}/>
  <section className="p-container careers-openings" id="open-roles"><div className="careers-list-heading"><h2>Open positions</h2><p>Explore the responsibilities, requirements and application details for each role.</p></div><div className="careers-search-tools"><label className="career-search"><Search size={19}/><input type="search" placeholder="Search roles" aria-label="Search roles" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filter by department" value={department} onChange={e=>setDepartment(e.target.value)}><option value="all">All departments</option>{departments.map(d=><option key={d}>{d}</option>)}</select></div><div className="careers-job-list">{filtered.map(j=><a className="careers-job" key={j.id} href={'/careers/'+j.id}><div className="careers-job-title"><span>{j.dept}</span><h3>{j.title}</h3><p>{j.tagline}</p></div><div className="careers-job-meta"><span><BriefcaseBusiness size={16}/>{j.type}</span><span><MapPin size={16}/>{j.mode||j.location}</span>{j.experience&&j.experience.toLowerCase()!==j.type?.toLowerCase()&&<span><Award size={16}/>{j.experience}</span>}</div><span className="careers-job-arrow"><ArrowUpRight size={23}/></span></a>)}</div>{!filtered.length&&<div className="careers-no-results"><h3>No matching roles</h3><p>{jobs.length?'Try another keyword or department.':'There are no open roles at the moment.'}</p>{jobs.length>0&&<button onClick={()=>{setQuery('');setDepartment('all')}}>Clear filters</button>}</div>}</section>
 </main>;
}
