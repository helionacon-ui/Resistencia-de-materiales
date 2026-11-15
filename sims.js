/* Figuras interactivas de Resistencia de Materiales. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- Resistencia de Materiales: figuras interactivas ---- */
const NQ=x=>{const r=Math.round(x*1000)/1000;return (Math.abs(r-Math.round(r))<1e-9?String(Math.round(r)):r.toFixed(3).replace(/0+$/,'')).replace('.',',');};
const N1=x=>(Math.abs(x)<5e-2?0:x).toFixed(1).replace('.',',');
const N2=x=>(Math.abs(x)<5e-3?0:x).toFixed(2).replace('.',',');
const ticks=(max,n)=>{const raw=max/n,p=Math.pow(10,Math.floor(Math.log10(raw))),c=[1,2,2.5,5,10].find(k=>k*p>=raw)*p;const o=[];for(let v=c;v<=max*1.0001;v+=c)o.push(v);return o;};
const Tierra=(a,x,y,col)=>{const c=col||C.muted;a.line(x-14,y,x+14,y,c,2);for(let i=-3;i<=3;i++)a.line(x+i*4,y,x+i*4-5,y+8,c,1.2);};
const Rbox=(a,x,y,w,h,col,fill)=>{if(fill){a.g.fillStyle=col;a.g.globalAlpha=0.14;a.g.fillRect(x,y,w,h);a.g.globalAlpha=1;}
  a.g.strokeStyle=col;a.g.lineWidth=2;a.g.strokeRect(x,y,w,h);};

/* T1 · Círculo de Mohr */
SIMS.mohr=el=>build(el,{w:660,h:430,
 sliders:[{k:'sx',v:-4,min:-20,max:20,step:0.1,l:'σx',u:'kPa'},{k:'sy',v:2.5,min:-20,max:20,step:0.1,l:'σy',u:'kPa'},
  {k:'txy',v:2.8,min:-15,max:15,step:0.1,l:'τxy',u:'kPa'},{k:'th',v:44.6,min:0,max:180,step:0.5,l:'giro de ejes θ',u:'°'}],
 draw(a){a.clear();
  const sx=a.st.sx, sy=a.st.sy, txy=a.st.txy, th=a.st.th*Math.PI/180;
  const c=(sx+sy)/2, R=Math.hypot((sx-sy)/2,txy);
  const s1=c+R, s2=c-R;
  const thp=0.5*Math.atan2(2*txy,sx-sy);
  const sxp=c+(sx-sy)/2*Math.cos(2*th)+txy*Math.sin(2*th);
  const syp=c-(sx-sy)/2*Math.cos(2*th)-txy*Math.sin(2*th);
  const txp=-(sx-sy)/2*Math.sin(2*th)+txy*Math.cos(2*th);
  // circulo
  const cx=190,cy=180, M=Math.max(R,Math.abs(c)+R)*1.25||1, S=110/M;
  a.line(cx-150,cy,cx+150,cy,C.muted,1.4);
  a.line(cx+c*S,cy-130,cx+c*S,cy+130,C.muted,1,[4,3]);
  a.txt('σ',cx+152,cy+16,C.muted,11);a.txt('τ',cx+c*S+6,cy-134,C.muted,11);
  a.circ(cx+c*S,cy,R*S,C.a,false);
  a.circ(cx+s1*S,cy,5,C.c,true);a.txt('σ₁',cx+s1*S+4,cy+20,C.c,12);
  a.circ(cx+s2*S,cy,5,C.c,true);a.txt('σ₂',cx+s2*S-6,cy+20,C.c,12,'right');
  // punto (sx,-txy) y (sxp,-txp)
  a.circ(cx+sx*S,cy-txy*S,6,C.muted,true);a.txt('(σx, τxy)',cx+sx*S,cy-txy*S-14,C.muted,11,'center');
  a.line(cx+sx*S,cy-txy*S,cx+sy*S,cy+txy*S,C.muted,1.2,[3,3]);
  a.circ(cx+sxp*S,cy-txp*S,7,C.f,true);
  a.txt('(σx′, τx′y′)',cx+sxp*S+8,cy-txp*S+16,C.f,12);
  a.line(cx+c*S,cy,cx+sxp*S,cy-txp*S,C.f,1.6);
  a.txt('2θ = '+N1(a.st.th*2)+'°',cx+c*S+10,cy-10,C.f,11);
  a.txt('R = τmax = '+N2(R)+' kPa',cx,cy+150,C.a,12,'center');
  // elemento girado
  const ex=520,ey=160,L=50;
  const ca=Math.cos(th),sa=Math.sin(th);
  const pts=[[-L,-L],[L,-L],[L,L],[-L,L]].map(p=>[ex+p[0]*ca-p[1]*sa, ey+(p[0]*sa+p[1]*ca)]);
  a.g.strokeStyle=C.e;a.g.lineWidth=2.4;a.g.beginPath();
  pts.forEach((p,i)=>i?a.g.lineTo(p[0],p[1]):a.g.moveTo(p[0],p[1]));a.g.closePath();a.g.stroke();
  a.g.fillStyle=C.e;a.g.globalAlpha=.1;a.g.fill();a.g.globalAlpha=1;
  const nx=[ca,sa], ny=[-sa,ca];
  const flecha=(dir,val,col,lab)=>{const d=val>=0?1:-1, len=22+Math.min(26,Math.abs(val)*2.2);
    const bx0=ex+dir[0]*L, by0=ey+dir[1]*L;
    if(d>0)a.arrow(bx0,by0,bx0+dir[0]*len,by0+dir[1]*len,col,2.4);
    else a.arrow(bx0+dir[0]*len,by0+dir[1]*len,bx0,by0,col,2.4);
    a.txt(lab+' = '+N2(val),bx0+dir[0]*(len+10),by0+dir[1]*(len+10)+4,col,11,
      dir[0]>0.25?'left':(dir[0]<-0.25?'right':'center'));};
  flecha(nx,sxp,C.a,'σx′');
  flecha([-nx[0],-nx[1]],sxp,C.a,'');
  flecha(ny,syp,C.c,'σy′');
  flecha([-ny[0],-ny[1]],syp,C.c,'');
  a.txt('elemento girado θ = '+N1(a.st.th)+'°',ex,ey+118,C.muted,12,'center');
  const bx=420,by=312;
  [['σx′',N2(sxp)+' kPa'],['σy′',N2(syp)+' kPa'],['τx′y′',N2(txp)+' kPa'],['σ₁',N2(s1)+' kPa'],['σ₂',N2(s2)+' kPa'],['θp',N1(thp*180/Math.PI)+'°']].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*22,C.muted,12);a.txt(d[1],bx+190,by+i*22,C.text,12,'right');});
  a.html(`Estado plano σx = ${N1(sx)}, σy = ${N1(sy)}, τxy = ${N1(txy)} kPa ⇒ centro ${N2(c)} y radio <b>R = ${N2(R)} kPa</b> (que ES la τ máxima del plano).<br>
  Principales: <b>σ₁ = ${N2(s1)}</b> y <b>σ₂ = ${N2(s2)} kPa</b>, con θp = ${N1(thp*180/Math.PI)}°. Girando θ = ${N1(a.st.th)}°: σx′ = <b>${N2(sxp)}</b>, σy′ = ${N2(syp)}, τx′y′ = <b>${N2(txp)} kPa</b>.<br>
  Comprobación del invariante: σx′ + σy′ = ${N2(sxp+syp)} = σx + σy = ${N2(sx+sy)} ✓<br>
  <span class="hint">Pon σx = −4, σy = 2,5, τxy = 2,8 y gira hasta θ = 44,6°: saldrá σx′ = 2 kPa, que es justo el enunciado del parcial de junio de 2023.</span>`);}});

/* T2 · Criterios de plastificación */
SIMS.criterios=el=>build(el,{w:660,h:470,
 selects:[{k:'m',v:'vm',l:'criterio destacado',opts:[['vm','von Mises'],['tr','Tresca'],['ra','Rankine-Lamé']]}],
 sliders:[{k:'s1',v:220,min:-400,max:400,step:5,l:'σ₁',u:'MPa'},{k:'s2',v:-41,min:-400,max:400,step:5,l:'σ₂',u:'MPa'},
  {k:'se',v:275,min:100,max:500,step:5,l:'límite elástico σe',u:'MPa'},{k:'g',v:1.05,min:1,max:1.5,step:0.05,l:'γM0',u:''}],
 draw(a){a.clear();
  const s1=a.st.s1, s2=a.st.s2, se=a.st.se, fyd=se/a.st.g;
  const vm=Math.sqrt(s1*s1-s1*s2+s2*s2);
  const tr=Math.max(Math.abs(s1-s2),Math.abs(s1),Math.abs(s2));
  const ra=Math.max(Math.abs(s1),Math.abs(s2));
  const cx=200,cy=210,S=150/(se*1.35);
  a.line(cx-160,cy,cx+160,cy,C.muted,1.4);a.line(cx,cy-160,cx,cy+160,C.muted,1.4);
  a.txt('σ₁',cx+162,cy+16,C.muted,11);a.txt('σ₂',cx+6,cy-162,C.muted,11);
  [se,-se].forEach(v=>{a.line(cx+v*S,cy-4,cx+v*S,cy+4,C.muted,1);a.txt(NQ(v),cx+v*S,cy+20,C.muted,10,'center');
    a.line(cx-4,cy-v*S,cx+4,cy-v*S,C.muted,1);a.txt(NQ(v),cx-8,cy-v*S+4,C.muted,10,'right');});
  // Rankine: cuadrado
  a.g.strokeStyle=a.st.m==='ra'?C.e:C.grid;a.g.lineWidth=a.st.m==='ra'?2.6:1.4;
  a.g.strokeRect(cx-se*S,cy-se*S,2*se*S,2*se*S);
  // Tresca: hexagono
  const hex=[[1,0],[1,1],[0,1],[-1,0],[-1,-1],[0,-1]].map(p=>[cx+p[0]*se*S,cy-p[1]*se*S]);
  a.g.strokeStyle=a.st.m==='tr'?C.b:C.grid;a.g.lineWidth=a.st.m==='tr'?2.6:1.4;
  a.g.beginPath();hex.forEach((p,i)=>i?a.g.lineTo(p[0],p[1]):a.g.moveTo(p[0],p[1]));a.g.closePath();a.g.stroke();
  // von Mises: elipse
  a.g.strokeStyle=a.st.m==='vm'?C.a:C.grid;a.g.lineWidth=a.st.m==='vm'?2.8:1.4;a.g.beginPath();
  for(let t=0;t<=360;t++){const q=t*Math.PI/180;
    const x=se*Math.cos(q-Math.PI/4)*Math.SQRT2/Math.sqrt(2)*1, y=se*Math.sin(q-Math.PI/4)*Math.SQRT2/Math.sqrt(2)*1;
    // elipse en ejes girados 45: semiejes sqrt(2)se y sqrt(2/3)se
    const u=Math.SQRT2*se*Math.cos(q), v=Math.sqrt(2/3)*se*Math.sin(q);
    const X=(u-v)/Math.SQRT2, Y=(u+v)/Math.SQRT2;
    t===0?a.g.moveTo(cx+X*S,cy-Y*S):a.g.lineTo(cx+X*S,cy-Y*S);}
  a.g.closePath();a.g.stroke();
  a.circ(cx+s1*S,cy-s2*S,7,C.f,true);
  a.txt('estado',cx+s1*S+10,cy-s2*S-12,C.f,12);
  const ly=cy+182;
  a.line(cx-160,ly,cx-136,ly,a.st.m==='vm'?C.a:C.grid,a.st.m==='vm'?2.6:1.6);a.txt('von Mises (elipse)',cx-130,ly+4,a.st.m==='vm'?C.a:C.muted,11);
  a.line(cx-160,ly+18,cx-136,ly+18,a.st.m==='tr'?C.b:C.grid,a.st.m==='tr'?2.6:1.6);a.txt('Tresca (hexágono inscrito)',cx-130,ly+22,a.st.m==='tr'?C.b:C.muted,11);
  a.line(cx-160,ly+36,cx-136,ly+36,a.st.m==='ra'?C.e:C.grid,a.st.m==='ra'?2.6:1.6);a.txt('Rankine (cuadrado)',cx-130,ly+40,a.st.m==='ra'?C.e:C.muted,11);
  const bx=400,by=80;
  a.txt('Tensiones equivalentes',bx,by-24,C.text,13);
  [['von Mises',vm,C.a],['Tresca',tr,C.b],['Rankine',ra,C.e]].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*26,C.muted,12);
    a.txt(N1(d[1])+' MPa',bx+150,by+i*26,d[2],12,'right');
    a.txt(d[1]<=fyd?'✓':'✗',bx+205,by+i*26,d[1]<=fyd?C.c:C.b,14);});
  a.txt('σe = '+NQ(se)+' MPa',bx,by+110,C.muted,12);
  a.txt('fyd = σe/γM0 = '+N1(fyd)+' MPa',bx,by+132,C.text,12);
  a.txt('aprovechamiento',bx,by+162,C.muted,12);
  a.txt(N1(vm/fyd*100)+' %',bx+205,by+162,vm<=fyd?C.c:C.b,14,'right');
  a.html(`Con σ₁ = ${NQ(s1)} y σ₂ = ${NQ(s2)} MPa (σ₃ = 0): <b>von Mises ${N1(vm)}</b>, <b>Tresca ${N1(tr)}</b> y <b>Rankine ${N1(ra)}</b> MPa, frente a f<sub>yd</sub> = ${N1(fyd)} MPa.<br>
  El hexágono de Tresca está <b>inscrito</b> en la elipse de von Mises: por eso Tresca siempre da una equivalente mayor o igual y es más conservador. Rankine (cuadrado) sólo mira la mayor principal y es el de los materiales frágiles.<br>
  <span class="hint">Lleva el punto a la diagonal σ₁ = σ₂ (estado hidrostático en el plano): von Mises apenas crece, mientras que Rankine se dispara. Es la diferencia entre plastificar por distorsión o romper por tracción.</span>`);}});

/* T3 · Propiedades estáticas de la sección */
SIMS.seccion=el=>build(el,{w:660,h:430,
 selects:[{k:'f',v:'T',l:'sección',opts:[['T','sección en T'],['I','doble T'],['L','angular L'],['R','rectángulo hueco']]}],
 sliders:[{k:'b',v:200,min:60,max:300,step:10,l:'ancho del ala',u:'mm'},{k:'tf',v:20,min:6,max:50,step:2,l:'espesor del ala',u:'mm'},
  {k:'h',v:180,min:60,max:360,step:10,l:'altura del alma',u:'mm'},{k:'tw',v:20,min:4,max:50,step:2,l:'espesor del alma',u:'mm'}],
 draw(a){a.clear();
  const b=a.st.b, tf=a.st.tf, h=a.st.h, tw=a.st.tw;
  // trozos: [x0,y0,w,h] con y hacia arriba desde la base
  let piezas=[];
  if(a.st.f==='T') piezas=[[-tw/2,0,tw,h],[-b/2,h,b,tf]];
  else if(a.st.f==='I') piezas=[[-b/2,0,b,tf],[-tw/2,tf,tw,h],[-b/2,tf+h,b,tf]];
  else if(a.st.f==='L') piezas=[[0,0,b,tf],[0,tf,tw,h]];
  else piezas=[[-b/2,0,b,h+2*tf],[-b/2+tw,tf,b-2*tw,h,-1]];
  let A=0,Sy=0,Sz=0;
  piezas.forEach(p=>{const s=p[4]===-1?-1:1, ar=s*p[2]*p[3];
    A+=ar; Sz+=ar*(p[1]+p[3]/2); Sy+=ar*(p[0]+p[2]/2);});
  const yG=Sz/A, zG=Sy/A;
  let Iz=0,Iy=0,Iyz=0;
  piezas.forEach(p=>{const s=p[4]===-1?-1:1, ar=s*p[2]*p[3];
    const yc=p[1]+p[3]/2, zc=p[0]+p[2]/2;
    Iz+=s*p[2]*Math.pow(p[3],3)/12+ar*Math.pow(yc-yG,2);
    Iy+=s*p[3]*Math.pow(p[2],3)/12+ar*Math.pow(zc-zG,2);
    Iyz+=ar*(yc-yG)*(zc-zG);});
  const Htot=Math.max(...piezas.map(p=>p[1]+p[3])), Btot=Math.max(...piezas.map(p=>p[0]+p[2]))-Math.min(...piezas.map(p=>p[0]));
  const S=Math.min(1.0, 220/Htot, 230/Btot);
  const ox=230, oy=330;
  piezas.forEach(p=>{const hueco=p[4]===-1;
    const X=ox+p[0]*S, Y=oy-(p[1]+p[3])*S, W=p[2]*S, H=p[3]*S;
    if(hueco){a.g.fillStyle=C.bg;a.g.fillRect(X,Y,W,H);a.g.strokeStyle=C.muted;a.g.lineWidth=1.4;a.g.setLineDash([4,3]);a.g.strokeRect(X,Y,W,H);a.g.setLineDash([]);}
    else {a.g.fillStyle=C.a;a.g.globalAlpha=.16;a.g.fillRect(X,Y,W,H);a.g.globalAlpha=1;a.g.strokeStyle=C.a;a.g.lineWidth=2;a.g.strokeRect(X,Y,W,H);}});
  // ejes por el CDG
  const Yg=oy-yG*S, Xg=ox+zG*S;
  a.line(ox-150,Yg,ox+170,Yg,C.f,1.8,[6,4]);
  a.line(Xg,oy-Htot*S-24,Xg,oy+26,C.f,1.8,[6,4]);
  a.circ(Xg,Yg,5,C.f,true);
  a.txt('G',Xg+8,Yg-8,C.f,13);
  a.txt('eje z (neutro en flexión)',ox-150,Yg-8,C.f,11);
  a.txt('y',Xg+6,oy-Htot*S-28,C.f,11);
  a.line(ox-150,oy,ox+170,oy,C.muted,1.2);
  a.arrow(ox-130,oy,ox-130,Yg,C.c,2);
  a.txt('y_G = '+N1(yG)+' mm',ox-126,(oy+Yg)/2,C.c,11);
  const bx=400,by=70;
  a.txt('Propiedades de la sección',bx,by-24,C.text,13);
  [['Área A',N1(A)+' mm²'],['y_G (desde la base)',N1(yG)+' mm'],['I_z',N1(Iz/1e4)+' cm⁴'],['I_y',N1(Iy/1e4)+' cm⁴'],
   ['I_yz',N1(Iyz/1e4)+' cm⁴'],['W_inferior',N1(Iz/yG/1e3)+' cm³'],['W_superior',N1(Iz/(Htot-yG)/1e3)+' cm³'],['radio de giro i_z',N1(Math.sqrt(Iz/A))+' mm']].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*24,C.muted,12);a.txt(d[1],bx+215,by+i*24,C.text,12,'right');});
  a.txt(Math.abs(Iyz)<1?'I_yz = 0 ⇒ ejes principales ✓':'I_yz ≠ 0 ⇒ NO son principales',bx,by+206,Math.abs(Iyz)<1?C.c:C.b,12);
  a.html(`Sección <b>${{T:'en T',I:'doble T',L:'angular',R:'rectangular hueca'}[a.st.f]}</b>: A = <b>${N1(A)} mm²</b>, centro de gravedad a <b>${N1(yG)} mm</b> de la base.<br>
  Por Steiner, I<sub>z</sub> = <b>${N1(Iz/1e4)} cm⁴</b> e I<sub>y</sub> = ${N1(Iy/1e4)} cm⁴. Módulos resistentes: ${N1(Iz/yG/1e3)} cm³ (fibra inferior) y ${N1(Iz/(Htot-yG)/1e3)} cm³ (superior) — en el dimensionado manda el <b>menor</b>.<br>
  ${Math.abs(Iyz)<1?'La sección tiene un eje de simetría vertical, así que I<sub>yz</sub> = 0 y los ejes dibujados ya son principales.':'Al no haber simetría, I<sub>yz</sub> = '+N1(Iyz/1e4)+' cm⁴ ≠ 0: estos ejes NO son principales y habría que girarlos.'}<br>
  <span class="hint">Prueba la T con ala 200×20 y alma 20×180: saldrán 7 600 mm², y_G = 142,6 mm e I_z = 2 880 cm⁴, que es el problema resuelto del tema 3.</span>`);}});

/* T4 · Leyes y diagramas de esfuerzos */
SIMS.esfuerzos=el=>build(el,{w:660,h:450,
 selects:[{k:'t',v:'volad',l:'viga',opts:[['volad','biapoyada con voladizo'],['bi','biapoyada con carga uniforme'],['mens','ménsula'],['punt','biapoyada con carga puntual']]}],
 sliders:[{k:'L',v:6,min:2,max:12,step:0.5,l:'longitud total',u:'m'},{k:'xb',v:4,min:1,max:11,step:0.5,l:'posición del 2.º apoyo',u:'m'},
  {k:'q',v:10,min:0,max:40,step:1,l:'carga repartida',u:'kN/m'},{k:'P',v:20,min:0,max:80,step:2,l:'carga puntual en el extremo',u:'kN'}],
 draw(a){a.clear();
  const L=a.st.L; let xb=Math.min(a.st.xb,L), q=a.st.q, P=a.st.P;
  let tipo=a.st.t;
  if(tipo==='bi'){xb=L;P=0;}
  if(tipo==='punt'){q=0;xb=L;}
  if(tipo==='mens'){xb=0;}
  const N=600;
  const V=new Array(N+1), M=new Array(N+1);
  let RA=0,RB=0,MA=0;
  if(tipo==='mens'){RA=q*L+P; MA=-(q*L*L/2+P*L);}
  else if(tipo==='punt'){RA=P/2;RB=P/2;}
  else {const Wq=q*xb;
    RB=(Wq*xb/2+P*L)/xb; RA=Wq+P-RB;}
  for(let i=0;i<=N;i++){const x=L*i/N;
    let v=0,m=0;
    if(tipo==='mens'){v=RA-q*Math.min(x,L); m=MA+RA*x-q*x*x/2;}
    else if(tipo==='punt'){v=RA-(x>L/2?P:0); m=RA*x-(x>L/2?P*(x-L/2):0);}
    else {v=RA-q*Math.min(x,xb)+(x>xb?RB:0);
      m=RA*x-q*Math.min(x,xb)*(x-Math.min(x,xb)/2)+(x>xb?RB*(x-xb):0);}
    V[i]=v;M[i]=m;}
  const x0=60,wv=540;
  const px=x=>x0+x/L*wv;
  // viga
  const yv=90;
  a.line(x0,yv,x0+wv,yv,C.text,7);
  if(tipo==='mens'){a.g.fillStyle=C.e;a.g.fillRect(x0-14,yv-34,14,68);Tierra(a,x0-7,yv+36);}
  else {[0,xb].forEach((x,i)=>{if(tipo==='punt'&&i===1&&xb!==L)return;
    const X=px(x);a.g.fillStyle=C.e;a.g.beginPath();a.g.moveTo(X,yv+5);a.g.lineTo(X-12,yv+26);a.g.lineTo(X+12,yv+26);a.g.closePath();a.g.fill();Tierra(a,X,yv+28);});}
  if(q>0){const xe=tipo==='mens'?L:xb;
    for(let x=0;x<=xe+1e-9;x+=xe/12)a.arrow(px(x),yv-34,px(x),yv-8,C.c,1.6);
    a.line(px(0),yv-34,px(xe),yv-34,C.c,2);
    a.txt('q = '+NQ(q)+' kN/m',px(xe/2),yv-42,C.c,12,'center');}
  if(P>0&&tipo!=='bi'){const xp=tipo==='punt'?L/2:L;
    a.arrow(px(xp),yv-56,px(xp),yv-8,C.b,2.8);a.txt('P = '+NQ(P)+' kN',px(xp),yv-62,C.b,12,'center');}
  a.txt('A',px(0),yv+48,C.muted,12,'center');
  if(tipo!=='mens'&&xb<L)a.txt('B',px(xb),yv+48,C.muted,12,'center');
  a.txt(tipo==='mens'?'empotrado':'',x0-30,yv-44,C.muted,11);
  // diagramas
  const dib=(arr,y0,hv,col,lab,unit)=>{
    const mx=Math.max(...arr.map(Math.abs))||1;
    a.line(x0,y0,x0+wv,y0,C.muted,1.3);
    a.txt(lab,x0-6,y0+4,col,12,'right');
    a.g.fillStyle=col;a.g.globalAlpha=0.16;a.g.beginPath();a.g.moveTo(x0,y0);
    arr.forEach((v,i)=>a.g.lineTo(px(L*i/N),y0-v/mx*hv));
    a.g.lineTo(x0+wv,y0);a.g.closePath();a.g.fill();a.g.globalAlpha=1;
    a.g.strokeStyle=col;a.g.lineWidth=2.4;a.g.beginPath();
    arr.forEach((v,i)=>{const X=px(L*i/N),Y=y0-v/mx*hv;i?a.g.lineTo(X,Y):a.g.moveTo(X,Y);});
    a.g.stroke();
    // acotaciones
    const vmax=Math.max(...arr), vmin=Math.min(...arr);
    const imax=arr.indexOf(vmax), imin=arr.indexOf(vmin);
    if(Math.abs(vmax)>1e-6){a.txt(N1(vmax)+unit,px(L*imax/N),y0-vmax/mx*hv-6,col,11,'center');}
    if(Math.abs(vmin)>1e-6){a.txt(N1(vmin)+unit,px(L*imin/N),y0-vmin/mx*hv+16,col,11,'center');}};
  dib(V,230,55,C.a,'V','');
  dib(M,370,58,C.e,'M','');
  a.txt('cortante (kN)',x0+wv,230+74,C.a,11,'right');
  a.txt('flector (kN·m)',x0+wv,370+78,C.e,11,'right');
  // punto donde V=0
  for(let i=1;i<=N;i++){if(V[i-1]*V[i]<=0 && V[i-1]!==V[i] && Math.abs(V[i-1])>1e-9!==false){const X=px(L*i/N);
    a.line(X,230-55,X,370+58,C.f,1.2,[4,3]);
    a.txt('V = 0 ⇒ M extremo',X+6,330,C.f,11);break;}}
  const Mmax=Math.max(...M.map(Math.abs)), Vmax=Math.max(...V.map(Math.abs));
  a.html(`${{volad:'Biapoyada con voladizo',bi:'Biapoyada con carga uniforme',mens:'Ménsula',punt:'Biapoyada con carga puntual centrada'}[tipo]}: reacciones <b>R_A = ${N1(RA)} kN</b>${tipo==='mens'?' y empotramiento M_A = '+N1(MA)+' kN·m':(xb<L||tipo!=='mens'?', <b>R_B = '+N1(RB)+' kN</b>':'')}.<br>
  Máximos: |V| = <b>${N1(Vmax)} kN</b> y |M| = <b>${N1(Mmax)} kN·m</b>. El flector es extremo justo donde el cortante <b>cambia de signo</b>, como exige dM/dx = V.<br>
  <span class="hint">Prueba L = 6 m, 2.º apoyo en 4 m, q = 10 kN/m y P = 20 kN: saldrán R_A = 10 kN, R_B = 50 kN, M(1) = +5 kN·m y M(4) = −40 kN·m, el problema resuelto del tema 4.</span>`);}});

/* T5 · Esfuerzo axil */
SIMS.axil=el=>build(el,{w:660,h:420,
 selects:[{k:'t',v:'hiper',l:'caso',opts:[['iso','barra escalonada (isostática)'],['hiper','barra biempotrada con carga intermedia'],['term','dilatación impedida']]}],
 sliders:[{k:'P',v:100,min:0,max:400,step:5,l:'carga P',u:'kN'},{k:'a',v:0.5,min:0.1,max:2,step:0.1,l:'tramo a',u:'m'},
  {k:'b',v:0.5,min:0.1,max:2,step:0.1,l:'tramo b',u:'m'},{k:'c',v:0.5,min:0.1,max:2,step:0.1,l:'tramo c',u:'m'},
  {k:'A',v:1000,min:100,max:5000,step:50,l:'área',u:'mm²'},{k:'dT',v:0,min:-80,max:80,step:5,l:'ΔT',u:'°C'}],
 draw(a){a.clear();
  const P=a.st.P*1000, L=[a.st.a,a.st.b,a.st.c], A=a.st.A*1e-6, E=200e9, al=1.2e-5, dT=a.st.dT;
  const Lt=L[0]+L[1]+L[2], EA=E*A;
  let Nt=[0,0,0], RA=0, RD=0, dsp=[0,0,0,0], titulo='';
  if(a.st.t==='iso'){RA=P; Nt=[P,0,0]; titulo='Isostática: el axil sólo existe en el tramo cargado';}
  else if(a.st.t==='hiper'){RA=P*(L[1]+L[2])/Lt; RD=P-RA;
    Nt=[RA,RA-P,RA-P]; titulo='Hiperestática: equilibrio + compatibilidad';}
  else {RA=-EA*al*dT; Nt=[RA,RA,RA]; titulo='Dilatación impedida: tensión sin carga exterior';}
  dsp[0]=0;
  for(let i=0;i<3;i++)dsp[i+1]=dsp[i]+Nt[i]*L[i]/EA+(a.st.t==='term'?al*L[i]*dT:0);
  const x0=66,y0=136,S=Math.min(330/Lt,220);
  // barra
  let xx=x0;
  const col=[C.a,C.c,C.e];
  L.forEach((l,i)=>{const w=l*S;
    a.g.fillStyle=col[i];a.g.globalAlpha=.16;a.g.fillRect(xx,y0-22,w,44);a.g.globalAlpha=1;
    a.g.strokeStyle=col[i];a.g.lineWidth=2;a.g.strokeRect(xx,y0-22,w,44);
    a.txt(['A','B','C'][i],xx,y0+40,C.muted,12,'center');
    xx+=w;});
  a.txt('D',xx,y0+40,C.muted,12,'center');
  // empotramientos
  a.g.fillStyle=C.muted;a.g.fillRect(x0-12,y0-32,12,64);
  if(a.st.t!=='iso'){a.g.fillRect(xx,y0-32,12,64);}
  if(a.st.t!=='term'&&P>0){a.arrow(x0+L[0]*S-40,y0-46,x0+L[0]*S,y0-46,C.b,2.8);
    a.txt('P = '+NQ(a.st.P)+' kN',x0+L[0]*S-46,y0-50,C.b,12,'right');}
  if(a.st.t==='term'){a.txt('ΔT = '+NQ(dT)+' °C',x0+Lt*S/2,y0-46,C.b,13,'center');}
  // diagrama de axiles
  const y1=270,hv=58;
  const mx=Math.max(...Nt.map(Math.abs),1);
  a.line(x0,y1,x0+Lt*S,y1,C.muted,1.3);
  a.txt('N',x0-8,y1+4,C.muted,12,'right');
  xx=x0;
  L.forEach((l,i)=>{const w=l*S, Y=y1-Nt[i]/mx*hv;
    a.g.fillStyle=Nt[i]>=0?C.c:C.b;a.g.globalAlpha=.18;a.g.fillRect(xx,Math.min(Y,y1),w,Math.abs(Y-y1));a.g.globalAlpha=1;
    a.line(xx,Y,xx+w,Y,Nt[i]>=0?C.c:C.b,2.6);
    a.line(xx,y1,xx,Y,C.muted,1);a.line(xx+w,y1,xx+w,Y,C.muted,1);
    if(Math.abs(Nt[i])>1)a.txt(N1(Nt[i]/1000)+' kN',xx+w/2,Y+(Nt[i]>=0?-8:18),Nt[i]>=0?C.c:C.b,11,'center');
    xx+=w;});
  a.txt('tracción +',x0+Lt*S+8,y1-20,C.c,10);a.txt('compresión −',x0+Lt*S+8,y1+22,C.b,10);
  // desplazamientos
  const y2=370;
  a.line(x0,y2,x0+Lt*S,y2,C.muted,1.3);
  a.txt('u',x0-8,y2+4,C.muted,12,'right');
  const mxd=Math.max(...dsp.map(Math.abs),1e-9);
  a.g.strokeStyle=C.f;a.g.lineWidth=2.6;a.g.beginPath();
  let xs=x0; a.g.moveTo(x0,y2-dsp[0]/mxd*40);
  L.forEach((l,i)=>{xs+=l*S;a.g.lineTo(xs,y2-dsp[i+1]/mxd*40);});
  a.g.stroke();
  [1,2].forEach(i=>{const X=x0+L.slice(0,i).reduce((s,v)=>s+v,0)*S;
    a.circ(X,y2-dsp[i]/mxd*40,4,C.f,true);
    a.txt(N2(dsp[i]*1000)+' mm',X,y2-dsp[i]/mxd*40-10,C.f,11,'center');});
  const bx=440,by=56;
  [['R_A',N1(RA/1000)+' kN'],['R_D',N1(RD/1000)+' kN'],['σ tramo 1',N1(Nt[0]/A/1e6)+' MPa'],['σ tramo 2',N1(Nt[1]/A/1e6)+' MPa'],
   ['d_B',N2(dsp[1]*1000)+' mm'],['d_C',N2(dsp[2]*1000)+' mm']].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*22,C.muted,12);a.txt(d[1],bx+180,by+i*22,C.text,12,'right');});
  a.html(`<b>${titulo}.</b> ${a.st.t==='hiper'?`R<sub>A</sub> = P(b+c)/(a+b+c) = <b>${N1(RA/1000)} kN</b> y R<sub>D</sub> = <b>${N1(RD/1000)} kN</b>: cada empotramiento se lleva la carga en proporción a la distancia al OTRO extremo.`:(a.st.t==='term'?`Con la dilatación impedida, σ = −Eα·ΔT = <b>${N1(Nt[0]/A/1e6)} MPa</b>, independiente de la longitud y del área.`:'Sólo el tramo entre la carga y el apoyo trabaja; el resto va descargado.')}<br>
  Desplazamientos: d<sub>B</sub> = <b>${N2(dsp[1]*1000)} mm</b>, d<sub>C</sub> = ${N2(dsp[2]*1000)} mm, d<sub>D</sub> = ${N2(dsp[3]*1000)} mm ${a.st.t!=='iso'?'(debe ser 0 por el empotramiento ✓)':''}.<br>
  <span class="hint">Pon a = b = c = 0,5 m y P = 100 kN: R_A = 66,7 kN y R_D = 33,3 kN. Y en el caso térmico, cambia el área: la tensión no se mueve.</span>`);}});

/* T6 · Flexión desviada */
SIMS.flexion=el=>build(el,{w:660,h:400,
 sliders:[{k:'b',v:100,min:40,max:300,step:5,l:'ancho b',u:'mm'},{k:'h',v:200,min:40,max:400,step:5,l:'canto h',u:'mm'},
  {k:'M',v:12,min:1,max:60,step:0.5,l:'momento M',u:'kN·m'},{k:'al',v:20,min:0,max:90,step:1,l:'inclinación del momento',u:'°'}],
 draw(a){a.clear();
  const b=a.st.b, h=a.st.h, M=a.st.M*1e6, al=a.st.al*Math.PI/180;
  const Iz=b*Math.pow(h,3)/12, Iy=h*Math.pow(b,3)/12;
  const Mz=M*Math.cos(al), My=M*Math.sin(al);
  const sig=(y,z)=>Mz/Iz*y+My/Iy*z;
  const corners=[[h/2,b/2],[h/2,-b/2],[-h/2,b/2],[-h/2,-b/2]];
  const vals=corners.map(c=>sig(c[0],c[1]));
  const smax=Math.max(...vals), smin=Math.min(...vals);
  const tanB=(My/Iy)/(Mz/Iz);
  const angEN=Math.atan(tanB)*180/Math.PI;
  const S=Math.min(1.0,200/h,200/b);
  const cx=180,cy=190;
  // seccion coloreada por tension
  const nseg=60;
  for(let i=0;i<nseg;i++)for(let j=0;j<nseg;j++){
    const y=h*(i/nseg-0.5)+h/nseg/2, z=b*(j/nseg-0.5)+b/nseg/2;
    const s=sig(y,z), t=Math.max(-1,Math.min(1,s/Math.max(Math.abs(smax),Math.abs(smin))));
    a.g.fillStyle=t>0?C.b:C.c; a.g.globalAlpha=Math.abs(t)*0.55;
    a.g.fillRect(cx+z*S-b*S/nseg/2, cy-y*S-h*S/nseg/2, b*S/nseg+1, h*S/nseg+1);}
  a.g.globalAlpha=1;
  a.g.strokeStyle=C.text;a.g.lineWidth=2;a.g.strokeRect(cx-b*S/2,cy-h*S/2,b*S,h*S);
  // eje neutro: y = -(My/Iy)/(Mz/Iz) * z
  const k=-(My/Iy)/(Mz/Iz);
  const zA=-b/2, zB=b/2;
  a.g.strokeStyle=C.f;a.g.lineWidth=2.6;a.g.beginPath();
  a.g.moveTo(cx+zA*S*1.3, cy-k*zA*1.3*S); a.g.lineTo(cx+zB*S*1.3, cy-k*zB*1.3*S); a.g.stroke();
  a.txt('eje neutro',cx+zB*S*1.3+6,cy-k*zB*1.3*S,C.f,11);
  // vector momento
  a.arrow(cx,cy,cx+70*Math.sin(al),cy-70*Math.cos(al),C.a,2.6);
  a.txt('M',cx+76*Math.sin(al),cy-74*Math.cos(al),C.a,12);
  a.line(cx,cy-h*S/2-16,cx,cy+h*S/2+16,C.muted,1,[4,3]);
  a.line(cx-b*S/2-16,cy,cx+b*S/2+16,cy,C.muted,1,[4,3]);
  corners.forEach((c,i)=>{const X=cx+c[1]*S, Y=cy-c[0]*S;
    a.circ(X,Y,4,C.text,true);
    a.txt(N1(vals[i]),X+(c[1]>0?8:-8),Y+(c[0]>0?-8:16),Math.abs(vals[i])>1e-9?(vals[i]>0?C.b:C.c):C.muted,11,c[1]>0?'left':'right');});
  a.txt('tracción (+)',cx-b*S/2-6,cy+h*S/2+34,C.b,11,'right');
  a.txt('compresión (−)',cx+b*S/2+6,cy+h*S/2+34,C.c,11);
  const bx=400,by=70;
  [['I_z',N1(Iz/1e4)+' cm⁴'],['I_y',N1(Iy/1e4)+' cm⁴'],['M_z = M·cos α',N2(Mz/1e6)+' kN·m'],['M_y = M·sen α',N2(My/1e6)+' kN·m'],
   ['σ máxima',N1(smax)+' MPa'],['σ mínima',N1(smin)+' MPa'],['ángulo del eje neutro',N1(angEN)+'°'],['σ si M fuera recto',N1(M/(Iz/(h/2)))+' MPa']].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*24,C.muted,12);a.txt(d[1],bx+215,by+i*24,C.text,12,'right');});
  const recto=M/(Iz/(h/2));
  a.html(`Sección ${b}×${h} mm con M = ${NQ(a.st.M)} kN·m inclinado ${a.st.al}°: M<sub>z</sub> = ${N2(Mz/1e6)} y M<sub>y</sub> = ${N2(My/1e6)} kN·m.<br>
  σ<sub>max</sub> = <b>${N1(smax)} MPa</b> y σ<sub>min</sub> = ${N1(smin)} MPa, en los vértices <b>más alejados del eje neutro</b>, que forma <b>${N1(angEN)}°</b> con el eje horizontal mientras el momento sólo está inclinado ${a.st.al}°.<br>
  Si el momento actuara recto, la tensión sería ${N1(recto)} MPa: inclinarlo la multiplica por <b>${N2(smax/recto)}</b>.<br>
  <span class="hint">Sube la inclinación poco a poco y mira cómo gira el eje neutro mucho más deprisa que el momento: ésa es la trampa de la flexión desviada.</span>`);}});

/* T7 · Tensiones tangenciales */
SIMS.tangencial=el=>build(el,{w:660,h:480,
 selects:[{k:'f',v:'rect',l:'sección',opts:[['rect','rectangular'],['I','doble T']]}],
 sliders:[{k:'b',v:120,min:40,max:300,step:5,l:'ancho (ala en doble T)',u:'mm'},{k:'h',v:300,min:80,max:500,step:10,l:'canto',u:'mm'},
  {k:'tw',v:9,min:4,max:30,step:1,l:'espesor del alma',u:'mm'},{k:'tf',v:15,min:5,max:40,step:1,l:'espesor del ala',u:'mm'},
  {k:'V',v:90,min:0,max:400,step:5,l:'cortante V',u:'kN'},{k:'M',v:75,min:0,max:400,step:5,l:'flector M',u:'kN·m'}],
 draw(a){a.clear();
  const b=a.st.b, h=a.st.h, tw=a.st.tw, tf=a.st.tf, V=a.st.V*1000, M=a.st.M*1e6;
  const rect=a.st.f==='rect';
  const A=rect?b*h:2*b*tf+(h-2*tf)*tw;
  const I=rect?b*Math.pow(h,3)/12:(b*Math.pow(h,3)-(b-tw)*Math.pow(h-2*tf,3))/12;
  const anchoDe=y=>rect?b:(Math.abs(y)>h/2-tf?b:tw);
  const Qde=y=>{ // momento estatico del area por encima de y
    if(rect)return b/2*(h*h/4-y*y);
    const ya=h/2-tf;
    if(Math.abs(y)>=ya) return b/2*(h*h/4-y*y);
    return b*tf*(h-tf)/2 + tw/2*(ya*ya-y*y);};
  const tau=y=>V*Qde(y)/(I*anchoDe(y));
  const sig=y=>M*y/I;
  const taumax=tau(0), sigmax=sig(h/2);
  // dibujo seccion
  const S=Math.min(0.62,200/h,150/b);
  const cx=130,cy=210;
  const fill=(x,y,w,hh)=>{a.g.fillStyle=C.a;a.g.globalAlpha=.16;a.g.fillRect(x,y,w,hh);a.g.globalAlpha=1;a.g.strokeStyle=C.a;a.g.lineWidth=2;a.g.strokeRect(x,y,w,hh);};
  if(rect) fill(cx-b*S/2,cy-h*S/2,b*S,h*S);
  else {fill(cx-b*S/2,cy-h*S/2,b*S,tf*S); fill(cx-b*S/2,cy+h*S/2-tf*S,b*S,tf*S); fill(cx-tw*S/2,cy-(h/2-tf)*S,tw*S,(h-2*tf)*S);}
  a.line(cx-b*S/2-14,cy,cx+b*S/2+14,cy,C.f,1.6,[5,4]);
  a.txt('eje neutro',cx-b*S/2-16,cy+4,C.f,10,'right');
  // diagramas sigma y tau
  const px0=300, wv=110;
  const dib=(fun,x0,col,lab,mx,signo)=>{
    const ejeX=signo?x0+wv/2:x0;
    a.line(ejeX,cy-h*S/2-12,ejeX,cy+h*S/2+12,C.muted,1.3);
    a.txt(lab,x0+wv/2,cy-h*S/2-22,col,12,'center');
    const X=(v)=>signo? ejeX+v/mx*wv/2 : x0+Math.abs(v)/mx*wv;
    a.g.fillStyle=col;a.g.globalAlpha=.16;a.g.beginPath();a.g.moveTo(ejeX,cy-h*S/2);
    for(let i=0;i<=120;i++){const y=h/2-h*i/120; a.g.lineTo(X(fun(y)), cy-y*S);}
    a.g.lineTo(ejeX,cy+h*S/2);a.g.closePath();a.g.fill();a.g.globalAlpha=1;
    a.g.strokeStyle=col;a.g.lineWidth=2.4;a.g.beginPath();
    for(let i=0;i<=240;i++){const y=h/2-h*i/240; const Xp=X(fun(y)), Y=cy-y*S;i?a.g.lineTo(Xp,Y):a.g.moveTo(Xp,Y);}
    a.g.stroke();};
  dib(sig,px0,C.e,'σ (MPa)',Math.max(sigmax,1e-9),true);
  dib(tau,px0+165,C.c,'τ (MPa)',Math.max(taumax,1e-9),false);
  a.txt('+'+N1(sigmax),px0+wv+6,cy-h*S/2+10,C.e,11);
  a.txt('−'+N1(sigmax),px0-6,cy+h*S/2-4,C.e,11,'right');
  a.txt('σ = M·y / I',px0+wv/2,cy+h*S/2+28,C.muted,10,'center');
  a.txt(N1(taumax),px0+165+wv+6,cy+4,C.c,11);
  a.txt('0',px0+165+4,cy-h*S/2+10,C.c,11);
  if(!rect){const ya=h/2-tf;
    a.line(px0+165,cy-ya*S,px0+165+Math.abs(tau(ya+0.01))/taumax*wv,cy-ya*S,C.muted,1,[3,3]);
    a.txt('salto ala-alma',px0+165+wv+6,cy-ya*S+4,C.muted,10);}
  const bx=56,by=346;
  const yc=rect?h/4:h/2-tf;
  const vmFibra=Math.sqrt(sigmax*sigmax), vmNeutro=Math.sqrt(3)*taumax, vmMix=Math.sqrt(Math.pow(sig(yc),2)+3*Math.pow(tau(yc+(rect?0:0.01)),2));
  [['I',NQ(I/1e4)+' cm⁴'],['σ máx (fibra extrema)',N1(sigmax)+' MPa'],['τ máx (eje neutro)',N1(taumax)+' MPa'],
   ['von Mises fibra extrema',N1(vmFibra)+' MPa'],['von Mises eje neutro',N1(vmNeutro)+' MPa'],[rect?'von Mises a h/4':'von Mises encuentro ala-alma',N1(vmMix)+' MPa']].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*22,C.muted,12);a.txt(d[1],bx+320,by+i*22,i>=3?(Math.max(vmFibra,vmNeutro,vmMix)===[vmFibra,vmNeutro,vmMix][i-3]?C.b:C.text):C.text,12,'right');});
  const peor=Math.max(vmFibra,vmNeutro,vmMix);
  a.html(`Sección <b>${rect?'rectangular':'doble T'}</b> con V = ${NQ(a.st.V)} kN y M = ${NQ(a.st.M)} kN·m: I = ${NQ(I/1e4)} cm⁴, <b>σ<sub>max</sub> = ${N1(sigmax)} MPa</b> en las fibras extremas y <b>τ<sub>max</sub> = ${N1(taumax)} MPa</b> en el eje neutro.<br>
  Son distribuciones <b>complementarias</b>: donde σ es máxima, τ vale cero, y al revés. ${rect?`En rectangular, τ<sub>max</sub> = 1,5·V/A = ${N1(1.5*V/A)} MPa ✓`:'En la doble T el alma se lleva casi todo el cortante y hay un <b>salto</b> en el encuentro con el ala, donde cambia el ancho.'}<br>
  Tensión equivalente de von Mises más desfavorable: <b>${N1(peor)} MPa</b> (f<sub>yd</sub> del S275 = 261,9 MPa).<br>
  <span class="hint">Cambia a doble T y baja el espesor del alma: τ se dispara y el punto crítico deja de ser la fibra extrema.</span>`);}});

/* T8 · Flexión compuesta y núcleo central */
SIMS.nucleo=el=>build(el,{w:660,h:430,
 sliders:[{k:'b',v:300,min:100,max:600,step:10,l:'ancho b',u:'mm'},{k:'h',v:400,min:100,max:600,step:10,l:'canto h',u:'mm'},
  {k:'N',v:600,min:10,max:2000,step:10,l:'compresión N',u:'kN'},{k:'e',v:80,min:0,max:280,step:2,l:'excentricidad e (eje h)',u:'mm'}],
 draw(a){a.clear();
  const b=a.st.b, h=a.st.h, N=-a.st.N*1000, e=a.st.e;
  const A=b*h, I=b*Math.pow(h,3)/12, W=I/(h/2);
  const M=Math.abs(N)*e;
  const s1=N/A + M/W, s2=N/A - M/W;
  const emax=h/6;
  const y0n=(I/A)/e;
  const S=Math.min(0.52,200/h,180/b);
  const cx=160,cy=200;
  a.g.fillStyle=C.a;a.g.globalAlpha=.1;a.g.fillRect(cx-b*S/2,cy-h*S/2,b*S,h*S);a.g.globalAlpha=1;
  a.g.strokeStyle=C.a;a.g.lineWidth=2;a.g.strokeRect(cx-b*S/2,cy-h*S/2,b*S,h*S);
  // nucleo central (rombo)
  a.g.strokeStyle=C.c;a.g.lineWidth=2;a.g.setLineDash([4,3]);a.g.beginPath();
  a.g.moveTo(cx,cy-h/6*S);a.g.lineTo(cx+b/6*S,cy);a.g.lineTo(cx,cy+h/6*S);a.g.lineTo(cx-b/6*S,cy);a.g.closePath();a.g.stroke();a.g.setLineDash([]);
  a.g.fillStyle=C.c;a.g.globalAlpha=.14;a.g.fill();a.g.globalAlpha=1;
  a.txt('núcleo central',cx,cy+h/6*S+18,C.c,11,'center');
  a.circ(cx,cy-e*S,6,C.f,true);
  a.txt('carga (e = '+NQ(e)+' mm)',cx+10,cy-e*S-8,C.f,11);
  a.circ(cx,cy,3,C.muted,true);a.txt('G',cx-10,cy+4,C.muted,11,'right');
  // distribucion de tensiones
  const dx=380, wv=150;
  const mx=Math.max(Math.abs(s1),Math.abs(s2),1e-9);
  a.line(dx,cy-h*S/2-14,dx,cy+h*S/2+14,C.muted,1.4);
  a.g.strokeStyle=C.e;a.g.lineWidth=2.6;a.g.beginPath();
  a.g.moveTo(dx+s1/mx*wv*0.9, cy-h*S/2);a.g.lineTo(dx+s2/mx*wv*0.9, cy+h*S/2);a.g.stroke();
  a.g.fillStyle=C.e;a.g.globalAlpha=.16;a.g.beginPath();
  a.g.moveTo(dx,cy-h*S/2);a.g.lineTo(dx+s1/mx*wv*0.9,cy-h*S/2);a.g.lineTo(dx+s2/mx*wv*0.9,cy+h*S/2);a.g.lineTo(dx,cy+h*S/2);a.g.closePath();a.g.fill();a.g.globalAlpha=1;
  a.txt(N2(s1)+' MPa',dx+s1/mx*wv*0.9+(s1>0?6:-6),cy-h*S/2-6,s1>0?C.b:C.c,11,s1>0?'left':'right');
  a.txt(N2(s2)+' MPa',dx+s2/mx*wv*0.9+(s2>0?6:-6),cy+h*S/2+16,s2>0?C.b:C.c,11,s2>0?'left':'right');
  a.txt('compresión',dx-wv*0.9-4,cy-h*S/2-24,C.c,11,'right');
  a.txt('tracción',dx+wv*0.9+4,cy-h*S/2-24,C.b,11,'right');
  // eje neutro en la distribucion
  if(s1*s2<0){const t=s1/(s1-s2);
    const Y=cy-h*S/2+t*h*S;
    a.line(dx-wv,Y,dx+wv,Y,C.f,1.6,[5,4]);
    a.txt('eje neutro',dx+wv,Y-6,C.f,11,'right');
    a.line(cx-b*S/2-8,Y,cx+b*S/2+8,Y,C.f,1.6,[5,4]);}
  const bx=56,by=346;
  [['A',NQ(A/100)+' cm²'],['W',NQ(W/1e3)+' cm³'],['N/A',N2(N/A)+' MPa'],['M/W',N2(M/W)+' MPa'],
   ['σ borde 1',N2(s1)+' MPa'],['σ borde 2',N2(s2)+' MPa'],['e máx = h/6',N1(emax)+' mm']].forEach((d,i)=>{
    const col=i<4?130:0;
    a.txt(d[0],bx+(i<4?0:330),by+(i<4?i:i-4)*22,C.muted,12);
    a.txt(d[1],bx+(i<4?250:560),by+(i<4?i:i-4)*22,C.text,12,'right');});
  const dentro=e<=emax;
  a.html(`N = ${NQ(a.st.N)} kN de compresión con e = ${NQ(e)} mm ⇒ M = N·e = ${N1(M/1e6)} kN·m; σ = N/A ± M/W = ${N2(N/A)} ± ${N2(M/W)}.<br>
  Bordes: <b>${N2(s1)}</b> y <b>${N2(s2)} MPa</b>. ${dentro?`La carga está <b>dentro del núcleo central</b> (e ≤ h/6 = ${N1(emax)} mm): toda la sección comprimida ✓`:`La carga está <b>FUERA del núcleo central</b> (h/6 = ${N1(emax)} mm): aparecen <b>tracciones</b>, inadmisibles en hormigón en masa o fábrica ✗. El eje neutro corta la sección a ${N1(y0n)} mm del centro de gravedad.`}<br>
  <span class="hint">Mueve la excentricidad hasta el vértice del rombo: justo ahí una de las tensiones se anula. Es la regla del tercio central.</span>`);}});

/* T9 · Deformaciones: flecha y PFV */
SIMS.flecha=el=>build(el,{w:660,h:420,
 selects:[{k:'t',v:'mens',l:'caso',opts:[['mens','ménsula con carga en punta'],['bip','biapoyada con carga uniforme'],['bipP','biapoyada con carga puntual']]}],
 sliders:[{k:'L',v:4,min:1,max:12,step:0.5,l:'luz',u:'m'},{k:'P',v:10,min:1,max:100,step:1,l:'carga P (o q)',u:'kN · kN/m'},
  {k:'I',v:8356,min:300,max:60000,step:100,l:'inercia I',u:'cm⁴'},{k:'E',v:210,min:10,max:300,step:5,l:'módulo E',u:'GPa'}],
 draw(a){a.clear();
  const L=a.st.L, P=a.st.P*1000, I=a.st.I*1e-8, E=a.st.E*1e9, EI=E*I;
  let d=0, form='', v=null;
  if(a.st.t==='mens'){d=P*Math.pow(L,3)/(3*EI); form='δ = PL³/(3EI)';
    v=x=>-P*x*x*(3*L-x)/(6*EI);}
  else if(a.st.t==='bip'){const q=P; d=5*q*Math.pow(L,4)/(384*EI); form='δ = 5qL⁴/(384EI)';
    v=x=>-q*x*(Math.pow(L,3)-2*L*x*x+Math.pow(x,3))/(24*EI);}
  else {d=P*Math.pow(L,3)/(48*EI); form='δ = PL³/(48EI)';
    v=x=>x<=L/2?-P*x*(3*L*L-4*x*x)/(48*EI):-P*(L-x)*(3*L*L-4*Math.pow(L-x,2))/(48*EI);}
  const x0=70,wv=520,yv=140;
  const px=x=>x0+x/L*wv;
  const esc=Math.min(70/Math.max(d,1e-9),4000);
  a.line(x0,yv,x0+wv,yv,C.muted,1.2,[5,4]);
  a.g.strokeStyle=C.a;a.g.lineWidth=3;a.g.beginPath();
  for(let i=0;i<=200;i++){const x=L*i/200, Y=yv-v(x)*esc;
    i?a.g.lineTo(px(x),Y):a.g.moveTo(px(x),Y);}
  a.g.stroke();
  if(a.st.t==='mens'){a.g.fillStyle=C.e;a.g.fillRect(x0-14,yv-34,14,68);Tierra(a,x0-7,yv+36);
    a.arrow(px(L),yv-50,px(L),yv-v(L)*esc-8,C.b,2.6);a.txt('P',px(L)+8,yv-40,C.b,12);}
  else {[0,L].forEach(x=>{const X=px(x);a.g.fillStyle=C.e;a.g.beginPath();a.g.moveTo(X,yv+4);a.g.lineTo(X-12,yv+24);a.g.lineTo(X+12,yv+24);a.g.closePath();a.g.fill();Tierra(a,X,yv+26);});
    if(a.st.t==='bip'){for(let i=0;i<=12;i++)a.arrow(px(L*i/12),yv-44,px(L*i/12),yv-14,C.c,1.6);
      a.line(x0,yv-44,x0+wv,yv-44,C.c,2);a.txt('q = '+NQ(a.st.P)+' kN/m',px(L/2),yv-52,C.c,12,'center');}
    else {a.arrow(px(L/2),yv-56,px(L/2),yv-10,C.b,2.8);a.txt('P = '+NQ(a.st.P)+' kN',px(L/2),yv-62,C.b,12,'center');}}
  const xm=a.st.t==='mens'?L:L/2;
  a.line(px(xm),yv,px(xm),yv-v(xm)*esc,C.f,1.6,[4,3]);
  a.circ(px(xm),yv-v(xm)*esc,6,C.f,true);
  a.txt('δ = '+N2(d*1000)+' mm',px(xm)+10,yv-v(xm)*esc+6,C.f,13);
  // comparativa limites
  const y2=300;
  a.txt('Comprobación de flecha (estado límite de servicio)',x0,y2-18,C.text,13);
  [['L/300',L*1000/300],['L/400',L*1000/400],['L/500',L*1000/500]].forEach((lim,i)=>{
    const ok=d*1000<=lim[1];
    a.txt('δ ≤ '+lim[0],x0,y2+10+i*24,C.muted,12);
    a.txt(N2(lim[1])+' mm',x0+150,y2+10+i*24,C.text,12,'right');
    a.txt(ok?'✓ cumple':'✗ no cumple',x0+180,y2+10+i*24,ok?C.c:C.b,12);});
  const bx=380,by=310;
  [['EI',NQ(EI/1e6)+'·10⁶ N·m²'],['fórmula',form],['flecha',N2(d*1000)+' mm'],['δ/L',' 1/'+N1(L/d)]].forEach((dd,i)=>{
    a.txt(dd[0],bx,by+i*22,C.muted,12);a.txt(dd[1],bx+250,by+i*22,C.text,12,'right');});
  a.html(`${{mens:'Ménsula con carga en punta',bip:'Biapoyada con carga uniforme',bipP:'Biapoyada con carga puntual centrada'}[a.st.t]}: <b>${form}</b> con EI = ${NQ(EI/1e6)}·10⁶ N·m².<br>
  Flecha máxima: <b>${N2(d*1000)} mm</b> = L/${N1(L/d)}. Esta misma expresión es la que se obtiene integrando el PFV con la carga unidad en el punto de la flecha.<br>
  <span class="hint">Prueba la ménsula con L = 4 m, P = 10 kN e I = 8 356 cm⁴: salen 12,2 mm, el resultado del problema del parcial de junio de 2023. Y fíjate en que duplicar la inercia reduce la flecha a la mitad, pero duplicar el canto la reduce ocho veces.</span>`);}});

/* T10 · Dimensionado */
SIMS.dimensionado=el=>build(el,{w:660,h:460,
 selects:[{k:'ac',v:'275',l:'acero',opts:[['235','S235'],['275','S275'],['355','S355']]},
          {k:'lim',v:'300',l:'límite de flecha',opts:[['300','L/300'],['400','L/400'],['500','L/500']]}],
 sliders:[{k:'L',v:6,min:2,max:14,step:0.5,l:'luz',u:'m'},{k:'q',v:12,min:1,max:80,step:1,l:'carga característica',u:'kN/m'},
  {k:'g',v:1.5,min:1,max:1.6,step:0.05,l:'coeficiente de mayoración',u:''}],
 draw(a){a.clear();
  const perf=[['IPE 160',109,869,15.8],['IPE 180',146,1317,18.8],['IPE 200',194,1943,22.4],['IPE 220',252,2772,26.2],
    ['IPE 240',324,3892,30.7],['IPE 270',429,5790,36.1],['IPE 300',557,8356,42.2],['IPE 330',713,11770,49.1],
    ['IPE 360',904,16270,57.1],['IPE 400',1160,23130,66.3],['IPE 450',1500,33740,77.6],['IPE 500',1930,48200,90.7]];
  const fy=parseFloat(a.st.ac), fyd=fy/1.05;
  const L=a.st.L, q=a.st.q*1000, qd=q*a.st.g, E=210e9;
  const Med=qd*L*L/8, Ved=qd*L/2;
  const Wnec=Med/(fyd*1e6)*1e6;              // cm3
  const dlim=L*1000/parseFloat(a.st.lim);    // mm
  const Inec=5*q*Math.pow(L,4)/(384*E*(dlim/1000))*1e8;  // cm4
  let sel=null;
  for(const p of perf){ if(p[1]>=Wnec && p[2]>=Inec){sel=p;break;} }
  const selW=perf.find(p=>p[1]>=Wnec), selI=perf.find(p=>p[2]>=Inec);
  // grafico de barras W
  const x0=60,y0=250,wv=420;
  a.txt('Perfiles IPE: módulo resistente (cm³)',x0,46,C.text,13);
  const mxW=Math.max(...perf.map(p=>p[1]), Wnec)*1.08;
  perf.forEach((p,i)=>{const X=x0+i*(wv/perf.length), W=wv/perf.length-6;
    const H=p[1]/mxW*150;
    const esSel=sel&&p[0]===sel[0];
    a.g.fillStyle=esSel?C.a:(p[1]>=Wnec?C.c:C.grid);a.g.globalAlpha=esSel?0.85:0.5;
    a.g.fillRect(X,y0-H,W,H);a.g.globalAlpha=1;
    a.g.save();a.g.translate(X+W/2,y0+6);a.g.rotate(-Math.PI/3);
    a.g.fillStyle=esSel?C.a:C.muted;a.g.font='10px system-ui';a.g.textAlign='right';a.g.fillText(p[0],0,0);a.g.restore();});
  const Hn=Wnec/mxW*150;
  a.line(x0,y0-Hn,x0+wv,y0-Hn,C.b,2,[6,4]);
  a.txt('W necesario = '+N1(Wnec)+' cm³',x0+wv,y0-Hn-8,C.b,12,'right');
  const bx=60,by=320;
  [['M_Ed = γ·q·L²/8',N1(Med/1000)+' kN·m'],['f_yd = f_y/1,05',N1(fyd)+' MPa'],['W necesario',N1(Wnec)+' cm³'],
   ['flecha admisible',N2(dlim)+' mm'],['I necesario',N1(Inec)+' cm⁴']].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*22,C.muted,12);a.txt(d[1],bx+260,by+i*22,C.text,12,'right');});
  const bx2=390;
  a.txt('Perfil elegido',bx2,by-10,C.text,13);
  if(sel){a.txt(sel[0],bx2,by+20,C.a,22);
    const sig=Med/(sel[1]*1e-6)/1e6, fle=5*q*Math.pow(L,4)/(384*E*sel[2]*1e-8)*1000;
    a.txt('σ = '+N1(sig)+' MPa ('+N1(sig/fyd*100)+' %)',bx2,by+46,sig<=fyd?C.c:C.b,12);
    a.txt('δ = '+N2(fle)+' mm de '+N2(dlim)+' mm',bx2,by+68,fle<=dlim?C.c:C.b,12);
    a.txt('peso '+N1(sel[3])+' kg/m',bx2,by+90,C.muted,12);
    a.txt(selW&&selI&&selW[0]!==selI[0]?'manda la FLECHA':'manda la resistencia',bx2,by+112,C.f,12);
  } else a.txt('ningún IPE de la serie basta',bx2,by+20,C.b,14);
  a.html(`Viga biapoyada de ${NQ(L)} m con q = ${NQ(a.st.q)} kN/m (mayorada ×${NQ(a.st.g)}): M<sub>Ed</sub> = <b>${N1(Med/1000)} kN·m</b>, f<sub>yd</sub> = ${N1(fyd)} MPa ⇒ <b>W<sub>nec</sub> = ${N1(Wnec)} cm³</b>.<br>
  Flecha admisible L/${a.st.lim} = ${N2(dlim)} mm (con la carga <b>sin mayorar</b>) ⇒ <b>I<sub>nec</sub> = ${N1(Inec)} cm⁴</b>.<br>
  ${sel?`Perfil mínimo que cumple ambas: <b>${sel[0]}</b>${selW&&selI&&selW[0]!==selI[0]?`, y lo elige la <b>deformación</b> (por resistencia habría bastado el ${selW[0]})`:''}.`:'Ningún perfil de la serie IPE cumple: habría que ir a HEB o reducir la luz.'}<br>
  <span class="hint">Con 6 m y 12 kN/m en S275 sale el IPE 270 por flecha, aunque el IPE 240 aguantaba a resistencia. Sube la luz y verás que el criterio de servicio manda cada vez más.</span>`);}});

/* ---- Barra escalonada bajo tracción, paso a paso: σ = N/A, δ = N·L/(E·A) ---- */
SIMS.axilPaso=el=>build(el,{w:660,h:380,
 sliders:[{k:'paso',v:0,min:0,max:6,step:1,l:'paso de la resolución (0 = problema)',u:''}],
 draw(a){a.clear();const p=a.st.paso;const g=a.g;
  const x0=50,x1=270,x2=600,yc=170,h1=60,h2=30;
  // secciones: tramo 1 (A = 2000 mm²) y tramo 2 (A = 1000 mm²), dibujadas con altura proporcional al área
  g.save();g.globalAlpha=0.22;
  g.fillStyle=C.f;g.fillRect(x0,yc-h1/2,x1-x0,h1);
  g.fillStyle=C.b;g.fillRect(x1,yc-h2/2,x2-x1,h2);
  g.restore();
  g.lineWidth=2;
  g.strokeStyle=C.f;g.strokeRect(x0,yc-h1/2,x1-x0,h1);
  g.strokeStyle=C.b;g.strokeRect(x1,yc-h2/2,x2-x1,h2);
  // empotramiento a la izquierda
  a.line(x0-6,yc-50,x0-6,yc+50,C.text,4);
  for(let y=yc-44;y<=yc+44;y+=12)a.line(x0-6,y,x0-16,y+10,C.muted,1);
  // carga de tracción P en el extremo libre
  a.arrow(x2+4,yc,x2+44,yc,C.d,3);
  a.txt('P = 50 kN',x2+24,yc-30,C.d,12,'center');
  // datos geométricos
  a.txt('tramo 1: L₁ = 1 m, A₁ = 2000 mm²',(x0+x1)/2,yc+h1/2+18,C.f,12,'center');
  a.txt('tramo 2: L₂ = 1,5 m, A₂ = 1000 mm²',(x1+x2)/2,yc+h1/2+18,C.b,12,'center');
  if(p>=1)a.txt('N = P = 50 kN (tracción) en los dos tramos',330,250,C.d,13,'center');
  if(p>=2)a.txt('σ₁ = N/A₁ = 25 MPa',160,278,C.f,13,'center');
  if(p>=2)a.txt('σ₂ = N/A₂ = 50 MPa',435,278,C.b,13,'center');
  if(p>=3)a.txt('δ₁ = N·L₁/(E·A₁) = 0,125 mm',160,306,C.f,13,'center');
  if(p>=4)a.txt('δ₂ = N·L₂/(E·A₂) = 0,375 mm',435,306,C.b,13,'center');
  if(p>=5)a.txt('δ = δ₁ + δ₂ = 0,5 mm',330,334,C.a,14,'center');
  if(p>=6)a.txt('Tramo más tensionado: el fino (50 MPa)',330,362,C.text,13,'center');
  const T=[
   'Barra escalonada empotrada a la izquierda y cargada con P = 50 kN de tracción en el extremo libre. E = 200 000 MPa. Hay que calcular la tensión en cada tramo y el alargamiento total.',
   'Con cortes en cada tramo, el esfuerzo axil vale N = 50 kN en tracción. No hay cargas intermedias, así que N es constante en cada tramo y coincide con P.',
   'Tensiones: σ = N/A. En el tramo 1, σ₁ = 50 000 N / 2000 mm² = 25 MPa. En el tramo 2, σ₂ = 50 000 N / 1000 mm² = 50 MPa.',
   'Alargamiento del tramo 1: δ₁ = N·L₁/(E·A₁) = 50 000 · 1000 / (200 000 · 2000) = 0,125 mm. Las longitudes van en mm para que las unidades cuadren.',
   'Alargamiento del tramo 2: δ₂ = 50 000 · 1500 / (200 000 · 1000) = 0,375 mm. Es el tramo más largo y también el más fino.',
   'Alargamiento total: como los tramos están en serie, se suman: δ = δ₁ + δ₂ = 0,5 mm del extremo libre respecto al empotramiento.',
   'Resumen: la tensión máxima está en el tramo fino (50 MPa), no en el grueso. Si se diera solo el alargamiento total sin separar tramos, se perdería esa información.'
  ];
  a.html(`<div>${T[p]}</div>`);
 }});









/* ---- paso2 flexionPaso ---- */
SIMS.flexionPaso=el=>SIMS.__paso(el,{"w":660,"h":330,"q":"¿Cuánto vale la tensión máxima de flexión en una viga biapoyada de 4 m con 10 kN/m y sección de 100 × 200 mm? Sube el paso.","base":[["l",60,90,320,90,3],["t","A",60,112,13,"center"],["t","B",320,112,13,"center"],["a",60.0,60,60.0,86,1.5],["a",92.5,60,92.5,86,1.5],["a",125.0,60,125.0,86,1.5],["a",157.5,60,157.5,86,1.5],["a",190.0,60,190.0,86,1.5],["a",222.5,60,222.5,86,1.5],["a",255.0,60,255.0,86,1.5],["a",287.5,60,287.5,86,1.5],["a",320.0,60,320.0,86,1.5],["t","q = 10 kN/m",190.0,52,13,"center"],["t","L = 4 m",190.0,132,13,"center"]],"steps":[{"text":"Viga biapoyada de <b>L = 4 m</b> con carga uniforme <b>q = 10 kN/m</b> y sección rectangular <b>100 × 200 mm</b> (200 mm de canto). Se pide la tensión normal máxima por flexión.","add":[]},{"text":"Por simetría las reacciones son <b>R<sub>A</sub> = R<sub>B</sub> = qL/2 = 10·4/2 = 20 kN</b>.","add":[["t","R_A = R_B = qL/2 = 20 kN",40,180,15,"left"]]},{"text":"El momento flector es una parábola: <b>M(x) = (qL/2)x − qx²/2</b>, máximo en el centro (x = L/2): <b>M<sub>máx</sub> = qL²/8 = 10·16/8 = 20 kN·m</b>.","add":[["t","M_máx = qL²/8 = 20 kN·m",40,210,15,"left"],["p",[[350.0,214.0],[356.25,221.8],[362.5,229.2],[368.75,236.2],[375.0,242.8],[381.25,249.0],[387.5,254.8],[393.75,260.2],[400.0,265.2],[406.25,269.8],[412.5,274.0],[418.75,277.8],[425.0,281.2],[431.25,284.2],[437.5,286.8],[443.75,289.0],[450.0,290.8],[456.25,292.2],[462.5,293.2],[468.75,293.8],[475.0,294.0],[481.25,293.8],[487.5,293.2],[493.75,292.2],[500.0,290.8],[506.25,289.0],[512.5,286.8],[518.75,284.2],[525.0,281.2],[531.25,277.8],[537.5,274.0],[543.75,269.8],[550.0,265.2],[556.25,260.2],[562.5,254.8],[568.75,249.0],[575.0,242.79999999999998],[581.25,236.2],[587.5,229.20000000000002],[593.75,221.8],[600.0,214.0]],2.5],["l",350,214,600,214,1.5],["t","M(x)",350,206,12,"left"],["t","20 kN·m",475,310,12,"center"]]},{"text":"Módulo resistente de la sección rectangular: <b>W = b·h²/6 = 100·200²/6 = 666667 mm³</b> (menor que si se coloca de plano: el canto está al cuadrado).","add":[["t","W = bh²/6 = 666667 mm³",40,240,15,"left"]]},{"text":"Tensión máxima: <b>σ<sub>máx</sub> = M<sub>máx</sub>/W = 20·10⁶ N·mm / 666667 mm³ = 30 MPa</b>, en la fibra superior (compresión) y en la inferior (tracción) del centro.","add":[["t","σ_máx = M/W = 30 MPa",40,270,16,"left"]]},{"text":"Comprobación: para acero con σ<sub>adm</sub> = 150 MPa el coeficiente de seguridad es 150/30 = <b>5</b>. Si la viga se colocara girada 90° (h = 100 mm), W caería a 333333 mm³ y la tensión subiría a 60 MPa.","add":[["t","girada 90°: σ = 60 MPa",40,300,14,"left"]]}]});
/* ---- fin paso2 flexionPaso ---- */



/* ---- paso a paso declarativo ---- */
SIMS.__paso=(el,D)=>build(el,{w:D.w||660,h:D.h||340,
 sliders:[{k:'paso',v:0,min:0,max:D.steps.length,step:1,l:'paso de la resolución (0 = enunciado)',u:''}],
 draw(a){a.clear();const g=a.g,p=a.st.paso;
  const it=(x,col)=>{const k=x[0];
   if(k==='t')a.txt(x[1],x[2],x[3],col,x[4]||13,x[5]||'left');
   else if(k==='l')a.line(x[1],x[2],x[3],x[4],col,x[5]||1.5,x[6]);
   else if(k==='a')a.arrow(x[1],x[2],x[3],x[4],col,x[5]);
   else if(k==='c')a.circ(x[1],x[2],x[3],col,!!x[4]);
   else if(k==='r'){g.strokeStyle=col;g.lineWidth=1.8;if(x[5]){g.fillStyle=col;g.globalAlpha=.18;g.fillRect(x[1],x[2],x[3],x[4]);g.globalAlpha=1;}g.strokeRect(x[1],x[2],x[3],x[4]);}
   else if(k==='p'){g.strokeStyle=col;g.lineWidth=x[2]||2;g.beginPath();x[1].forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();}};
  (D.base||[]).forEach(x=>it(x,C.muted));
  D.steps.forEach((s,i)=>{if(i+1>p)return;const cur=(i+1===p);(s.add||[]).forEach(x=>it(x,cur?C.d:C.text));if(cur)(s.now||[]).forEach(x=>it(x,C.d));});
  a.html('<div>'+(p===0?D.q:D.steps[p-1].text)+'</div>');}});
/* ---- fin paso a paso declarativo ---- */

/* ---- paso3 vigaPaso ---- */
SIMS.vigaPaso=el=>SIMS.__paso(el,{"w":660,"h":322,"q":"Calcula reacciones, cortante y flector máximo de la viga con carga puntual. Sube el paso.","base":[["t","Viga biapoyada L = 4 m , carga puntual P = 12 kN a 1 m del apoyo A",30,26,14,"left"],["l",60,110,540,110,3],["a",180,64,180,106,2.5],["t","12 kN",186,74,12,"left"],["t","A",54,132,12,"left"],["t","B",536,132,12,"left"]],"steps":[{"text":"Dibuja los diagramas de cortante V(x) y flector M(x) de la viga. P = 12 kN actúa a a = 1 m de A, L = 4 m.","add":[]},{"text":"<b>Paso 1:</b> equilibrio de momentos respecto de A: R<sub>B</sub>·4 = 12·1 ⇒ <b>R<sub>B</sub> = 3 kN</b>. Fuerzas verticales: R<sub>A</sub> = 12 − 3 = <b>9 kN</b>.","add":[["a",60,160,60,118,2.5],["t","9 kN",66,174,12,"left"],["a",540,160,540,118,2.5],["t","3 kN",546,174,12,"left"]]},{"text":"<b>Paso 2 (cortante):</b> en 0 &lt; x &lt; 1: V = +9 kN. Al pasar por la carga puntual salta −12 kN ⇒ en 1 &lt; x &lt; 4: V = 9 − 12 = <b>−3 kN</b> (y vuelve a 0 en B con R<sub>B</sub> = 3).","add":[["t","V = +9 kN (0<x<1) ;  V = −3 kN (1<x<4)",30,206,15,"left"]]},{"text":"<b>Paso 3 (flector, tramo 1):</b> M(x) = 9x, recta creciente; en x = 1 m: M = 9·1 = <b>9 kN·m</b>.","add":[["t","M(x) = 9x  ⇒  M(1) = 9 kN·m",30,238,15,"left"]]},{"text":"<b>Paso 4 (flector, tramo 2):</b> M(x) = 9x − 12(x−1); en x = 4 sale 36 − 36 = 0 ✓ (extremo simplemente apoyado sin momento).","add":[["t","M(x) = 9x − 12(x−1) ;  M(4) = 0 ✓",30,270,15,"left"]]},{"text":"<b>Resultado:</b> M<sub>máx</sub> = <b>9 kN·m</b> en x = 1 m, justo donde V cambia de signo (dM/dx = V). Con este valor se dimensiona la sección: σ = M<sub>máx</sub>/W.","add":[["t","Mmáx = 9 kN·m en x = 1 m (V cambia de signo)",30,302,15,"left"]]}]});
/* ---- fin paso3 vigaPaso ---- */
document.querySelectorAll('[data-sim]').forEach(el=>{const f=SIMS[el.dataset.sim];if(f)f(el);});
})();
