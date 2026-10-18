import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/** An iFranchise hub connecting business formats. Fixed camera; only network activity moves. */
export function createHeroScene(host:HTMLDivElement){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#100a1b');scene.fog=new THREE.Fog('#100a1b',22,40);
 const camera=new THREE.PerspectiveCamera(31,1,.1,60);camera.position.set(10,9,14);camera.lookAt(0,1,0);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.06);scene.environment=env.texture;room.dispose();pmrem.dispose();
 const materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[],textures:THREE.Texture[]=[];
 function material(color:string,metalness=.2,roughness=.35){const m=new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.5});materials.push(m);return m;}
 const plum=material('#593483',.62),lilac=material('#baa0d0',.45),white=material('#ece5f2',.18),dark=material('#211330',.35),glass=material('#7d63a2',.7,.15),silver=material('#d1badf',.8,.18);
 scene.add(new THREE.HemisphereLight('#edddff','#20132e',2));
 const key=new THREE.DirectionalLight('#f4eaff',3.5);key.position.set(-4,12,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9});key.shadow.normalBias=.04;scene.add(key);
 const rim=new THREE.DirectionalLight('#b291e1',3);rim.position.set(6,6,-4);scene.add(rim);
 function mesh(g:THREE.BufferGeometry,m:THREE.Material,parent:THREE.Object3D=scene,x=0,y=0,z=0){geometries.push(g);const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;o.position.set(x,y,z);parent.add(o);return o;}
 function box(w:number,h:number,d:number,m:THREE.Material,p:THREE.Object3D,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);}
 const floor=mesh(new THREE.PlaneGeometry(80,80),dark);floor.rotation.x=-Math.PI/2;floor.position.y=-.35;
 const platform=mesh(new THREE.CylinderGeometry(5.2,5.45,.35,96),plum);platform.position.y=-.15;
 mesh(new THREE.CylinderGeometry(5.12,5.12,.04,96),dark,scene,0,.045,0);
 // Central plinth carries the original artwork, rather than a substitute brand symbol.
 const hub=new THREE.Group();scene.add(hub);hub.position.set(0,0,-.2);
 box(2,2.3,1.55,plum,hub,0,1.25,0);box(2.22,.14,1.75,lilac,hub,0,2.48,0);
 box(1.55,1.55,.035,white,hub,0,1.5,.8);
 const logo=new THREE.TextureLoader().load('/assets/brandmark-texture.png',()=>draw());logo.colorSpace=THREE.SRGBColorSpace;textures.push(logo);
 const logoMat=new THREE.MeshBasicMaterial({map:logo,transparent:true});materials.push(logoMat);mesh(new THREE.PlaneGeometry(1.05,.95),logoMat,hub,0,1.55,.823);
 // All storefronts are neutral business formats; no partner receives homepage endorsement.
 function label(text:string){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d')!;ctx.fillStyle='#f2ebf7';ctx.fillRect(0,0,512,96);ctx.fillStyle='#3d2255';ctx.font='600 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);const m=new THREE.MeshBasicMaterial({map:t});materials.push(m);return m;}
 const stores=[{x:-3.05,z:1.15,name:'RETAIL'},{x:2.85,z:2,name:'CAFÉ'},{x:-2.7,z:-2.35,name:'SERVICES'},{x:2.45,z:-2.35,name:'LEARNING'}];
 const doors:THREE.Group[]=[];
 stores.forEach((s,i)=>{const g=new THREE.Group();g.position.set(s.x,.07,s.z);scene.add(g);box(1.9,.16,1.6,lilac,g,0,.08,0);box(1.65,1.25,1.25,i%2?white:lilac,g,0,.75,0);box(1.84,.18,1.45,plum,g,0,1.45,0);box(1.45,.27,.05,label(s.name),g,0,1.23,.66);
 box(.84,.75,.04,glass,g,-.3,.69,.65);box(.04,.75,.045,white,g,-.3,.69,.68);
 const door=new THREE.Group();door.position.set(.32,.27,.68);g.add(door);box(.47,.86,.05,glass,door,.235,.43,0);box(.025,.12,.03,silver,door,.39,.42,.05);doors.push(door);
 for(let j=0;j<7;j++)box(.245,.055,.48,j%2?white:plum,g,-.735+j*.245,1.11,.87).rotation.x=-.17;
 for(const px of [-.72,.72]){box(.035,.82,.035,silver,g,px,.52,1.02);}
 });
 const connectionMaterial=new THREE.MeshBasicMaterial({color:'#c9b2e3'});materials.push(connectionMaterial);
 const routes=stores.map((s,i)=>{const from=new THREE.Vector3(0,.23,.7),to=new THREE.Vector3(s.x,.23,s.z+1.12),mid=new THREE.Vector3(s.x*.5,.23,s.z>0?2.35:s.z+1.1);const path=new THREE.QuadraticBezierCurve3(from,mid,to);mesh(new THREE.TubeGeometry(path,40,.035,8,false),connectionMaterial);const bead=mesh(new THREE.SphereGeometry(.075,16,12),white);return{path,bead,phase:i*.24};});
 function person(x:number,z:number,shade:THREE.Material){const g=new THREE.Group();g.position.set(x,.12,z);scene.add(g);mesh(new THREE.SphereGeometry(.1,16,12),white,g,0,.65,0);mesh(new THREE.CapsuleGeometry(.07,.22,4,8),shade,g,0,.4,0);box(.045,.25,.045,dark,g,-.055,.15,0);box(.045,.25,.045,dark,g,.055,.15,0);return g;}
 person(-3.5,2.45,plum);person(3.6,2.9,lilac);const walker=person(-.8,3.1,lilac);
 const trees=[[-4,0],[4,-.7],[-.8,-3.65]];trees.forEach(([x,z])=>{mesh(new THREE.CylinderGeometry(.18,.14,.32,20),silver,scene,x,.23,z);mesh(new THREE.CylinderGeometry(.045,.045,.55,12),dark,scene,x,.62,z);mesh(new THREE.SphereGeometry(.3,24,16),lilac,scene,x,.98,z);});
 let time=0,previous=0,frame=0,visible=true,disposed=false;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 function paused(){return document.documentElement.dataset.motion==='paused'||(!document.documentElement.dataset.motion&&media.matches);}
 function draw(){if(disposed)return;routes.forEach(({path,bead,phase})=>bead.position.copy(path.getPoint((time*.055+phase)%1)));doors.forEach((d,i)=>{d.rotation.y=-Math.max(0,Math.sin(time*.23+i*1.8))*.35;});walker.position.x=-.8+Math.sin(time*.16)*.7;walker.rotation.y=Math.cos(time*.16)>0?Math.PI/2:-Math.PI/2;renderer.render(scene,camera);}
 function tick(now:number){if(disposed)return;frame=requestAnimationFrame(tick);if(now-previous<32)return;const dt=previous?Math.min((now-previous)/1000,.06):0;previous=now;time+=dt;draw();}
 function sync(){cancelAnimationFrame(frame);previous=0;const play=visible&&!document.hidden&&!paused();host.dataset.motionState=play?'playing':'paused';if(play)frame=requestAnimationFrame(tick);else draw();}
 function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.position.set(10,9,14).multiplyScalar(width/height<1.15?1.12:1);camera.updateProjectionMatrix();draw();}
 const size=new ResizeObserver(resize);size.observe(host);const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();});intersection.observe(host);
 const motion=new MutationObserver(sync);motion.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
 const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);host.dataset.renderer='fallback';};renderer.domElement.addEventListener('webglcontextlost',lost);
 resize();host.dataset.renderer='webgl';sync();
 return()=>{disposed=true;cancelAnimationFrame(frame);size.disconnect();intersection.disconnect();motion.disconnect();document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);renderer.domElement.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();};
}
