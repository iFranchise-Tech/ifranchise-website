'use client';
import {useActiveSection} from './use-active-section';

export function PolicyNavigation({sections, label}: {sections: {id: string; heading: string}[]; label: string}) {
  const active = useActiveSection(sections.map(section => section.id));
  return <aside className="policy-navigation"><strong>On this page</strong><nav aria-label={label}>{sections.map(section => <a href={'#' + section.id} key={section.id} aria-current={active === section.id ? 'location' : undefined}>{section.heading}</a>)}</nav></aside>;
}
