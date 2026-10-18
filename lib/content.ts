import {editorialArticles} from './editorial';
import pages from '../content/normalized-pages.json';
import blogs from '../content/blogs.json';
import knowledge from '../content/knowledge.json';
import models from '../content/franchise-models.json';
import budgets from '../content/investment-pages.json';
import cities from '../content/cities.json';
import careerData from '../content/careers.json';
import redirects from '../content/redirects.json';
export {pages,blogs,knowledge,models,budgets,cities,careerData,redirects};
export const articles=editorialArticles;
export const editorialPages:Record<string,any>=Object.fromEntries(pages.map(p=>[p.path,p]));
for(const m of models)editorialPages[m.path]={path:m.path,title:m.title,intro:m.subtitle,sections:[{heading:m.fullTitle,body:[m.explanation]},{heading:'How it works',bullets:m.howItWorks},{heading:'Potential advantages',bullets:m.advantages},{heading:'Challenges to consider',bullets:m.challenges},{heading:'Who it may suit',body:[m.idealInvestor]},{heading:'Investment considerations',bullets:m.investmentConsiderations}],faqs:m.faqs,sourceUrl:m.sourceUrl};
for(const [path,b] of Object.entries(budgets))editorialPages[path]={path,title:b.title,intro:b.subtitle.replace('verified ','').replace('high ROI','commercial'),sections:b.educationalSections.map(s=>({...s,body:[s.body]})),budget:b};
export const articleByPath=Object.fromEntries(articles.map(a=>[a.path,a]));
export const cityByPath=Object.fromEntries(cities.map(c=>['/location/'+c.slug,c]));
export const jobs=careerData.jobs.filter(j=>j.active);
export const jobByPath=Object.fromEntries(jobs.map(j=>['/careers/'+j.id,j]));
export const migratedPaths=[...new Set([...Object.keys(editorialPages),...Object.keys(articleByPath),...Object.keys(cityByPath),...Object.keys(jobByPath),'/blogs','/resources/knowledge-hub','/resources/knowledge-hub/investor','/resources/knowledge-hub/brand','/franchise-readiness-assessment'])];

editorialPages['/high-roi-franchise-opportunities'].title='Compare franchise commercial terms';
editorialPages['/high-roi-franchise-opportunities'].intro='Look beyond projected returns. Compare costs, responsibilities and supporting evidence before selecting a franchise.';

editorialPages['/about-us'].title='About iFranchise';
editorialPages['/about-us'].intro='Get to know our franchise consulting approach. We help you compare business opportunities and prepare your brand for expansion across India.';
