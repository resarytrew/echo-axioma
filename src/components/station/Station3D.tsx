import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Point = { id: string; label: string; hint: string; x: number; z: number; color: number };
const points: Point[] = [
  { id: "sensors", label: "Блок датчиков кислорода", hint: "Три независимых канала контроля атмосферы", x: -5.8, z: -6.0, color: 0xffa548 },
  { id: "monitor", label: "Монитор атмосферы", hint: "Показания датчиков и состояние тревоги", x: 5.5, z: -6.0, color: 0x65dbe7 },
  { id: "console", label: "Инженерный терминал", hint: "Диагностика и настройка алгоритма", x: 3.8, z: 1.7, color: 0xffa548 },
  { id: "door", label: "Шлюз S-02", hint: "Герметичный переход в соседний отсек", x: -8.7, z: 0, color: 0x65dbe7 },
];

export function Station3D({ onInteract, restored }: { onInteract: (id: string) => void; restored: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const controls = useRef<Set<string>>(new Set());
  const nearbyRef = useRef<string | null>(null);
  const actionRef = useRef(onInteract);
  actionRef.current = onInteract;
  const [nearby, setNearby] = useState<Point | null>(null);
  const [message, setMessage] = useState("Исследуйте станцию. Подойдите к светящемуся терминалу.");
  const [error, setError] = useState(false);
  const [inspected, setInspected] = useState<string | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const doorOpenRef = useRef(false);
  doorOpenRef.current = doorOpen;
  const interact = (id: string) => { setInspected(id); };
  const interactRef = useRef(interact); interactRef.current = interact;

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
    catch { setError(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x070f19);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07101a);
    scene.fog = new THREE.Fog(0x07101a, 40, 90);
    const camera = new THREE.OrthographicCamera(-12, 12, 9, -9, .1, 100);
    camera.position.set(19, 23, 23); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xbad8e8, 0x26303c, 1.5));
    const sun = new THREE.DirectionalLight(0xffe4c2, 2.7); sun.position.set(-8, 18, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -20; sun.shadow.camera.right = 20; sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20; scene.add(sun);
    const mat = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: .72, metalness: .18, ...extra });
    const floor = mat(0x7c8588), wall = mat(0xc5c6bf), dark = mat(0x35414c), trim = mat(0x5e7280), cyan = mat(0x43d5e1, { emissive: 0x18afc0, emissiveIntensity: 1.5 }), amber = mat(0xffa846, { emissive: 0xe97b20, emissiveIntensity: 1.4 }), white = mat(0xd5d8d2), black = mat(0x1a2832);
    const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    const cylinder = (radius: number, height: number, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,24), material); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    const warmLight = new THREE.PointLight(0xffa65c, 25, 16); warmLight.position.set(-6, 4, -4); scene.add(warmLight);
    const coolLight = new THREE.PointLight(0x4ccfe4, 16, 12); coolLight.position.set(6, 3, -5); scene.add(coolLight);
    const metal = mat(0x879195, {metalness:.65, roughness:.36}), orange = mat(0xc97938), glass = new THREE.MeshPhysicalMaterial({color:0x66cbd5, transparent:true, opacity:.28, roughness:.12, metalness:.15, side:THREE.DoubleSide}), leaf=mat(0x547d55), soil=mat(0x343c35);
    const label = (text:string, x:number,y:number,z:number, width:number,height:number, rotate=0, color="#d7e5e5") => {
      const canvas=document.createElement("canvas"); canvas.width=1024;canvas.height=256; const c=canvas.getContext("2d")!; c.fillStyle="rgba(0,0,0,0)"; c.clearRect(0,0,1024,256);c.fillStyle=color;c.font="bold 100px Arial"; c.fillText(text,25,155); const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));mesh.position.set(x,y,z);mesh.rotation.y=rotate;scene.add(mesh);return mesh;
    };
    // Foundation and tiled deck.
    box(20.8,.55,16.8,dark,0,-.38,0); box(20,.18,16,floor,0,-.02,0);
    for(let x=-9;x<=9;x+=2) for(let z=-7;z<=7;z+=2) { box(1.96,.025,1.96,(x+z)%4===0 ? floor : trim,x,.085,z); }
    for(let x=-8;x<=8;x+=4) { box(.06,.03,15.6, dark,x,.105,0); }
    for(let z=-6;z<=6;z+=4) { box(19.6,.03,.06,dark,0,.105,z); }
    // Cutaway walls, with structural columns and illuminated rails.
    box(20.6,3.8,.55,wall,0,1.9,-8.15); box(.55,3.8,16.5,wall,-10.15,1.9,0);
    box(20.6,.25,.7,dark,0,3.85,-8.15); box(.7,.25,16.5,dark,-10.15,3.85,0);
    box(19.8,.12,.08,amber,0,3.3,-7.84); box(.08,.12,15.5,amber,-9.84,3.3,0);
    [-9,-5,0,5,9].forEach(x => { box(.42,3.7,.35,trim,x,1.85,-7.8); });
    [-6,-2,2,6].forEach(z => { box(.35,3.7,.42,trim,-9.8,1.85,z); });
    // Low front walls keep the station readable from the camera.
    box(20.4,.48,.45,wall,0,.24,8.05); box(.45,.48,16,wall,10.05,.24,0);
    box(20,.08,.08,cyan,0,.5,7.83); box(.08,.08,15.6,cyan,9.83,.5,0);
    // Layered wall panels, conduits and industrial trim.
    for (let x=-9; x<=9; x+=1.8) { box(1.72,2.8,.08,wall,x,1.8,-7.83); box(1.55,.025,.03,trim,x,1.1,-7.76); }
    for (let z=-7; z<=7; z+=1.8) { box(.08,2.8,1.72,wall,-9.83,1.8,z); box(.03,.025,1.55,trim,-9.76,1.1,z); }
    for(let i=0;i<3;i++){ const pipe=cylinder(.075,8.5,metal,-4.5,3.5+i*.18,-7.58);pipe.rotation.z=Math.PI/2; }
    for(let x=-8;x<9;x+=2){box(.1,.45,.15,dark,x,3.52,-7.57);}
    label("S-02",-8.2,2.55,-7.7,2.2,.6,0,"#202d36");
    label("SENSOR BAY",-8.2,2.08,-7.69,2.1,.34,0,"#59666a");
    // Observation window above the workstation, with a curved planetary horizon.
    const windowCanvas=document.createElement("canvas");windowCanvas.width=1024;windowCanvas.height=512;const wc=windowCanvas.getContext("2d")!;
    const sky=wc.createLinearGradient(0,0,0,512);sky.addColorStop(0,"#061120");sky.addColorStop(.7,"#132f47");sky.addColorStop(1,"#5685a4");wc.fillStyle=sky;wc.fillRect(0,0,1024,512);
    for(let i=0;i<120;i++){const x=(i*197)%1024,y=(i*83)%340;wc.fillStyle=`rgba(205,232,255,${.25+(i%4)*.14})`;wc.fillRect(x,y,i%7===0?3:1,i%7===0?3:1);}
    wc.beginPath();wc.ellipse(690,830,890,590,-.16,0,Math.PI*2);wc.fillStyle="#306181";wc.fill();wc.lineWidth=18;wc.strokeStyle="#91dcfc";wc.stroke();
    wc.beginPath();wc.ellipse(690,850,875,590,-.16,0,Math.PI*2);wc.strokeStyle="rgba(229,244,245,.55)";wc.lineWidth=6;wc.stroke();
    for(let i=0;i<22;i++){wc.strokeStyle=`rgba(214,235,240,${.08+(i%3)*.04})`;wc.lineWidth=6+(i%3)*4;wc.beginPath();wc.ellipse(480+i*35,635+i*13,180+i*5,22,-.2,0,Math.PI*2);wc.stroke();}
    const windowTexture=new THREE.CanvasTexture(windowCanvas);windowTexture.colorSpace=THREE.SRGBColorSpace;
    box(7.4,1.5,.36,dark,5.2,4.55,-7.97);box(7.05,1.22,.05,new THREE.MeshBasicMaterial({map:windowTexture}),5.2,4.55,-7.75);
    for(let x=2;x<=8.5;x+=2.2)box(.16,1.45,.15,metal,x,4.55,-7.67);box(7.3,.12,.18,metal,5.2,3.82,-7.66);box(7.3,.12,.18,metal,5.2,5.27,-7.66);
    // Airlock on the left wall. Its two panels slide when operated.
    box(.28,3.65,3.3,dark,-9.68,1.83,0); box(.18,3.28,2.8,metal,-9.5,1.68,0);
    const doorGroup=new THREE.Group(); doorGroup.position.set(-9.35,0,0); scene.add(doorGroup);
    const doorA=box(.16,2.86,1.23,dark,0,1.54,-.65,doorGroup), doorB=box(.16,2.86,1.23,dark,0,1.54,.65,doorGroup);
    for(const z of [-1.45,1.45]) {box(.2,2.9,.08,amber,-9.3,1.55,z);}
    box(.08,.09,2.9,amber,-9.3,3.08,0);
    // Glass tank rack with separate observation tubes and fittings.
    const sensorGroup=new THREE.Group(); sensorGroup.position.set(-5.8,0,-6.35);scene.add(sensorGroup);
    box(4.7,.35,1.5,dark,0,.28,0,sensorGroup);box(4.5,.18,1.35,metal,0,.53,0,sensorGroup);box(4.65,.25,1.5,dark,0,3.15,0,sensorGroup);
    for(let i=0;i<3;i++) { const x=(i-1)*1.35; cylinder(.48,.2,metal,x,.72,0,sensorGroup);cylinder(.42,1.8,glass,x,1.7,0,sensorGroup);cylinder(.48,.18,metal,x,2.68,0,sensorGroup); cylinder(.22,1.3,cyan,x,1.68,0,sensorGroup); box(.08,1.8,.08,metal,x-.43,1.7,.03,sensorGroup);box(.08,1.8,.08,metal,x+.43,1.7,.03,sensorGroup);box(.45,.07,.04,i===2?amber:cyan,x,.84,.49,sensorGroup); }
    for(let x=-7.15;x<-3.9;x+=1.35){cylinder(.1,.6,metal,x,3.45,-6.35);}
    const pipeRack=cylinder(.12,3.5,metal,-5.8,3.76,-6.35);pipeRack.rotation.z=Math.PI/2;
    // Sensor plumbing, pressure valves and maintenance labels.
    for(let x=-7.15;x<-3.9;x+=1.35){const valve=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,8,20),orange);valve.position.set(x,3.5,-6.25);scene.add(valve);box(.04,.32,.04,metal,x,3.5,-6.23);box(.32,.04,.04,metal,x,3.5,-6.23);}
    for(let i=0;i<3;i++){label(`0${i+1}`,-7.15+i*1.35,.74,-5.57,.55,.22,0,"#bfebee");}
    // Wall screen with a canvas-drawn diagnostic trace.
    function screenTexture() { const c=document.createElement("canvas");c.width=1024;c.height=512;const ctx=c.getContext("2d")!;ctx.fillStyle="#081d27";ctx.fillRect(0,0,1024,512);ctx.strokeStyle="#1a4552";ctx.lineWidth=2;for(let x=40;x<1000;x+=80){ctx.beginPath();ctx.moveTo(x,65);ctx.lineTo(x,450);ctx.stroke()}for(let y=65;y<450;y+=64){ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(990,y);ctx.stroke()}ctx.fillStyle="#85d8df";ctx.font="bold 34px Arial";ctx.fillText("ATMOSPHERE  /  O2",45,48);ctx.font="25px monospace";ctx.fillText("CHANNEL A  20.8%",48,490);ctx.fillStyle="#ffb059";ctx.fillText("CHANNEL C  4.1%",580,490);ctx.strokeStyle="#59dce5";ctx.lineWidth=5;ctx.beginPath();for(let x=40;x<980;x+=12){let y=230+Math.sin(x*.025)*35+Math.sin(x*.11)*12+(x>510&&x<550?65:0);if(x===40)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t; }
    const displayMaterial=new THREE.MeshBasicMaterial({map:screenTexture()});
    const wallMonitor=new THREE.Group();wallMonitor.position.set(5.5,0,-7.55);scene.add(wallMonitor);box(5,2.35,.25,dark,0,2.3,0,wallMonitor);box(4.7,2.05,.06,displayMaterial,0,2.3,.16,wallMonitor);box(4.85,.06,.08,metal,0,1.18,.18,wallMonitor);box(.08,2.1,.08,amber,-2.45,2.3,.16,wallMonitor);
    // Long workstation below monitor: cabinets, keyboards and angled screens.
    box(6.3,.85,1.25,white,5.5,.5,-6.15); box(6.4,.13,1.4,metal,5.5,.98,-6.15);
    for(let i=0;i<4;i++){let x=3.2+i*1.45;box(1.25,.06,.55,black,x,1.08,-5.95);for(let k=0;k<4;k++)box(.8,.018,.025,cyan,x,1.12,-5.8-k*.09);box(1,.65,.12,dark,x,1.45,-6.45);box(.85,.5,.025,displayMaterial,x,1.45,-6.37);}
    // Freestanding diagnostic console.
    const consoleGroup=new THREE.Group();consoleGroup.position.set(3.8,0,1.7);scene.add(consoleGroup);
    box(3.6,1.15,2.15,white,0,.68,0,consoleGroup);box(3.35,.12,1.9,metal,0,1.3,0,consoleGroup);box(2.5,.9,.15,dark,0,1.78,-.52,consoleGroup);box(2.26,.68,.04,displayMaterial,0,1.8,-.42,consoleGroup);box(2.6,.1,.08,amber,0,.55,1.09,consoleGroup);
    for(let i=0;i<9;i++)for(let j=0;j<3;j++)box(.13,.025,.09,cyan,-.8+i*.19,1.38,.45+j*.13,consoleGroup);
    // Service cabinets, stools, and cable runs give the workspace scale.
    for(let x=3;x<8.5;x+=1.7){box(1.45,.75,1.12,white,x,.48,-6.03);box(1.18,.5,.04,trim,x,.48,-5.44);box(.48,.035,.03,dark,x,.58,-5.41);}
    for(let x=3.8;x<8;x+=2.3){cylinder(.34,.12,dark,x,.7,-4.55);cylinder(.06,.65,metal,x,.35,-4.55);cylinder(.38,.09,dark,x,.1,-4.55);}
    box(.15,2.7,.15,metal,9.4,1.5,-7.55);box(.15,2.7,.15,metal,9.1,1.5,-7.55);
    // Floor grates and safety lines.
    for(let z=2;z<7;z+=1.25){box(4,.035,.92,dark,-3,.13,z);for(let x=-4.8;x<-1.1;x+=.18)box(.045,.015,.8,metal,x,.16,z);}
    for(let z=-6;z<7;z+=.8){box(.14,.025,.45,orange,-8.3,.15,z);}
    for(let x=-7;x<8;x+=.8){box(.45,.025,.14,orange,x,.15,6.9);}
    // Storage, lights and potted plants.
    for(const [x,z] of [[7,5.5],[8.1,5.5],[7,4.2]]){box(1.05,1,1.05,dark,x,.6,z);box(.9,.05,.9,trim,x,1.12,z);box(.07,.8,.07,orange,x-.43,.6,z+.53);}
    for(const [x,z] of [[-8.7,4.7],[-2.4,-6.5],[8.5,-4.3]]){cylinder(.45,.7,white,x,.46,z);cylinder(.4,.06,soil,x,.84,z); for(let j=0;j<7;j++){const leafMesh=new THREE.Mesh(new THREE.SphereGeometry(.22,7,5),leaf); const a=j*Math.PI*2/7;leafMesh.scale.set(.45,1.8,.65);leafMesh.position.set(x+Math.cos(a)*.22,1.2+(j%2)*.2,z+Math.sin(a)*.22);leafMesh.rotation.z=Math.cos(a)*.5;leafMesh.rotation.x=Math.sin(a)*.5;scene.add(leafMesh);}}
    for (let x=-8;x<=8;x+=4){box(2,.08,.12,amber,x,3.58,-7.65);}
    const interactables: THREE.Object3D[] = [];
    for (const [group,id] of [[sensorGroup,"sensors"],[wallMonitor,"monitor"],[consoleGroup,"console"],[doorGroup,"door"]] as const) {group.traverse(o=>{o.userData.point=id});interactables.push(group);}
    const beacons: THREE.Mesh[] = [];
    for (const point of points) {const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.22),point.id==="sensors"||point.id==="console"?amber:cyan);marker.position.set(point.x,point.id==="sensors"?3.6:point.id==="monitor"?3.65:2.55,point.z);marker.userData.point=point.id;scene.add(marker);interactables.push(marker);beacons.push(marker);}
    // Secondary utility cabinet and small equipment cases.
    box(1.2,1.8,.85,white,-2.1,.98,-7.1);box(1,.9,.06,dark,-2.1,1.45,-6.64);box(.7,.6,.03,displayMaterial,-2.1,1.46,-6.59);box(.9,.07,.08,amber,-2.1,.58,-6.59);
    for(let i=0;i<3;i++){box(.55,.32,.6,dark,-.5+i*.65,.25,-6.9);box(.4,.03,.38,metal,-.5+i*.65,.43,-6.9);}
    // Player character built from 3D meshes.
    const player=new THREE.Group(); player.position.set(0,0,4.2); scene.add(player);
    const suit=mat(0xdddcd0), suitDark=mat(0x26323b), suitOrange=mat(0xb9763f), visor=mat(0x273d49,{metalness:.65,roughness:.22});
    box(.64,.8,.38,suit,0,1.07,0,player);box(.55,.15,.43,suitDark,0,.72,0,player);box(.42,.55,.23,suitDark,0,1.08,.3,player);box(.2,.35,.05,cyan,0,1.14,.43,player);
    const leftLeg=new THREE.Group(), rightLeg=new THREE.Group();leftLeg.position.set(-.18,.7,0);rightLeg.position.set(.18,.7,0);player.add(leftLeg,rightLeg);
    for(const leg of [leftLeg,rightLeg]){box(.22,.48,.25,suit,0,-.23,0,leg);box(.24,.16,.26,suitDark,0,-.48,0,leg);box(.25,.24,.27,suit,0,-.64,0,leg);box(.27,.14,.38,suitDark,0,-.76,-.05,leg);}
    const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.4,1.4,0);rightArm.position.set(.4,1.4,0);player.add(leftArm,rightArm);
    for(const arm of [leftArm,rightArm]){box(.22,.24,.3,suitOrange,0,-.07,0,arm);box(.2,.4,.22,suit,0,-.34,0,arm);box(.21,.18,.24,suitDark,0,-.62,0,arm);}
    const head=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),suit);head.scale.set(1,1.15,.9);head.position.set(0,1.8,0);player.add(head);box(.42,.21,.06,visor,0,1.82,-.25,player);box(.1,.26,.32,suitOrange,.33,1.18,0,player);
    // Star field.
    const positions=[]; for(let i=0;i<450;i++){ positions.push((Math.random()-.5)*85, Math.random()*35-5, (Math.random()-.5)*85); }
    const starGeo=new THREE.BufferGeometry(); starGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xc6e7f1,size:.07})));
    let target: THREE.Vector3 | null = null;
    let route: THREE.Vector3[] = [];
    // Expanded obstacles leave clearance for the character and allow sliding along edges.
    const obstacles = [
      {x1:-8.6,x2:-3,z1:-7.35,z2:-5.05},
      {x1:1.8,x2:9.35,z1:-7.35,z2:-5.1},
      {x1:1.55,x2:6.05,z1:.05,z2:3.35},
      {x1:6.1,x2:9,z1:3.5,z2:6.4},
      {x1:-9.35,x2:-8,z1:3.8,z2:5.6},
    ];
    const valid=(x:number,z:number)=>x>=-9.3&&x<=9.3&&z>=-7.3&&z<=7.3&&!obstacles.some(o=>x>o.x1&&x<o.x2&&z>o.z1&&z<o.z2);
    const pathTo=(destination:THREE.Vector3) => {
      const step=.5, cols=39, rows=31, toCell=(x:number,z:number)=>[Math.round((x+9.5)/step),Math.round((z+7.5)/step)];
      const [sx,sz]=toCell(player.position.x,player.position.z), [gx,gz]=toCell(destination.x,destination.z);
      const queue:[[number,number]]=[[sx,sz]], previous=new Map<string,string|null>(), key=(x:number,z:number)=>`${x},${z}`; previous.set(key(sx,sz),null);
      let end:string|null=null;
      for(let head=0;head<queue.length;head++){const [x,z]=queue[head];if(x===gx&&z===gz){end=key(x,z);break;} for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(nx<0||nx>=cols||nz<0||nz>=rows||previous.has(k)||!valid(nx*step-9.5,nz*step-7.5))continue;previous.set(k,key(x,z));queue.push([nx,nz]);}}
      if(!end){target=null;route=[];setMessage("Точка недоступна. Выберите свободное место на полу.");return false;}
      const path:THREE.Vector3[]=[];while(end && previous.get(end)!==null){const [x,z]=end.split(",").map(Number);path.push(new THREE.Vector3(x*step-9.5,0,z*step-7.5));end=previous.get(end)??null;} route=path.reverse();target=route.shift()??null;targetRing.position.set(destination.x,.18,destination.z);targetRing.visible=!!target;return true;
    };
    const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2(); const plane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targetRing=new THREE.Mesh(new THREE.RingGeometry(.32,.4,32),new THREE.MeshBasicMaterial({color:0x7fe5e7,transparent:true,opacity:.8,side:THREE.DoubleSide}));targetRing.rotation.x=-Math.PI/2;targetRing.position.y=.18;targetRing.visible=false;scene.add(targetRing);
    let hovered: string | null = null;
    const onMove=(event:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(interactables,true).find(h=>h.object.userData.point);hovered=hit?.object.userData.point??null;renderer.domElement.style.cursor=hovered?"pointer":"crosshair";};
    const onLeave=()=>{hovered=null;renderer.domElement.style.cursor="crosshair";};
    renderer.domElement.addEventListener("pointermove",onMove);renderer.domElement.addEventListener("pointerleave",onLeave);
    const onPointer = (event: PointerEvent) => { const rect=renderer.domElement.getBoundingClientRect(); mouse.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1); ray.setFromCamera(mouse,camera); const hits=ray.intersectObjects(interactables,true); const hit=hits.find(h=>h.object.userData.point); if(hit){ const point=points.find(p=>p.id===hit.object.userData.point); if(point) { if(pathTo(new THREE.Vector3(point.id === "door" ? -7.3 : point.x,0,point.id === "door" ? 0 : point.z+1.8))) setMessage(`Идём к объекту «${point.label}».`); } return; } const at=new THREE.Vector3(); if(ray.ray.intersectPlane(plane,at)) pathTo(new THREE.Vector3(THREE.MathUtils.clamp(at.x,-9,9),0,THREE.MathUtils.clamp(at.z,-7,7))); };
    renderer.domElement.addEventListener('pointerdown',onPointer);
    const keydown=(e:KeyboardEvent)=>{ if(["w","a","s","d","ц","ф","ы","в","arrowup","arrowdown","arrowleft","arrowright","e","у"].includes(e.key.toLowerCase())) { e.preventDefault(); controls.current.add(e.key.toLowerCase()); if(e.key.toLowerCase()==="e" || e.key.toLowerCase()==="у") { if(!e.repeat && nearbyRef.current) interactRef.current(nearbyRef.current); } else { target=null; route=[]; } } };
    const keyup=(e:KeyboardEvent)=>controls.current.delete(e.key.toLowerCase()); const blur=()=>controls.current.clear(); window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h); const aspect=w/Math.max(h,1); const span=12; camera.left=-span*aspect; camera.right=span*aspect; camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();}; const observer=new ResizeObserver(resize); observer.observe(host); resize();
    const clock=new THREE.Clock(); let frame=0; let lastNear:string|null=null;
    const tick=()=>{frame=requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05); const keys=controls.current; let dx=(keys.has('d')||keys.has('в')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('ф')||keys.has('arrowleft')?1:0); let dz=(keys.has('s')||keys.has('ы')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('ц')||keys.has('arrowup')?1:0);
      if(dx || dz){target=null;route=[];targetRing.visible=false;}
      if(target && !dx && !dz){dx=target.x-player.position.x; dz=target.z-player.position.z;if(Math.hypot(dx,dz)<.15){target=route.shift()??null;if(!target)targetRing.visible=false;dx=0;dz=0;}}
      const len=Math.hypot(dx,dz); if(len>.01){const nx=player.position.x+dx/len*dt*3.4,nz=player.position.z+dz/len*dt*3.4; if(valid(nx,player.position.z)) player.position.x=nx;if(valid(player.position.x,nz)) player.position.z=nz;player.rotation.y=Math.atan2(-dx,-dz);const swing=Math.sin(clock.elapsedTime*10)*.42;leftLeg.rotation.x=swing;rightLeg.rotation.x=-swing;leftArm.rotation.x=-swing*.65;rightArm.rotation.x=swing*.65;} else { leftLeg.rotation.x*=.8;rightLeg.rotation.x*=.8;leftArm.rotation.x*=.8;rightArm.rotation.x*=.8;}
      const t=clock.elapsedTime; beacons.forEach((b,i)=>{if(!reduced.matches)b.rotation.y+=dt; b.position.y=(i<2?3.6:2.55)+(reduced.matches?0:Math.sin(t*2+i)*.08);const scale=hovered===points[i].id?1.5:1;b.scale.setScalar(THREE.MathUtils.lerp(b.scale.x,scale,Math.min(1,dt*8)));});
      doorA.position.z=THREE.MathUtils.lerp(doorA.position.z,doorOpenRef.current?-1.85:-.65,Math.min(1,dt*3)); doorB.position.z=THREE.MathUtils.lerp(doorB.position.z,doorOpenRef.current?1.85:.65,Math.min(1,dt*3));
      const near=points.filter(p=>Math.hypot(p.x-player.position.x,p.z-player.position.z)<2.5).sort((a,b)=>Math.hypot(a.x-player.position.x,a.z-player.position.z)-Math.hypot(b.x-player.position.x,b.z-player.position.z))[0] ?? null;
      if((near?.id??null)!==lastNear){lastNear=near?.id??null;nearbyRef.current=lastNear;setNearby(near);setInspected(null);}
      renderer.render(scene,camera);
    };tick();
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);renderer.domElement.removeEventListener('pointerdown',onPointer);renderer.domElement.removeEventListener('pointermove',onMove);renderer.domElement.removeEventListener('pointerleave',onLeave);controls.current.clear(); scene.traverse(o=>{if(o instanceof THREE.Mesh || o instanceof THREE.Points){o.geometry.dispose(); const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>{if(m instanceof THREE.MeshBasicMaterial && m.map) m.map.dispose();m.dispose();});}});renderer.dispose();renderer.domElement.remove();};
  }, []);
  const hold=(key:string, down:boolean)=>{if(down) controls.current.add(key);else controls.current.delete(key);};
  const descriptions: Record<string, string> = {
    sensors: restored ? "Алгоритм контроля внедрён. Система учитывает несогласованные показания датчиков." : "Три независимых датчика контролируют атмосферу. Канал C резко расходится с показаниями A и B.",
    monitor: restored ? "Диагностика завершена. Ниже показаны исходные данные события, сохранённые в журнале." : "Показания каналов: A — 20,8 %, B — 20,7 %, C — 4,1 %. Автоматика рассчитала среднее 15,2 %.",
    console: "Терминал связывает показания датчиков с системой тревоги. Здесь можно перейти к диагностике и настройке алгоритма.",
    door: doorOpen ? "Шлюз открыт. Соседний отсек пока недоступен для исследования." : "Герметичный шлюз отделяет сенсорный отсек от остальной станции.",
  };
  return <div className="station-3d-wrap"><div className="station-3d" ref={mount} aria-label="Трёхмерная модель сенсорного отсека" />
    {error && <div className="station-3d-error">Не удалось запустить 3D. Проверьте поддержку WebGL в браузере.</div>}
    <div className="station-3d-location"><span>АКСИОМА / СЕКТОР S-02</span><strong>Сенсорный отсек</strong><small>КОНТРОЛЬ АТМОСФЕРЫ</small></div>
    <div className="station-3d-note">{inspected ? <><div className="station-note-heading"><strong>{points.find(p=>p.id===inspected)?.label}</strong><button className="station-close" onClick={()=>setInspected(null)} aria-label="Закрыть">×</button></div><span>{descriptions[inspected]}</span>{inspected === "monitor" && <div className="sensor-readings"><div><small>КАНАЛ A</small><b>20,8 <em>%</em></b></div><div><small>КАНАЛ B</small><b>20,7 <em>%</em></b></div><div className="warning"><small>КАНАЛ C</small><b>4,1 <em>%</em></b></div></div>}{(inspected === "sensors" || inspected === "console" || inspected === "monitor") && <button onClick={()=>actionRef.current("sensor")}>Открыть диагностику <b>→</b></button>}{inspected === "door" && <button onClick={()=>setDoorOpen(!doorOpen)}>{doorOpen ? "Закрыть шлюз" : "Открыть шлюз"}</button>}</> : nearby ? <><strong>{nearby.label}</strong><span>{nearby.hint}</span><button onClick={()=>interactRef.current(nearby.id)}><kbd>E</kbd> Осмотреть</button></> : <><strong>Исследуйте отсек</strong><span>{message}</span></>}</div>
    <div className="station-3d-help"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> движение</span><span><kbd>E</kbd> осмотреть</span><span>Клик по полу или объекту</span></div>
    <div className="station-3d-pad" aria-label="Управление движением">{[['w','↑'],['a','←'],['s','↓'],['d','→']].map(([key,label])=><button key={key} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);hold(key,true)}} onPointerUp={()=>hold(key,false)} onPointerCancel={()=>hold(key,false)}>{label}</button>)}</div>
  </div>;
}
