import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BLOCK_INFO, Circuit } from "../../game/circuit";

/** Live 3D representation of the circuit. The actual editable controls remain below it. */
export function CircuitDisplay({ circuit }: { circuit: Circuit }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const circuitRef = useRef(circuit);
  circuitRef.current = circuit;
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6, 6, 2.8, -2.8, .1, 40);
    camera.position.set(5, 7, 12); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xc3e7ef, 0x14262e, 2));
    const light = new THREE.DirectionalLight(0xffbb72, 2.2); light.position.set(-4, 8, 5); scene.add(light);
    const dark = new THREE.MeshStandardMaterial({color:0x263f49, metalness:.65, roughness:.38});
    const frame = new THREE.MeshStandardMaterial({color:0x688890, metalness:.65, roughness:.32});
    const cyan = new THREE.MeshStandardMaterial({color:0x3fd9df, emissive:0x149ca9, emissiveIntensity:1.4});
    const orange = new THREE.MeshStandardMaterial({color:0xffb259, emissive:0xc76c16, emissiveIntensity:1.1});
    const block=(width:number,height:number,depth:number,mat:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene)=>{ const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh; };
    const nodes: THREE.Group[]=[];
    for(let i=0;i<4;i++){
      const group=new THREE.Group();group.position.set(-4.2+i*2.8,0,0);scene.add(group);nodes.push(group);
      block(2.05,.28,1.6,frame,0,.05,0,group);block(1.92,.25,1.46,dark,0,.31,0,group);
      block(1.55,.035,.08,i===3?orange:cyan,0,.46,.6,group);
      for(let j=0;j<3;j++)block(.22,.08,.18,i===3?orange:cyan,-.55+j*.55,.48,-.35,group);
      const top=new THREE.Mesh(new THREE.TorusGeometry(.31,.035,8,32),i===3?orange:cyan);top.rotation.x=Math.PI/2;top.position.set(0,.52,.15);group.add(top);
    }
    // Signal conduits are continuous 3D geometry, with travelling light pulses.
    const paths: THREE.Mesh[]=[];
    for(let i=0;i<3;i++){block(.8,.08,.08,frame,-2.8+i*2.8,.22,0);const pulse=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8),cyan);scene.add(pulse);paths.push(pulse);}
    const base = new THREE.GridHelper(14, 28, 0x345862, 0x203b45); base.position.y=-.15;scene.add(base);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/Math.max(h,1);const half=Math.max(2.9,5.6/aspect);camera.top=half;camera.bottom=-half;camera.left=-half*aspect;camera.right=half*aspect;camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(host);resize();let frameId=0;const clock=new THREE.Clock();
    const tick=()=>{frameId=requestAnimationFrame(tick);const t=clock.getElapsedTime();paths.forEach((p,i)=>{p.position.set(-3.2+i*2.8+(reduced.matches?.4:(t*.8+i*.23)%1)*.8,.3,0);});nodes.forEach((n,i)=>{n.position.y=reduced.matches?0:Math.sin(t*1.2-i*.4)*.025;});const active=circuitRef.current.consistency!=="none";nodes[2].children.forEach(child=>{if(child instanceof THREE.Mesh && (child.material===cyan || child.material===orange))child.visible=active;});renderer.render(scene,camera);};tick();
    return ()=>{cancelAnimationFrame(frameId);observer.disconnect();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();} else if(o instanceof THREE.GridHelper){o.geometry.dispose();const m=o.material;(Array.isArray(m)?m:[m]).forEach(x=>x.dispose());}});[dark,frame,cyan,orange].forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
  }, []);
  const labels=[{label:"СЕНСОРЫ",value:"A / B / C"},{label:"АГРЕГАЦИЯ",value:BLOCK_INFO[circuit.agg].name},{label:"СОГЛАСОВАННОСТЬ",value:circuit.consistency === "none" ? "ОТКЛЮЧЕНО" : BLOCK_INFO[circuit.consistency].name},{label:"ПРАВИЛО",value:BLOCK_INFO[circuit.rule].name}];
  return <div className="circuit-display"><div className="circuit-display-top"><span>СХЕМА В РЕАЛЬНОМ ВРЕМЕНИ</span><span><i/> КОНТУР O₂</span></div><div className="circuit-canvas" ref={hostRef} aria-hidden="true"/><div className="circuit-labels">{labels.map((item)=><div key={item.label}><small>{item.label}</small><strong>{item.value}</strong></div>)}</div></div>;
}
