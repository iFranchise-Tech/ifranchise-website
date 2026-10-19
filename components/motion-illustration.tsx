'use client';

import {useEffect, useId, useRef} from 'react';
import {MotionControl} from './experience';
import {ConsultingScene} from './illustrations/consulting-scene';
import {TeamScene} from './illustrations/team-scene';
import {ExpansionScene} from './illustrations/expansion-scene';
import {CareersScene} from './illustrations/careers-scene';

const scenes = {
  consulting: {Art: ConsultingScene, title: 'Planning your franchise together', description: 'Two professionals discuss a miniature franchise outlet and business plan in a shared workspace.'},
  team: {Art: TeamScene, title: 'Meet your franchise consulting team', description: 'Three colleagues work together on a franchise plan around a shared table.'},
  expansion: {Art: ExpansionScene, title: 'Preparing your business for more locations', description: 'A business owner stands beside an established shop, with a route connecting two new franchise locations.'},
  careers: {Art: CareersScene, title: 'Working together at iFranchise', description: 'Colleagues develop a project roadmap in a workshop, with one presenting and another working at a laptop.'},
};

export function MotionIllustration({scene}: {scene: keyof typeof scenes}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const {Art, title, description} = scenes[scene];
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    }, {rootMargin: '50px'});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`motion-illustration scene-${scene}`} data-visible="false">
    <svg className="motion-scene" viewBox="0 0 720 470" width="720" height="470" role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-description`}>{description}</desc>
      <Art/>
    </svg>
    <div className="scene-motion-control"><MotionControl/></div>
  </div>;
}
