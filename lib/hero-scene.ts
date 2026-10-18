import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/** Fixed camera: all motion belongs to objects in the scene, never the background image. */
export function createHeroScene(host:HTMLDivElement){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#100a1b',19,34);
 const camera=new THREE.PerspectiveCamera(31,1,.1,60);camera.position.set(9.8,7.5,13.5);camera.lookAt(.1,1.6,0);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
 const env=pmrem.fromScene(room,.06);scene.environment=env.texture;room.dispose();pmrem.dispose();
 const mats=[
  new THREE.MeshPhysicalMaterial({color:'#74539d',metalness:.82,roughness:.23,clearcoat:.9}),
  new THREE.MeshPhysicalMaterial({color:'#b8a0cf',metalness:.82,roughness:.19,clearcoat:1}),
  new THREE.MeshPhysicalMaterial({color:'#332142',metalness:.65,roughness:.28,clearcoat:.7}),
  new THREE.MeshPhysicalMaterial({color:'#d5c8e3',metalness:.96,roughness:.16,clearcoat:1})
 ];
 scene.add(new THREE.HemisphereLight('#e4cfff','#1b1026',1.5));
 const key=new THREE.DirectionalLight('#f3e9ff',3);key.position.set(-4,10,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.04;scene.add(key);
 const rim=new THREE.DirectionalLight('#9d74d3',4);rim.position.set(5,5,-4);scene.add(rim);
 const fill=new THREE.DirectionalLight('#d4bce8',1.2);fill.position.set(-7,3,-3);scene.add(fill);
 const geometries:THREE.BufferGeometry[]=[];
 function mesh(geometry:THREE.BufferGeometry,material:THREE.Material){geometries.push(geometry);const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;return m;}
 const floorMat=new THREE.MeshStandardMaterial({color:'#160e20',metalness:.2,roughness:.48});
 const floor=mesh(new THREE.PlaneGeometry(80,80),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.12;scene.add(floor);
 const stage=mesh(new THREE.CylinderGeometry(4.8,4.8,.25,96),mats[2]);stage.position.set(.5,.02,0);scene.add(stage);
 function arch(width:number,height:number,depth:number){
  const r=width/2,thickness=.32,spring=height-r,inner=r-thickness;
  const s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,0);s.lineTo(-r,0);
  const h=new THREE.Path();h.moveTo(-inner,0);h.lineTo(inner,0);h.lineTo(inner,spring);h.absarc(0,spring,inner,0,Math.PI,false);h.lineTo(-inner,0);s.holes.push(h);
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:48});g.translate(0,0,-depth/2);return g;
 }
 const gateways=[{x:-2.3,z:-.8,w:2.2,h:3.8,d:.52,m:1,turn:-.12},{x:.4,z:-1.3,w:2.75,h:5.1,d:.62,m:0,turn:.1},{x:3.1,z:-.9,w:2.1,h:3.5,d:.5,m:1,turn:-.2}].map(a=>{const m=mesh(arch(a.w,a.h,a.d),mats[a.m]);m.position.set(a.x,.17,a.z);m.rotation.y=a.turn;scene.add(m);return{mesh:m,base:a.turn};});
 // Two continuous tracks: the spheres roll on the rails rather than bobbing in empty space.
 const tracks=[{rx:4.1,rz:2.8,y:.62,phase:.8,speed:.075,radius:.29,mat:3},{rx:2.85,rz:1.95,y:.98,phase:3.4,speed:-.058,radius:.36,mat:0}];
 const movers=tracks.map(t=>{
  const pts=Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2;return new THREE.Vector3(Math.cos(a)*t.rx+.5,t.y,Math.sin(a)*t.rz);});
  const curve=new THREE.CatmullRomCurve3(pts,true);
  const rail=mesh(new THREE.TubeGeometry(curve,192,.065,10,true),mats[1]);scene.add(rail);
  const ball=mesh(new THREE.SphereGeometry(t.radius,40,28),mats[t.mat]);scene.add(ball);return{...t,ball};
 });
 const ring=mesh(new THREE.TorusGeometry(.68,.065,12,64),mats[1]);ring.position.set(.4,3.2,-1.15);scene.add(ring);
 const pearl=mesh(new THREE.SphereGeometry(.23,32,24),mats[3]);pearl.position.set(.4,3.2,-1.15);scene.add(pearl);
 let time=0,previous=0,frame=0,visible=true,disposed=false;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 function paused(){return document.documentElement.dataset.motion==='paused'||(!document.documentElement.dataset.motion&&media.matches);}
 function draw(){
  movers.forEach(t=>{const a=time*t.speed+t.phase;t.ball.position.set(Math.cos(a)*t.rx+.5,t.y+.065+t.radius,Math.sin(a)*t.rz);t.ball.rotation.set(a*t.rz/t.radius,0,-a*t.rx/t.radius);});
  gateways.forEach((g,i)=>{g.mesh.rotation.y=g.base+Math.sin(time*.13+i*1.7)*.045;});
  ring.rotation.y=time*.1;ring.rotation.x=Math.sin(time*.09)*.12;
  renderer.render(scene,camera);
 }
 function tick(now:number){if(disposed)return;frame=requestAnimationFrame(tick);if(now-previous<32)return;const dt=previous?Math.min((now-previous)/1000,.06):0;previous=now;time+=dt;draw();}
 function sync(){cancelAnimationFrame(frame);previous=0;const play=visible&&!document.hidden&&!paused();host.dataset.motionState=play?'playing':'paused';if(play)frame=requestAnimationFrame(tick);else draw();}
 function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();draw();}
 const size=new ResizeObserver(resize);size.observe(host);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});intersection.observe(host);
 const motion=new MutationObserver(sync);motion.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
 const contextLost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(frame);host.dataset.renderer='fallback';};renderer.domElement.addEventListener('webglcontextlost',contextLost);
 resize();draw();host.dataset.renderer='webgl';sync();
 return()=>{disposed=true;cancelAnimationFrame(frame);size.disconnect();intersection.disconnect();motion.disconnect();document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);renderer.domElement.removeEventListener('webglcontextlost',contextLost);geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());floorMat.dispose();env.dispose();renderer.dispose();renderer.domElement.remove();};
}
