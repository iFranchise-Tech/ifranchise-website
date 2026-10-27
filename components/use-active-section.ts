'use client';
import {useEffect, useState} from 'react';
import {activeReadingSection} from '../lib/active-section.mjs';

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] || '');
  const key = JSON.stringify(ids);
  useEffect(() => {
    const currentIds: string[] = JSON.parse(key);
    let frame = 0;
    function update() {
      frame = 0;
      const header = document.querySelector('.p-header');
      const line = Math.max(0, header?.getBoundingClientRect().bottom || 0) + 36;
      const sections = currentIds.flatMap(id => {
        const section = document.getElementById(id);
        return section ? [{id, top: section.getBoundingClientRect().top}] : [];
      });
      const atEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      setActive(activeReadingSection(sections, line, atEnd));
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    const header = document.querySelector('.p-header');
    if (header) observer.observe(header);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [key]);
  return active;
}
