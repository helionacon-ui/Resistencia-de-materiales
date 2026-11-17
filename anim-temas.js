/* Resistencia de Materiales: una animación por tema */
(function(){var M=window.MANIM;if(!M)return;var U=M.util,C=M.C,nf=U.nf,lerp=U.lerp,ease=U.ease,seg=U.seg,clamp=U.clamp,RG=U.RG,W=640;
function beam(D,x0,x1,y,col){D.rect(x0,y-10,x1-x0,20,col||C.w,RG(col||C.w,.1),2);}
function sup(D,x,y){D.path([[x,y],[x-14,y+22],[x+14,y+22]],C.mut,1.8,RG(C.mut,.2));}

/* T1 círculo de Mohr */
var sx=80,sy=20,txy=30,sc=(sx+sy)/2,Rm=Math.hypot((sx-sy)/2,txy);
M.reg('rm-t2b',M.base({title:'Círculo de Mohr: girar el elemento',H:560,dur:18,caps:[[6,'Estado plano: σₓ = 80 MPa, σᵧ = 20 MPa, τₓᵧ = 30 MPa. Al girar el elemento un ángulo θ cambian las tensiones en sus caras.'],[12,'Cada orientación es un punto del <b>círculo de Mohr</b>: girar θ el elemento equivale a recorrer 2θ en el círculo.'],[99,'Las tensiones principales están en los cortes con el eje σ: <i>σ₁,₂ = 50 ± 42,4 MPa</i>. Ahí la tangencial es nula. La tangencial máxima es el radio.']]},
 function(D,t){var th=lerp(0,Math.PI/2,U.pp(t,18)),c2=Math.cos(2*th),s2=Math.sin(2*th),sxp=sc+(sx-sy)/2*c2+txy*s2,tp=-(sx-sy)/2*s2+txy*c2;
  var ex=140,ey=270,L=60;D.ctx.save();D.ctx.translate(ex,ey);D.ctx.rotate(-th);D.rect(-L/2,-L/2,L,L,C.w,RG(C.f,.15),2);D.arrow(L/2,0,L/2+sxp*0.6,0,C.m,2.4);D.arrow(-L/2,0,-L/2-sxp*0.6,0,C.m,2.4);D.arrow(L/2+6,L/2,L/2+6,L/2-tp*1.2,C.g,2);D.ctx.restore();
  D.text('θ = '+nf(th*180/Math.PI,1)+'°',ex,ey+110,{s:18,a:'center',c:C.m});
  var A=U.axes(D,{xr:[-5,105],yr:[-50,50],xt:[20,50,80],yt:[-30,30],xd:0,yd:0,xl:'σ',yl:'τ'},{x:270,y:120,w:330,h:300,grid:true});
  var p=[];for(var a=0;a<=6.3;a+=0.05)p.push([A.X(sc+Rm*Math.cos(a)),A.Y(Rm*Math.sin(a))]);D.path(p,C.f,2.2);
  D.line(A.X(sc),A.Y(0),A.X(sxp),A.Y(tp),C.m,2);D.dot(A.X(sxp),A.Y(tp),7,C.m);D.dot(A.X(sc+Rm),A.Y(0),5,C.hl);D.dot(A.X(sc-Rm),A.Y(0),5,C.hl);D.text('σ₁',A.X(sc+Rm),A.Y(0)+20,{s:15,a:'center',c:C.hl});D.text('σ₂',A.X(sc-Rm),A.Y(0)+20,{s:15,a:'center',c:C.hl});
  D.text('σ = '+nf(sxp,1)+' MPa    τ = '+nf(tp,1)+' MPa',W/2,500,{it:true,s:21,a:'center',c:C.m});}));

/* T2 Tresca y von Mises */
M.reg('rm-t2',M.base({title:'Criterios de plasticidad: Tresca y von Mises',H:560,dur:18,caps:[[6,'En el plano de tensiones principales (σ₁, σ₂), cada criterio dibuja la frontera del comportamiento elástico: hexágono (Tresca) y elipse (von Mises).'],[12,'Aumentamos la carga siguiendo una dirección fija. Mientras el punto está dentro, el material es elástico.'],[99,'Tresca es más conservador (el hexágono está dentro de la elipse). La máxima diferencia, del 15 %, aparece en cortadura pura.']]},
 function(D,t){var A=U.axes(D,{xr:[-1.4,1.4],yr:[-1.4,1.4],xt:[-1,1],yt:[-1,1],xd:0,yd:0,xl:'σ₁/σ_{y}',yl:'σ₂/σ_{y}'},{x:160,y:96,w:320,h:320,grid:true});
  var hex=[[1,0],[1,1],[0,1],[-1,0],[-1,-1],[0,-1],[1,0]];D.path(hex.map(function(p){return [A.X(p[0]),A.Y(p[1])];}),C.f,2.4);
  var el=[];for(var a=0;a<=6.3;a+=0.03){var u=Math.cos(a),v=Math.sin(a),k=1/Math.sqrt(u*u-u*v+v*v);el.push([A.X(u*k),A.Y(v*k)]);}D.path(el,C.g,2.4);
  var dir=[1,-1].map(function(c){return c/Math.SQRT2;}),k2=ease(seg(t,1,15))*1.3,s1=dir[0]*k2,s2=dir[1]*k2,vm=Math.sqrt(s1*s1-s1*s2+s2*s2),tr=Math.max(Math.abs(s1),Math.abs(s2),Math.abs(s1-s2));
  D.line(A.X(0),A.Y(0),A.X(s1),A.Y(s2),C.m,2);D.dot(A.X(s1),A.Y(s2),7,vm>1?C.bad:(tr>1?C.hl:C.m));
  D.text('Tresca',A.X(0.5),A.Y(1.15),{s:15,c:C.f});D.text('von Mises',A.X(-1.3),A.Y(1.2),{s:15,c:C.g});
  D.text('cortadura pura (σ₂ = −σ₁):  σ_{eq,Tresca} = '+nf(tr,2)+'·σ_{y}    σ_{eq,VM} = '+nf(vm,2)+'·σ_{y}',W/2,470,{it:true,s:18,a:'center',c:C.m});D.text(vm>1?'plastifica según ambos':(tr>1?'plastifica según Tresca, no según von Mises':'elástico'),W/2,504,{s:19,a:'center',c:vm>1?C.bad:(tr>1?C.hl:C.ok),bold:true});}));

/* T3 teorema de Steiner */
M.reg('rm-t3',M.base({title:'Teorema de Steiner',H:540,dur:16,caps:[[5,'Rectángulo de 60 × 20 mm. Respecto a su eje centroidal: <i>I_c = b·h³/12 = 40 000 mm⁴</i>.'],[11,'Al alejar el área una distancia d de un eje paralelo, el momento de inercia crece con el cuadrado de la distancia: <i>I = I_c + A·d²</i>.'],[99,'Por eso las vigas en I concentran el material en las alas, lejos de la fibra neutra: con poca área consiguen un momento de inercia enorme.']]},
 function(D,t){var d=lerp(0,60,U.pp(t,16)),b=60,h=20,A=b*h,Ic=b*h*h*h/12,I=Ic+A*d*d,cx=220,cy=380,s=2.4;D.line(60,cy,400,cy,C.hl,2,[8,5]);D.text('eje',405,cy+5,{s:15,c:C.hl});
  D.rect(cx-b*s/2,cy-d*s-h*s/2,b*s,h*s,C.m,RG(C.m,.3),2);D.line(cx-b*s/2-10,cy-d*s,cx+b*s/2+10,cy-d*s,C.mut,1,[4,4]);if(d>3){D.arrow(cx+b*s/2+30,cy,cx+b*s/2+30,cy-d*s,C.g,2);D.text('d',cx+b*s/2+38,cy-d*s/2,{it:true,s:18,c:C.g});}
  D.text('d = '+nf(d,0)+' mm',520,200,{it:true,s:20,a:'center',c:C.g});D.text('I = I_{c} + A·d²',520,240,{it:true,s:20,a:'center'});D.text('= '+nf(Ic/1e4,1)+'·10⁴ + '+nf(A*d*d/1e4,1)+'·10⁴',520,276,{it:true,s:18,a:'center'});D.text('I = '+nf(I/1e4,1)+'·10⁴ mm⁴',520,316,{it:true,s:22,a:'center',c:C.m,bold:true});}));

/* T4 diagramas de cortante y flector */
M.reg('rm-t4',M.base({title:'Diagramas de esfuerzos: carga que se desplaza',H:560,dur:18,caps:[[6,'Viga biapoyada de 6 m con una carga de 12 kN. Las reacciones dependen de la posición <i>a</i> de la carga.'],[12,'El cortante V es constante a trozos y salta 12 kN bajo la carga. El flector M es lineal a trozos con su máximo bajo la carga.'],[99,'El flector máximo, <i>M = P·a·b/L</i>, es mayor con la carga en el centro (18 kN·m). Además, <i>dM/dx = V</i>: M es máximo donde V cambia de signo.']]},
 function(D,t){var L=6,P=12,a=lerp(0.6,5.4,U.pp(t,18)),b=L-a,RA=P*b/L,RB=P*a/L,X=function(x){return 90+x*76;};
  beam(D,X(0),X(L),130);sup(D,X(0),140);sup(D,X(L),140);D.arrow(X(a),70,X(a),118,C.g,3);D.text('12 kN',X(a),62,{s:14,a:'center',c:C.g});
  var yV=270,sV=5;D.line(X(0),yV,X(L),yV,C.ax,1);D.path([[X(0),yV],[X(0),yV-RA*sV],[X(a),yV-RA*sV],[X(a),yV+RB*sV],[X(L),yV+RB*sV],[X(L),yV]],C.f,2.4,RG(C.f,.2));D.text('V',X(0)-20,yV+5,{it:true,s:18,c:C.f});
  var yM=360,sM=4.5,Mm=RA*a;D.line(X(0),yM,X(L),yM,C.ax,1);D.path([[X(0),yM],[X(a),yM+Mm*sM],[X(L),yM]],C.m,2.4,RG(C.m,.2));D.text('M',X(0)-20,yM+5,{it:true,s:18,c:C.m});D.text(nf(Mm,1)+' kN·m',X(a),yM+Mm*sM+18,{s:14,a:'center',c:C.m});
  D.text('a = '+nf(a,2)+' m    R_{A} = '+nf(RA,2)+' kN    R_{B} = '+nf(RB,2)+' kN    M_{máx} = P·a·b/L = '+nf(Mm,2),W/2,520,{it:true,s:17,a:'center'});}));

/* T5 esfuerzo axil */
M.reg('rm-t5',M.base({title:'Esfuerzo axil: tensión y alargamiento',H:520,dur:16,caps:[[5,'Barra de acero de 2 m y 100 mm² sometida a tracción. La tensión se reparte uniformemente: <i>σ = N/A</i>.'],[11,'Ley de Hooke: <i>ε = σ/E</i>. El alargamiento total es <i>ΔL = N·L/(E·A)</i> (exagerado en el dibujo).'],[99,'Si σ supera el límite elástico (275 MPa) la barra plastifica. El dimensionado exige σ ≤ σ<sub>adm</sub> y, a veces, limitar ΔL.']]},
 function(D,t){var N=lerp(0,30,U.pp(t,16)),A=100,E=210000,sig=N*1000/A,dL=N*1000*2000/(E*A),y=220;D.rect(60,y-80,20,160,C.mut,RG(C.mut,.4),2);
  var Lp=380+dL*60;D.rect(80,y-18,Lp,36,sig>275?C.bad:C.m,RG(sig>275?C.bad:C.m,.25),2);D.arrow(80+Lp,y,80+Lp+20+N*3,y,C.g,3);D.text('N = '+nf(N,1)+' kN',W-20,y-30,{s:16,c:C.g,a:'right'});
  D.text('σ = N/A = '+nf(sig,0)+' MPa',W/2,330,{it:true,s:22,a:'center',c:C.m});D.text('ΔL = NL/(EA) = '+nf(dL,3)+' mm   (ε = '+nf(dL/2000*1e6,0)+'·10⁻⁶)',W/2,366,{it:true,s:20,a:'center'});D.text(sig>275?'¡supera el límite elástico!':'zona elástica',W/2,404,{s:18,a:'center',c:sig>275?C.bad:C.ok,bold:true});}));

/* T6 flexión pura */
M.reg('rm-t6',M.base({title:'Flexión pura: distribución de tensiones normales',H:540,dur:16,caps:[[5,'Un momento flector curva la viga: las fibras de arriba se acortan (compresión) y las de abajo se alargan (tracción).'],[11,'En medio queda la <b>fibra neutra</b>, que no cambia de longitud. La tensión crece linealmente con la distancia a ella: <i>σ = M·y/I</i> (Navier).'],[99,'La tensión máxima está en las fibras extremas: <i>σ<sub>máx</sub> = M/W</i>, con el módulo resistente <i>W = I/y<sub>máx</sub></i>.']]},
 function(D,t){var Mo=lerp(0,1,U.pp(t,16)),x0=70,x1=350,cy=250,h=60,k=Mo*0.0035,p1=[],p2=[],p3=[];
  for(var x=x0;x<=x1;x+=4){var dx=x-(x0+x1)/2,yy=k*dx*dx;p1.push([x,cy-h/2+yy]);p2.push([x,cy+h/2+yy]);p3.push([x,cy+yy]);}D.path(p1.concat(p2.slice().reverse()),C.w,2,RG(C.f,.12));D.path(p3,C.hl,1.6,null,1);
  D.text('fibra neutra',x0+4,cy-6,{s:13,c:C.hl});D.text('compresión',(x0+x1)/2,cy-h/2-14+k*0,{s:13,a:'center',c:C.f});D.text('tracción',(x0+x1)/2,cy+h/2+24,{s:13,a:'center',c:C.g});
  var sx=470,s=70*Mo;D.line(sx,cy-h,sx,cy+h,C.ax,1.4);D.path([[sx,cy-h],[sx-s,cy-h],[sx+s,cy+h],[sx,cy+h]],null,0,RG(C.m,.2));D.line(sx-s,cy-h,sx+s,cy+h,C.m,2.4);D.dot(sx,cy,4,C.hl);
  D.text('σ',sx+s+8,cy+h,{it:true,s:16,c:C.m});D.text('σ = M·y / I',W/2,420,{it:true,s:22,a:'center',c:C.m});D.text('M = '+nf(Mo*20,1)+' kN·m',W/2,456,{it:true,s:18,a:'center'});}));

/* T7 tensión tangencial parabólica */
M.reg('rm-t7',M.base({title:'Flexión simple: tensiones tangenciales',H:520,dur:16,caps:[[5,'Con cortante V aparecen tensiones tangenciales en la sección. En una sección rectangular su reparto es parabólico.'],[11,'Son nulas en las fibras extremas y máximas en la fibra neutra: <i>τ<sub>máx</sub> = 3V/(2A)</i>, un 50 % más que la media.'],[99,'Fórmula de Collignon: <i>τ = V·Q/(I·b)</i>. En perfiles I casi todo el cortante lo resiste el alma.']]},
 function(D,t){var V=lerp(0,1,U.pp(t,16)),cx=220,cy=260,b=80,h=160;D.rect(cx-b/2,cy-h/2,b,h,C.w,RG(C.f,.12),2);D.line(cx-b/2-20,cy,cx+b/2+20,cy,C.hl,1.4,[5,4]);
  var sx=400,p=[[sx,cy-h/2]];for(var y=-h/2;y<=h/2;y+=4){var tau=1.5*V*(1-4*y*y/(h*h));p.push([sx+tau*100,cy+y]);}p.push([sx,cy+h/2]);D.path(p,C.m,2.4,RG(C.m,.22));D.line(sx,cy-h/2-10,sx,cy+h/2+10,C.ax,1.4);
  for(var yy=-h/2+16;yy<h/2;yy+=24){var tt=1.5*V*(1-4*yy*yy/(h*h));D.arrow(sx,cy+yy,sx+tt*100,cy+yy,C.m,1.2);}
  D.text('τ_{máx} = 3V/(2A)',sx+70,cy+6,{s:16,c:C.m});D.text('τ = V·Q/(I·b)',W/2,440,{it:true,s:22,a:'center',c:C.m});}));

/* T8 flexión compuesta: eje neutro */
M.reg('rm-t8',M.base({title:'Flexión compuesta: el eje neutro se desplaza',H:540,dur:18,caps:[[6,'Una compresión N aplicada con excentricidad e equivale a un axil centrado más un momento <i>M = N·e</i>.'],[12,'Las tensiones se suman: <i>σ = −N/A − N·e·y/I</i>. Al crecer e, el eje neutro (σ = 0) entra en la sección.'],[99,'Mientras la carga cae dentro del <b>núcleo central</b> (|e| ≤ h/6 en un rectángulo) toda la sección está comprimida. Fuera, aparecen tracciones.']]},
 function(D,t){var e=lerp(0,0.35,U.pp(t,18)),h=1,cx=200,cy=270,H=200,B=80;D.rect(cx-B/2,cy-H/2,B,H,C.w,RG(C.f,.12),2);D.rect(cx-B/2,cy-H/12*1,B,H/6,null,RG(C.hl,.25));D.text('núcleo',cx+B/2+8,cy+5,{s:13,c:C.hl});
  D.dot(cx,cy-e*H,7,C.g);D.text('N',cx+12,cy-e*H-6,{it:true,s:16,c:C.g});
  var sx=430,sig=function(y){return -1-12*e*y;};D.line(sx,cy-H/2,sx,cy+H/2,C.ax,1.4);var s0=60,top=sig(0.5),bot=sig(-0.5);
  D.path([[sx,cy-H/2],[sx+top*s0*-1*-1,cy-H/2],[sx+bot*s0,cy+H/2],[sx,cy+H/2]],null,0,RG(C.m,.2));D.line(sx+top*s0,cy-H/2,sx+bot*s0,cy+H/2,C.m,2.4);
  var yn=-1/(12*e||1e-9);if(Math.abs(yn)<0.5){var yp=cy-yn*H;D.line(cx-B/2-20,yp,sx+80,yp,C.bad,1.6,[6,4]);D.text('eje neutro',sx+82,yp+5,{s:13,c:C.bad});}
  D.text('e = '+nf(e,3)+'·h    (núcleo: e ≤ h/6 = 0,167·h)',W/2,440,{it:true,s:20,a:'center',c:C.m});D.text(e<=1/6?'toda la sección comprimida':'aparecen tracciones en el lado opuesto',W/2,476,{s:18,a:'center',c:e<=1/6?C.ok:C.bad,bold:true});}));

/* T9 flecha de una ménsula */
M.reg('rm-t9',M.base({title:'Deformaciones: flecha de una ménsula',H:520,dur:16,caps:[[5,'Ménsula empotrada de longitud L con una carga P en el extremo libre.'],[11,'La elástica se obtiene integrando <i>EI·y″ = M(x)</i>: <i>y(x) = P·x²(3L − x)/(6EI)</i>.'],[99,'La flecha máxima, en el extremo, es <i>δ = PL³/(3EI)</i>: duplicar la longitud multiplica la flecha por 8. Se puede obtener también con fuerzas virtuales.']]},
 function(D,t){var P=lerp(0,1,U.pp(t,16)),x0=100,L=400,cy=200,k=P*90;D.rect(70,cy-90,30,180,C.mut,RG(C.mut,.4),2);
  var p=[],p0=[];for(var x=0;x<=L;x+=5){var y=k*Math.pow(x/L,2)*(3-x/L)/2;p.push([x0+x,cy+y]);p0.push([x0+x,cy]);}D.path(p0,C.mut,1.4,null,0.5);D.path(p,C.m,5);
  D.arrow(x0+L,cy+k-60,x0+L,cy+k-6,C.g,3);D.text('P',x0+L+10,cy+k-40,{it:true,s:18,c:C.g});D.line(x0+L+30,cy,x0+L+30,cy+k,C.hl,2);D.text('δ',x0+L+40,cy+k/2,{it:true,s:18,c:C.hl});
  D.text('δ = PL³/(3EI) = '+nf(P*12.5,2)+' mm',W/2,400,{it:true,s:22,a:'center',c:C.m});D.text('y(x) = P·x²·(3L − x)/(6EI)',W/2,436,{it:true,s:19,a:'center'});}));

/* T10 pandeo de Euler */
M.reg('rm-t10',M.base({title:'Dimensionado a pandeo: carga crítica de Euler',H:540,dur:18,caps:[[6,'Un pilar biarticulado se comprime cada vez más. Mientras <i>P &lt; P<sub>cr</sub></i> se mantiene recto.'],[12,'Al alcanzar <i>P<sub>cr</sub> = π²EI/L<sub>p</sub>²</i> se vuelve inestable y se curva bruscamente: es el <b>pandeo</b>, aunque la tensión esté lejos de la de rotura.'],[99,'La carga crítica baja con el cuadrado de la longitud de pandeo. Por eso los pilares esbeltos se dimensionan con la esbeltez λ y no solo con σ = N/A.']]},
 function(D,t){var P=lerp(0,1.3,ease(seg(t,1,15))),cx=200,y0=110,y1=430,amp=P>1?Math.min(60,(P-1)*240):0;
  D.path([[cx,y1],[cx-14,y1+22],[cx+14,y1+22]],C.mut,1.8,RG(C.mut,.2));var p=[];for(var y=y0;y<=y1;y+=4)p.push([cx+amp*Math.sin(Math.PI*(y-y0)/(y1-y0)),y]);D.path(p,P>1?C.bad:C.m,7);
  D.arrow(cx,y0-60,cx,y0-4,C.g,3);D.text('P',cx+10,y0-40,{it:true,s:18,c:C.g});
  var A=U.axes(D,{xr:[0,1.4],yr:[0,1.4],xt:[0.5,1],yt:[0.5,1],xd:1,yd:1,xl:'P/P_{cr}',yl:'flecha'},{x:340,y:150,w:230,h:220,grid:true});D.line(A.X(1),A.Y(0),A.X(1),A.Y(1.4),C.hl,1.4,[5,4]);
  var q=[];for(var s=0;s<=P;s+=0.01)q.push([A.X(s),A.Y(s>1?Math.min(1.35,(s-1)*4):0.0)]);D.path(q,P>1?C.bad:C.m,2.6);
  D.text('P = '+nf(P,2)+'·P_{cr}    '+(P>1?'¡pandeo!':'estable'),W/2,490,{it:true,s:21,a:'center',c:P>1?C.bad:C.ok,bold:true});}));
/* T1 ley de Hooke y coeficiente de Poisson */
M.reg('rm-t1',M.base({title:'Ley de Hooke y coeficiente de Poisson',H:600,dur:18,caps:[[6,'Una barra de acero (A = 100 mm², L = 1 m) se carga a tracción. En la zona elástica la tensión es proporcional a la deformación: <i>σ = E·ε</i>, con E = 200 GPa.'],[12,'Al alargarse, la barra también se estrecha. La deformación transversal es <i>ε<sub>t</sub> = −ν·ε</i>, con ν ≈ 0,3 para el acero.'],[99,'El alargamiento total es <i>ΔL = F·L/(E·A)</i>. En el dibujo las deformaciones están muy exageradas: en realidad son de milésimas.']]},
 function(D,t){var F=lerp(0,20,U.pp(t,18)),s=F*1000/100,e=s/200000,et=-0.3*e,k=150000,L0=300,H0=60,L=L0*(1+e*k/400),Hh=H0*(1+et*k/400),x0=60,cy=170;
  D.rect(x0-20,cy-60,20,120,C.ax,RG(C.ax,.3),1.4);D.rect(x0,cy-H0/2,L0,H0,C.mut,null,1,[4,4]);D.rect(x0,cy-Hh/2,L,Hh,C.m,RG(C.m,.25),2.4);
  if(F>0.2)D.arrow(x0+L+4,cy,x0+L+30+F*2,cy,C.bad,3);D.text('F = '+nf(F,1)+' kN',x0+L+40,cy-12,{s:16,c:C.bad,bold:true});
  var A=U.axes(D,{xr:[0,0.0011],yr:[0,220],xt:[0.0005,0.001],yt:[100,200],xf:function(v){return nf(v*1000,1)+'‰';},yd:0,xl:'ε',yl:'σ (MPa)'},{x:100,y:270,w:420,h:200,grid:true});
  U.plotf(D,A,function(x){return 200000*x;},C.mut,1.2,0.5);D.line(A.X(0),A.Y(0),A.X(e),A.Y(s),C.m,3);D.dot(A.X(e),A.Y(s),6,C.m);D.text('E = 200 GPa',A.X(0.0007),A.Y(170),{s:15,c:C.f});
  U.readout(D,['σ = F/A = '+nf(s,0)+' MPa    ε = σ/E = '+nf(e*1000,3)+' ‰    ε_{t} = '+nf(et*1000,3)+' ‰','ΔL = '+nf(e*1000,3)+' mm'],530);}));
})();
