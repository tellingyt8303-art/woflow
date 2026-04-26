// charts.js — WaFlow Canvas Chart Library (no dependencies)
const C={green:'#00e676',green2:'#69f0ae',greenDim:'#00e67622',blue:'#4d9fff',yellow:'#ffc947',red:'#ff3d57',muted:'#687068',border:'#222822',card:'#141814',text:'#bfc9bf',white:'#edecea'};

function setup(canvas){
  const dpr=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  return{ctx,w:rect.width,h:rect.height};
}

export function drawSparkline(canvas,data,color=C.green){
  if(!canvas||!data?.length)return;
  const{ctx,w,h}=setup(canvas);ctx.clearRect(0,0,w,h);
  const max=Math.max(...data,1),min=Math.min(...data,0),range=max-min||1,pad=4;
  const pts=data.map((v,i)=>({x:pad+(i/(data.length-1))*(w-pad*2),y:h-pad-((v-min)/range)*(h-pad*2)}));
  ctx.beginPath();ctx.moveTo(pts[0].x,h);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(pts[pts.length-1].x,h);ctx.closePath();
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,color+'44');g.addColorStop(1,color+'00');
  ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++){const cx=(pts[i-1].x+pts[i].x)/2;ctx.bezierCurveTo(cx,pts[i-1].y,cx,pts[i].y,pts[i].x,pts[i].y);}
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  const l=pts[pts.length-1];ctx.beginPath();ctx.arc(l.x,l.y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
}

export function drawRing(canvas,value,max=100,color=C.green,label=''){
  if(!canvas)return;
  const{ctx,w,h}=setup(canvas);ctx.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2,r=Math.min(w,h)/2-10,pct=Math.min(value/max,1),start=-Math.PI/2;
  // Track
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=C.border;ctx.lineWidth=10;ctx.stroke();
  // Glow arc
  if(pct>0){
    ctx.beginPath();ctx.arc(cx,cy,r,start,start+pct*Math.PI*2);
    ctx.strokeStyle=color+'30';ctx.lineWidth=18;ctx.lineCap='round';ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r,start,start+pct*Math.PI*2);
    ctx.strokeStyle=color;ctx.lineWidth=10;ctx.lineCap='round';ctx.stroke();
  }
  // Value
  ctx.font=`800 ${Math.floor(w*0.19)}px Syne,sans-serif`;ctx.fillStyle=C.white;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(Math.round(pct*100)+'%',cx,cy-(label?8:0));
  if(label){ctx.font=`500 ${Math.floor(w*0.09)}px DM Sans,sans-serif`;ctx.fillStyle=C.muted;ctx.fillText(label,cx,cy+Math.floor(w*0.13));}
}

export function drawDonut(canvas,segments,centerText=''){
  if(!canvas||!segments?.length)return;
  const{ctx,w,h}=setup(canvas);ctx.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2,r=Math.min(w,h)/2-8;
  let angle=-Math.PI/2;
  const sum=segments.reduce((s,sg)=>s+sg.value,0)||1;
  segments.forEach(sg=>{
    const slice=(sg.value/sum)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+slice);ctx.closePath();
    ctx.fillStyle=sg.color;ctx.fill();
    angle+=slice;
  });
  ctx.beginPath();ctx.arc(cx,cy,r*0.58,0,Math.PI*2);ctx.fillStyle='#0f110f';ctx.fill();
  ctx.font=`800 ${Math.floor(w*0.17)}px Syne,sans-serif`;ctx.fillStyle=C.white;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(centerText||sum,cx,cy-6);
  ctx.font=`400 ${Math.floor(w*0.09)}px DM Sans,sans-serif`;ctx.fillStyle=C.muted;ctx.fillText('leads',cx,cy+Math.floor(w*0.12));
}

export function drawBars(canvas,labels,values,opts={}){
  if(!canvas||!values?.length)return;
  const{ctx,w,h}=setup(canvas);ctx.clearRect(0,0,w,h);
  const{color=C.green,highlightLast=true,showValues=true}=opts;
  const max=Math.max(...values,1),padX=6,padY=22,padB=18,bW=(w-padX*2)/values.length,gap=bW*0.3,bw=bW-gap,cH=h-padY-padB;
  values.forEach((v,i)=>{
    const bh=(v/max)*cH,x=padX+i*bW+gap/2,y=padY+cH-bh,isL=highlightLast&&i===values.length-1,col=isL?color:color+'55';
    ctx.beginPath();
    if(bh>5){ctx.moveTo(x,y+4);ctx.arcTo(x,y,x+4,y,4);ctx.arcTo(x+bw,y,x+bw,y+4,4);ctx.lineTo(x+bw,y+bh);ctx.lineTo(x,y+bh);ctx.closePath();}
    else ctx.rect(x,y,bw,Math.max(bh,2));
    ctx.fillStyle=col;ctx.fill();
    if(isL){ctx.shadowColor=color;ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;}
    if(showValues&&bh>12){ctx.font=`600 9px DM Sans,sans-serif`;ctx.fillStyle=isL?C.white:C.muted;ctx.textAlign='center';ctx.fillText(v,x+bw/2,y-4);}
    if(labels?.[i]){ctx.font=`400 9px DM Sans,sans-serif`;ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.fillText(labels[i],x+bw/2,h-4);}
  });
}

export function drawRevenueBars(canvas,labels,values){
  if(!canvas||!values?.length)return;
  const{ctx,w,h}=setup(canvas);ctx.clearRect(0,0,w,h);
  const max=Math.max(...values,1),padX=8,padY=28,padB=22,bW=(w-padX*2)/values.length,gap=bW*0.28,bw=bW-gap,cH=h-padY-padB;
  const cols=values.map((_,i)=>i===values.length-1?C.green:i===values.length-2?C.green+'99':C.blue+'55');
  values.forEach((v,i)=>{
    const bh=(v/max)*cH,x=padX+i*bW+gap/2,y=padY+cH-bh,isL=i===values.length-1;
    ctx.beginPath();
    if(bh>6){ctx.moveTo(x,y+5);ctx.arcTo(x,y,x+5,y,5);ctx.arcTo(x+bw,y,x+bw,y+5,5);ctx.lineTo(x+bw,y+bh);ctx.lineTo(x,y+bh);ctx.closePath();}
    else ctx.rect(x,y,bw,Math.max(bh,2));
    ctx.fillStyle=cols[i];ctx.fill();
    if(isL){ctx.shadowColor=C.green;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;}
    if(bh>16){ctx.font=`600 9px DM Sans,sans-serif`;ctx.fillStyle=isL?C.white:C.muted;ctx.textAlign='center';ctx.fillText('₹'+(v>=1000?Math.round(v/1000)+'K':v),x+bw/2,y-5);}
    ctx.font=`400 9px DM Sans,sans-serif`;ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.fillText(labels[i],x+bw/2,h-5);
  });
}

export function drawStackedBars(canvas,labels,stacks){
  if(!canvas)return;
  const{ctx,w,h}=setup(canvas);ctx.clearRect(0,0,w,h);
  const totals=labels.map((_,i)=>stacks.reduce((s,st)=>s+(st.values[i]||0),0));
  const max=Math.max(...totals,1),padX=8,padY=12,padB=22,bW=(w-padX*2)/labels.length,gap=bW*0.3,bw=bW-gap,cH=h-padY-padB;
  labels.forEach((lbl,i)=>{
    let yOff=padY+cH;
    stacks.forEach(st=>{
      const v=st.values[i]||0,bh=(v/max)*cH;if(bh<1)return;
      ctx.fillStyle=st.color;ctx.fillRect(padX+i*bW+gap/2,yOff-bh,bw,bh);yOff-=bh;
    });
    ctx.font=`400 9px DM Sans,sans-serif`;ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.fillText(lbl,padX+i*bW+bW/2,h-5);
  });
}
