/* ══ CUSTOM CURSOR ══ */
const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
let lastSparkTime=0,lastSparkX=0,lastSparkY=0;
const sparkThrottle=18,sparkDistance=8;

function createSparkle(x,y){
  const spark=document.createElement('span');
  spark.className='cursor-sparkle';
  spark.style.left=x+'px';
  spark.style.top=y+'px';
  spark.style.setProperty('--sp-size',(4+Math.random()*5).toFixed(2)+'px');
  spark.style.setProperty('--sp-x',((Math.random()-.5)*24).toFixed(2)+'px');
  spark.style.setProperty('--sp-y',(-10-Math.random()*26).toFixed(2)+'px');
  spark.style.setProperty('--sp-dur',(460+Math.random()*280).toFixed(0)+'ms');
  document.body.appendChild(spark);
  setTimeout(()=>spark.remove(),760);
}

document.addEventListener('mousemove',e=>{
  mx=e.clientX;
  my=e.clientY;
  cur.style.left=mx+'px';
  cur.style.top=my+'px';

  const now=performance.now();
  const moved=Math.hypot(mx-lastSparkX,my-lastSparkY)>=sparkDistance;
  if(now-lastSparkTime>=sparkThrottle&&moved){
    createSparkle(mx,my);
    lastSparkTime=now;
    lastSparkX=mx;
    lastSparkY=my;
  }
});
function lerp(a,b,t){return a+(b-a)*t}
function animRing(){rx=lerp(rx,mx,.12);ry=lerp(ry,my,.12);ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing)}
animRing();
document.querySelectorAll('a,button,.proj-card,.cert-card,.ach-card,.skill-card,.stat-box,.sd,.m-close,.chip,.lightbox-close').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
});

const themeToggle=document.getElementById('themeToggle');
const themeStoreKey='portfolio-theme-mode';
const themeModes=['dark','colorful','sunset','ocean','neon'];
const themeClasses=['theme-colorful','theme-sunset','theme-ocean','theme-neon'];
function setTheme(mode){
  const safeMode=themeModes.includes(mode)?mode:'dark';
  document.body.classList.remove(...themeClasses);
  if(safeMode!=='dark')document.body.classList.add(`theme-${safeMode}`);
  if(themeToggle)themeToggle.textContent=`theme: ${safeMode}`;
  localStorage.setItem(themeStoreKey,safeMode);
}
if(themeToggle){
  const saved=localStorage.getItem(themeStoreKey);
  setTheme(saved||'dark');
  themeToggle.addEventListener('click',()=>{
    const active=localStorage.getItem(themeStoreKey)||'dark';
    const idx=themeModes.indexOf(active);
    const next=themeModes[(idx+1)%themeModes.length];
    setTheme(next);
  });
}

document.addEventListener('mousemove',e=>{
  const px=(e.clientX/window.innerWidth-.5)*16;
  const py=(e.clientY/window.innerHeight-.5)*16;
  document.querySelectorAll('.bg-orb').forEach((orb,i)=>{
    const m=(i+1)*.35;
    orb.style.transform=`translate3d(${px*m}px,${py*m}px,0)`;
  });
});

/* ══ NEURAL NET CANVAS ══ */
const canvas=document.getElementById('neural-canvas');
const ctx=canvas.getContext('2d');
let W,H,nodes=[];
function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;initNodes()}
function initNodes(){
  nodes=[];
  const n=Math.min(Math.floor(W*H/12000),80);
  for(let i=0;i<n;i++) nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:1.5+Math.random()*1.5});
}
function drawNet(){
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<nodes.length;i++){
    const a=nodes[i];
    for(let j=i+1;j<nodes.length;j++){
      const b=nodes[j];
      const d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<160){
        const alpha=(1-d/160)*.25;
        ctx.beginPath();ctx.strokeStyle=`rgba(0,200,255,${alpha})`;ctx.lineWidth=.7;
        ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);
    ctx.fillStyle='rgba(0,200,255,.55)';ctx.fill();
    a.x+=a.vx;a.y+=a.vy;
    if(a.x<0||a.x>W)a.vx*=-1;
    if(a.y<0||a.y>H)a.vy*=-1;
  }
  requestAnimationFrame(drawNet);
}
window.addEventListener('resize',resize);resize();drawNet();

/* ══ NAV SCROLL ══ */
window.addEventListener('scroll',()=>{
  document.getElementById('main-nav').classList.toggle('scrolled',window.scrollY>60);
  const h=document.documentElement;
  const p=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100;
  const bar=document.getElementById('scrollProgress');
  if(bar)bar.style.width=Math.min(100,Math.max(0,p))+'%';
});

/* ══ SCROLL DOTS ══ */
const secIds=['hero','skills','experience','projects','certifications','education','contact'];
const sdObs=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){
    document.querySelectorAll('.sd').forEach(d=>d.classList.remove('on'));
    const d=document.querySelector(`[data-s="${e.target.id}"]`);if(d)d.classList.add('on');
  }
}),{threshold:.35});
secIds.forEach(id=>{const el=document.getElementById(id);if(el)sdObs.observe(el)});
function goTo(id){
  const section=document.getElementById(id);
  if(!section)return;
  section.scrollIntoView({behavior:'smooth'});
  section.classList.add('section-pulse');
  setTimeout(()=>section.classList.remove('section-pulse'),850);
}

/* ══ REVEAL ══ */
const rObs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');rObs.unobserve(x.target)}}),{threshold:.1});
document.querySelectorAll('.rev').forEach(el=>rObs.observe(el));

/* ══ SECTION CORNER MOTION (CONNECTED BLOCK) ══ */
document.body.classList.add('section-corner-mode');

const sectionCornerTargets=[];
document.querySelectorAll('section').forEach((section)=>{
  section.classList.add('section-motion');
  section.style.setProperty('--sec-x','52px');
  section.style.setProperty('--sec-y','52px');
  sectionCornerTargets.push(section);
});

const sectionCornerObs=new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
    }else{
      entry.target.classList.remove('in');
    }
  });
},{threshold:.12,rootMargin:'0px 0px -12% 0px'});

sectionCornerTargets.forEach((el)=>sectionCornerObs.observe(el));

/* ══ STAGGER + SECTION SPOTLIGHT ══ */
document.querySelectorAll('section').forEach(sec=>{
  sec.addEventListener('mousemove',e=>{
    const r=sec.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width)*100;
    const y=((e.clientY-r.top)/r.height)*100;
    sec.style.setProperty('--sx',`${x}%`);
    sec.style.setProperty('--sy',`${y}%`);
    sec.classList.add('interactive-section');
  });
  sec.addEventListener('mouseleave',()=>sec.classList.remove('interactive-section'));
});

document.querySelectorAll('.skills-grid .skill-card,.proj-grid .proj-card,.cert-grid .cert-card,.ach-grid .ach-card,.edu-grid .edu-card,.timeline .tl-item,.c-links .c-link').forEach((el,i)=>{
  el.classList.add('lux-card','rev');
  el.style.transitionDelay=`${(i%8)*70}ms`;
  rObs.observe(el);
});

/* ══ EDUCATION SHOWCASE SWITCHER ══ */
const eduNodes=[...document.querySelectorAll('.edu-node')];
const eduPanels=[...document.querySelectorAll('.edu-panel')];

function setEducationPanel(panelId){
  eduNodes.forEach((node)=>{
    const active=node.dataset.eduTarget===panelId;
    node.classList.toggle('active',active);
    node.setAttribute('aria-selected',active?'true':'false');
  });

  eduPanels.forEach((panel)=>{
    const active=panel.dataset.eduPanel===panelId;
    panel.classList.toggle('active',active);
    panel.setAttribute('aria-hidden',active?'false':'true');
  });
}

eduNodes.forEach((node)=>{
  node.addEventListener('click',()=>setEducationPanel(node.dataset.eduTarget));
});

/* ══ TIMELINE CARD INTERACTIVITY ══ */
const timelineItems=document.querySelectorAll('.timeline .tl-item');
timelineItems.forEach((card,idx)=>{
  const bullets=card.querySelector('.tl-bullets');
  if(bullets&&bullets.children.length>0){
    card.addEventListener('click',(e)=>{
      if(!e.target.closest('.tl-cert-btn')){
        card.classList.toggle('expanded');
        card.style.maxHeight=card.classList.contains('expanded')?'none':'auto';
      }
    });
    card.style.cursor='pointer';
  }
  
  card.addEventListener('mousemove',(e)=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width*100;
    const y=(e.clientY-r.top)/r.height*100;
    card.style.setProperty('--mx',x+'%');
    card.style.setProperty('--my',y+'%');
  });
  
  if(idx===0&&bullets){
    card.classList.add('expanded');
  }
});

/* ══ CARD GLOW + TILT ══ */
document.querySelectorAll('.skill-card,.proj-card,.cert-card,.ach-card,.edu-card,.c-link,.tl-item').forEach(card=>{
  if(card.matches('.skill-card,.proj-card')){
    const aura=document.createElement('span');
    aura.className='card-aura';
    card.appendChild(aura);
  }
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width;
    const y=(e.clientY-r.top)/r.height;
    const ry=(x-0.5)*10;
    const rx=(0.5-y)*10;
    card.style.setProperty('--mx',x*100+'%');
    card.style.setProperty('--my',y*100+'%');
    card.style.setProperty('--rx',rx+'deg');
    card.style.setProperty('--ry',ry+'deg');
    card.style.setProperty('--crx',rx+'deg');
    card.style.setProperty('--cry',ry+'deg');

    const aura=card.querySelector('.card-aura');
    if(aura){
      aura.style.left=(x*100)+'%';
      aura.style.top=(y*100)+'%';
      card.classList.add('hover-rich');
    }
    
    if(card.matches('.ach-card')){
      const badge=card.querySelector('.ach-badge');
      if(badge){
        badge.style.setProperty('--badge-x',x);
        badge.style.setProperty('--badge-y',y);
      }
    }
  });
  card.addEventListener('mouseleave',()=>{
    card.style.setProperty('--rx','0deg');
    card.style.setProperty('--ry','0deg');
    card.style.setProperty('--crx','0deg');
    card.style.setProperty('--cry','0deg');
    card.classList.remove('hover-rich');
  });
});

/* ══ PROFILE IMAGE INTERACTION ══ */
const profileWrapper=document.querySelector('.profile-image-wrapper');
if(profileWrapper){
  profileWrapper.addEventListener('mousemove',e=>{
    const r=profileWrapper.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width*100;
    const y=(e.clientY-r.top)/r.height*100;
    profileWrapper.style.setProperty('--profile-mx',x+'%');
    profileWrapper.style.setProperty('--profile-my',y+'%');
  });
  
  profileWrapper.addEventListener('mouseleave',()=>{
    profileWrapper.style.setProperty('--profile-mx','50%');
    profileWrapper.style.setProperty('--profile-my','50%');
  });
}

/* ══ SPARKLINE CANVAS ══ */
const sp=document.getElementById('sparkCanvas');
if(sp){
  const sc=sp.getContext('2d');
  sp.width=sp.offsetWidth*2;sp.height=88;
  const pts=[42,55,51,63,68,72,70,78,81,86,84,92,94];
  const pw=sp.width/(pts.length-1),ph=sp.height;
  const grad=sc.createLinearGradient(0,0,sp.width,0);
  grad.addColorStop(0,'rgba(0,200,255,.8)');grad.addColorStop(1,'rgba(168,85,247,.8)');
  const fillGrad=sc.createLinearGradient(0,0,0,ph);
  fillGrad.addColorStop(0,'rgba(0,200,255,.15)');fillGrad.addColorStop(1,'transparent');
  sc.beginPath();
  pts.forEach((v,i)=>{
    const x=i*pw,y=ph-(v/100*ph*.9)-4;
    i===0?sc.moveTo(x,y):sc.lineTo(x,y);
  });
  sc.strokeStyle=grad;sc.lineWidth=2.5;sc.lineJoin='round';sc.stroke();
  const last=sc.getImagePath;
  sc.lineTo((pts.length-1)*pw,ph);sc.lineTo(0,ph);sc.closePath();sc.fillStyle=fillGrad;sc.fill();
}

/* ══ COUNTERS ══ */
function cnt(id,target,sfx='',dur=1800){
  const el=document.getElementById(id);if(!el)return;
  let v=0;const step=(target/dur)*16;
  const t=setInterval(()=>{v+=step;if(v>=target){el.textContent=target+sfx;clearInterval(t);return}el.textContent=Math.floor(v)+sfx},16);
}
let counted=false;
new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting&&!counted){
    counted=true;
    setTimeout(()=>{cnt('c1',6);cnt('c2',94,'%');cnt('c3',6);cnt('c4',15,'+');cnt('c5',1);cnt('c6',2)},350);
  }
}).observe(document.getElementById('hero'));

/* ══ SKILL BARS ══ */
let barsAnimated=false;
const barObs=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting&&!barsAnimated){
    barsAnimated=true;
    document.querySelectorAll('.sbar-fill').forEach((fill,i)=>{
      setTimeout(()=>{
        const w=fill.dataset.w;
        fill.style.width=w+'%';
        fill.closest('.sbar-item').classList.add('filled');
      },i*100);
    });
  }
},{threshold:.2});
const barSection=document.querySelector('.skill-bars');
if(barSection)barObs.observe(barSection);

/* ══ TYPEWRITER ══ */
const tw=document.getElementById('typewriter');
const phrases=['Data Scientist Enthusiast','ML Engineer Enthusiast','AI Developer Enthusiast','Analytics Engineer Enthusiast','Data Analyst Enthusiast','Deep Learning Enthusiast'];
let pi=0,ci=0,del=false;
function type(){
  const p=phrases[pi];
  if(!del){tw.textContent=p.slice(0,ci+1);ci++;if(ci===p.length){del=true;setTimeout(type,1800);return}}
  else{tw.textContent=p.slice(0,ci-1);ci--;if(ci===0){del=false;pi=(pi+1)%phrases.length}}
  setTimeout(type,del?48:85);
}
setTimeout(type,800);

/* ══ TERMINAL TYPING ══ */
const termEl=document.getElementById('term-typing');
const termCmds=['git status','python train.py --epochs 100','model.evaluate(X_test, y_test)','df.head()'];
let ti=0,tci=0,tdel=false;
function typeT(){
  if(!termEl)return;
  const p=termCmds[ti];
  if(!tdel){termEl.textContent=p.slice(0,tci+1)+'▌';tci++;if(tci===p.length){tdel=true;setTimeout(typeT,1400);return}}
  else{termEl.textContent=p.slice(0,tci-1)+'▌';tci--;if(tci===0){tdel=false;ti=(ti+1)%termCmds.length}}
  setTimeout(typeT,tdel?35:75);
}
setTimeout(typeT,1600);

/* ══ NAV CLICK ══ */
document.querySelectorAll('.nav-links a:not(.nav-dl)').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();const id=a.getAttribute('href').slice(1);
    playFlash();
    goTo(id);
  });
});

const cvFilePath='resume/General CV.pdf';
const cvDrawer=document.getElementById('cvDrawer');
const cvSteps=[...document.querySelectorAll('.cv-step')];
const cvNextStep=document.getElementById('cvNextStep');
const cvBackStep=document.getElementById('cvBackStep');
const cvConfirmDownload=document.getElementById('cvConfirmDownload');

function hasAnyOverlayOpen(){
  const projOpen=document.getElementById('projModal')?.style.display==='block';
  const certOpen=document.getElementById('certModal')?.style.display==='block';
  const lbOpen=document.querySelector('.lightbox')?.classList.contains('open');
  const cvOpen=cvDrawer?.classList.contains('open');
  return Boolean(projOpen||certOpen||lbOpen||cvOpen);
}

function syncBodyScrollState(){
  document.body.style.overflow=hasAnyOverlayOpen()?'hidden':'auto';
}

function setCvStep(stepNumber){
  cvSteps.forEach(step=>step.classList.toggle('active',step.dataset.step===String(stepNumber)));
}

function openCvDrawer(){
  if(!cvDrawer)return;
  setCvStep(1);
  cvDrawer.classList.add('open');
  cvDrawer.setAttribute('aria-hidden','false');
  syncBodyScrollState();
}

function closeCvDrawer(){
  if(!cvDrawer)return;
  cvDrawer.classList.remove('open');
  cvDrawer.setAttribute('aria-hidden','true');
  syncBodyScrollState();
}

document.querySelectorAll('[data-open-cv]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    playFlash();
    openCvDrawer();
  });
});

document.querySelectorAll('[data-close-cv]').forEach(btn=>{
  btn.addEventListener('click',closeCvDrawer);
});

if(cvNextStep)cvNextStep.addEventListener('click',()=>setCvStep(2));
if(cvBackStep)cvBackStep.addEventListener('click',()=>setCvStep(1));
if(cvConfirmDownload){
  cvConfirmDownload.addEventListener('click',()=>{
    const a=document.createElement('a');
    a.href=cvFilePath;
    a.download='General CV.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    closeCvDrawer();
  });
}

function attachMagneticBehavior(selector,limit=8){
  document.querySelectorAll(selector).forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)/r.width;
      const y=(e.clientY-r.top-r.height/2)/r.height;
      el.style.setProperty('--mag-x',`${x*limit}px`);
      el.style.setProperty('--mag-y',`${y*limit}px`);
    });
    el.addEventListener('mouseleave',()=>{
      el.style.setProperty('--mag-x','0px');
      el.style.setProperty('--mag-y','0px');
    });
  });
}
attachMagneticBehavior('.btn,.m-btn,.chip,.c-link',7);

const pageFlash=document.createElement('div');
pageFlash.className='page-flash';
document.body.appendChild(pageFlash);

function playFlash(){
  pageFlash.classList.add('on');
  setTimeout(()=>pageFlash.classList.remove('on'),220);
}

function createRipple(el,x,y){
  if(!el)return;
  const r=el.getBoundingClientRect();
  const ripple=document.createElement('span');
  ripple.className='click-ripple';
  ripple.style.left=(x-r.left)+'px';
  ripple.style.top=(y-r.top)+'px';
  el.appendChild(ripple);
  setTimeout(()=>ripple.remove(),650);
}

function createButtonWave(el,x,y){
  if(!el)return;
  const r=el.getBoundingClientRect();
  const wave=document.createElement('span');
  wave.className='btn-wave';
  wave.style.left=(x-r.left)+'px';
  wave.style.top=(y-r.top)+'px';
  el.appendChild(wave);
  setTimeout(()=>wave.remove(),700);
}

function createBurst(x,y,count=10){
  for(let i=0;i<count;i++){
    const p=document.createElement('span');
    p.className='burst-particle';
    const ang=(Math.PI*2/count)*i + (Math.random()*.45-.22);
    const dist=22+Math.random()*44;
    p.style.left=x+'px';
    p.style.top=y+'px';
    p.style.setProperty('--tx',`${Math.cos(ang)*dist}px`);
    p.style.setProperty('--ty',`${Math.sin(ang)*dist}px`);
    if(i%3===0)p.style.background='var(--pink)';
    if(i%3===1)p.style.background='var(--violet2)';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }
}

document.querySelectorAll('button,.btn,.m-btn,.chip,.c-link,.nav-links a,.theme-toggle,.sd,.m-close,.lightbox-close').forEach(el=>{
  el.addEventListener('mouseenter',()=>el.classList.add('interactive-hover'));
  el.addEventListener('mouseleave',()=>{
    el.classList.remove('interactive-hover');
    el.style.removeProperty('--hx');
    el.style.removeProperty('--hy');
  });
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const nx=((e.clientX-r.left)/r.width-.5)*2;
    const ny=((e.clientY-r.top)/r.height-.5)*2;
    el.style.setProperty('--hx',`${(ny*-6).toFixed(2)}deg`);
    el.style.setProperty('--hy',`${(nx*6).toFixed(2)}deg`);
  });
  el.addEventListener('click',e=>{
    const x=e.clientX||el.getBoundingClientRect().left+el.offsetWidth/2;
    const y=e.clientY||el.getBoundingClientRect().top+el.offsetHeight/2;
    createRipple(el,x,y);
    createButtonWave(el,x,y);
    createBurst(x,y,9);
    el.classList.add('btn-super','btn-clicked');
    setTimeout(()=>el.classList.remove('btn-super','btn-clicked'),420);
  });
});

const projSearch=document.getElementById('projSearch');
const chipWrap=document.getElementById('filterChips');
const projectCards=[...document.querySelectorAll('.proj-grid .proj-card')];
let activeFilter='all';

function projectCategory(text){
  const t=text.toLowerCase();
  if(t.includes('computer vision')||t.includes('cnn'))return 'vision';
  if(t.includes('power bi')||t.includes('dax')||t.includes('dashboard'))return 'bi';
  if(t.includes('analytics')||t.includes('forecasting')||t.includes('analysis'))return 'analytics';
  if(t.includes('ai')||t.includes('ml')||t.includes('machine learning')||t.includes('deep learning')||t.includes('ann'))return 'ai';
  return 'all';
}

projectCards.forEach(card=>{
  const txt=card.innerText.toLowerCase();
  card.dataset.search=txt;
  card.dataset.cat=projectCategory(txt);
});

function applyProjectFilters(){
  const q=(projSearch?.value||'').trim().toLowerCase();
  projectCards.forEach(card=>{
    const matchText=!q||card.dataset.search.includes(q);
    const matchCat=activeFilter==='all'||card.dataset.cat===activeFilter||(activeFilter==='ai'&&card.dataset.cat==='vision');
    card.classList.toggle('hidden',!(matchText&&matchCat));
  });
}

if(projSearch){
  projSearch.addEventListener('input',applyProjectFilters);
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&document.activeElement!==projSearch){
      e.preventDefault();
      projSearch.focus();
    }
    if(e.key==='Escape'&&document.activeElement===projSearch){
      projSearch.blur();
    }
  });
}

if(chipWrap){
  chipWrap.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      activeFilter=chip.dataset.filter||'all';
      chipWrap.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      applyProjectFilters();
    });
  });
}

document.querySelectorAll('.hero-cta .btn[href^="#"],.sd').forEach(el=>{
  el.addEventListener('click',()=>playFlash());
});

/* ══ RECRUITER HOOK SECTION ══ */
const hookPanel=document.getElementById('hookPanel');
const hookConfidence=document.getElementById('hookConfidence');
const hookMeterFill=document.getElementById('hookMeterFill');
const hookRandom=document.getElementById('hookRandom');
const hookButtons=[...document.querySelectorAll('#hookChallenges .hook-chip')];
const hookPriorityButtons=[...document.querySelectorAll('#hookPriority .hook-priority-btn')];
const hookDays=document.getElementById('hookDays');
const hookDaysVal=document.getElementById('hookDaysVal');
let hookPriority='speed';

const hookData={
  agri:{
    title:'Smart Agriculture Rescue Plan',
    sub:'Farmers need early warning before disease spreads and climate fluctuations reduce yield.',
    confidence:94,
    kpis:[['94%','Forecast Fit'],['50K+','Image Samples'],['22','Crop Types']],
    points:[
      'Phase 1: combine soil + weather + image streams to detect risk 2-3 weeks earlier.',
      'Model stack: ANN for crop recommendation and CNN for leaf disease detection.',
      'Business impact: fewer crop failures and better fertilizer allocation decisions.'
    ]
  },
  emission:{
    title:'Urban Fleet Emission Control Plan',
    sub:'Operations team needs lower emissions without hurting delivery speed and profitability.',
    confidence:92,
    kpis:[['92%+','Prediction Fit'],['4','Global Standards'],['30%','Potential Reduction']],
    points:[
      'Phase 1: profile routes, payload, and driving behavior to surface high-emission pockets.',
      'Model stack: ANN-based emissions estimator with compliance rule overlay.',
      'Business impact: prioritizes interventions that reduce CO2 and fuel cost together.'
    ]
  },
  churn:{
    title:'High-Value Churn Defense Plan',
    sub:'Leadership needs to stop profitable customers from leaving before monthly revenue erodes.',
    confidence:90,
    kpis:[['12.44%','Churn Found'],['66.2K','Revenue at Risk'],['3x','Faster Insights']],
    points:[
      'Phase 1: detect early warning signals from usage, support touchpoints, and contract patterns.',
      'Model stack: risk segmentation + BI scoring to rank save-priority accounts.',
      'Business impact: targeted retention actions on the most valuable customer cohorts.'
    ]
  }
};

function computeHookConfidence(base){
  const days=Number(hookDays?.value||30);
  let confidence=base;
  if(hookPriority==='speed')confidence+=days<=30?2:-2;
  if(hookPriority==='accuracy')confidence+=days>=45?3:-1;
  if(hookPriority==='cost')confidence+=days>=35?2:-2;
  return Math.max(78,Math.min(98,confidence));
}

function getPriorityInsight(){
  if(hookPriority==='speed')return 'Execution mode: rapid prototype + deploy-first roadmap.';
  if(hookPriority==='accuracy')return 'Execution mode: validation-heavy pipeline with strict quality gating.';
  return 'Execution mode: lean architecture optimized for ROI and low operating cost.';
}

function renderHook(key){
  if(!hookPanel||!hookConfidence||!hookMeterFill||!hookData[key])return;
  const item=hookData[key];
  const days=Number(hookDays?.value||30);
  const confidence=computeHookConfidence(item.confidence);
  hookButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.hook===key));
  hookPriorityButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.priority===hookPriority));
  if(hookDaysVal)hookDaysVal.textContent=days+' days';
  hookConfidence.textContent=`Confidence: ${confidence}%`;
  hookMeterFill.style.width=confidence+'%';

  const kpis=item.kpis.map(([v,l])=>`<div class="hook-kpi"><strong>${v}</strong><span>${l}</span></div>`).join('');
  const points=[...item.points,`Delivery window set to ${days} days. ${getPriorityInsight()}`].map(p=>`<li>${p}</li>`).join('');
  hookPanel.innerHTML=`
    <h3 class="hook-title">${item.title}</h3>
    <p class="hook-sub">${item.sub}</p>
    <div class="hook-kpis">${kpis}</div>
    <ul class="hook-list">${points}</ul>
  `;
}

hookButtons.forEach(btn=>btn.addEventListener('click',()=>renderHook(btn.dataset.hook)));
hookPriorityButtons.forEach(btn=>btn.addEventListener('click',()=>{
  hookPriority=btn.dataset.priority||'speed';
  const activeKey=hookButtons.find(b=>b.classList.contains('active'))?.dataset.hook||'agri';
  renderHook(activeKey);
}));
if(hookDays)hookDays.addEventListener('input',()=>{
  const activeKey=hookButtons.find(b=>b.classList.contains('active'))?.dataset.hook||'agri';
  renderHook(activeKey);
});

if(hookRandom){
  hookRandom.addEventListener('click',()=>{
    const keys=Object.keys(hookData);
    const key=keys[Math.floor(Math.random()*keys.length)];
    renderHook(key);
  });
}

renderHook('agri');

/* ══ PROJECT DATA ══ */
const PD={
  1:{title:'AgroMind AI — Crop Recommendation & Disease Prediction',sub:'Deep Learning · Computer Vision · ANN + CNN',
    desc:'Implemented dual-model AI system combining ANN crop recommendation with CNN disease detection. Predicts optimal crops across 22 varieties using NPK ratios, climate variables, and soil pH, with real-time interactive dashboards.',
    feats:[{t:'🌾 ANN Crop Recommendation',d:'Predicts optimal crop variety across 22 types using NPK ratios, climate variables and soil pH data.'},{t:'🔬 CNN Disease Detection',d:'Preprocessed 50K+ images with noise reduction, resizing and augmentation — 89% disease detection accuracy.'},{t:'📊 Real-time Dashboard',d:'HTML/CSS/JS interface with live crop analytics, disease diagnostics, and profit dashboards.'},{t:'🧹 Data Pipeline',d:'Comprehensive cleaning removing 15% outliers from 2,200+ crop records.'}],
    tech:['Python','TensorFlow','Scikit-learn','Pandas','NumPy','ANN','CNN','HTML','CSS','JavaScript'],
    images:['images/crop prediction.png','images/crop disease prediction.png','images/crop project interface.png'],
    github:'https://github.com/Ganesh9346/AI-Powered-Smart-Agriculture-Decision-Support-System',live:'#'},
  2:{title:'AI-Driven Vehicle CO₂ Emission Prediction & Optimization',sub:'Predictive Analytics · Environmental AI · ANN',
    desc:'Intelligent emission analysis system estimating vehicle CO₂ output with global compliance checks (EU, US CAFE, BS-VI, China VI). Achieved 92%+ prediction accuracy using ANN architecture.',
    feats:[{t:'📈 CO₂ Prediction',d:'92%+ accuracy predicting CO₂ emissions across different vehicle configurations.'},{t:'🌍 Global Compliance',d:'Validation across 4 international standards: EU, US CAFE, BS-VI, China VI.'},{t:'🔍 Scenario Comparison',d:'Identifies low-emission alternatives and quantifies potential carbon reduction.'},{t:'🖥️ Web Interface',d:'Interactive HTML/CSS/JS dashboard for real-time emission analysis.'}],
    tech:['Python','TensorFlow','Pandas','NumPy','Scikit-learn','HTML','CSS','JavaScript'],
    images:['images/carbon project image1.png','images/carbon image 2.png','images/carbon image 3.png'],
    github:'https://github.com/Ganesh9346/EcoDrive-AI-Intelligent-Carbon-Emission-Forecasting-and-Reduction-System',live:'#'},
  3:{title:'Telecom Churn Analysis Dashboard',sub:'Business Intelligence · Power BI · DAX',
    desc:'Comprehensive Power BI dashboard analyzing customer churn patterns. Identifies high-risk customers, churn drivers, and revenue impact with actionable DAX-powered retention insights.',
    feats:[{t:'📊 Churn Analytics',d:'12.44% churn rate and $66.2K revenue lost identified with detailed segment breakdowns.'},{t:'⚠️ Risk Profiling',d:'Flags high-risk customers based on contract type, service usage, and behaviour patterns.'},{t:'💰 Revenue Impact',d:'Detailed financial analysis helping prioritize retention efforts for maximum ROI.'},{t:'🔍 Driver Analysis',d:'Root cause analysis including competition, service quality, and contract types.'}],
    tech:['Power BI','Power Query','DAX','Data Modeling','Excel','Star Schema'],
    images:['images/Telecom Churn Analysis 1.png','images/TelecomChurn Analysis 2.png','images/TelecomChurn Analysis 3.png','images/TelecomChurn Analysis 4.png'],
    github:'https://github.com/Ganesh9346/Telecom-Churn-Analysis',live:'#'},
  4:{title:'Heart Attack Risk Prediction System',sub:'Healthcare Analytics · Machine Learning',
    desc:'ML project predicting heart attack risk from 20+ patient health indicators. Implements multiple algorithms with comprehensive EDA to identify at-risk individuals for early intervention.',
    feats:[{t:'📊 Health Data Analysis',d:'Analyzes 20+ indicators: cholesterol, blood pressure, diabetes, smoking, lifestyle.'},{t:'🤖 Multi-Algorithm ML',d:'Logistic Regression, Decision Trees, Random Forests, SVM, Gradient Boosting.'},{t:'🔍 EDA & Visualization',d:'Statistical analysis, correlation studies, and visual pattern discovery.'},{t:'📈 Risk Factor ID',d:'Key risk factors and age-related patterns for targeted preventive care.'}],
    tech:['Python','Pandas','NumPy','Matplotlib','Seaborn','Scikit-learn','Jupyter Notebook'],
    images:['images/Heart Attack Risk Prediction 1.png','images/Heart Attack Risk Prediction 2.png'],
    github:'https://github.com/Ganesh9346/Heart-Attack-Risk-Prediction',live:'#'},
  5:{title:'Ecommerce Sales Analysis',sub:'Excel BI · Sales Forecasting · Analytics',
    desc:'End-to-end Excel analysis of ecommerce performance using Power Query, pivot tables, and KPI dashboards to track revenue, customer segments, and forecast demand.',
    feats:[{t:'📈 Sales Trends',d:'Visualizes growth by period, top products, categories, and regions.'},{t:'🧩 Customer Segments',d:'Segments by frequency, order value, loyalty to uncover high-value cohorts.'},{t:'📊 KPI Dashboards',d:'Interactive Excel dashboards with slicers and charts for executive decisions.'},{t:'🔮 Forecasting',d:'Trend-based forecasting and seasonality analysis for inventory planning.'}],
    tech:['Excel','Power Query','Pivot Tables','Charts','KPI Dashboards'],
    images:['images/E Commerce 1.png','images/E Commerce 2.png','images/E Commerce 3.png'],
    github:'https://github.com/Ganesh9346/Ecommerce-Sales-Analysis',live:'#'},
  6:{title:'Food & Beverage Customer Segmentation',sub:'Business Intelligence · Data Analytics · Power BI',
    desc:'Comprehensive data analytics project analyzing customer behavior, preferences, and purchasing patterns in the Food & Beverage industry. Created 4 interactive Power BI dashboards during Infosys Springboard internship.',
    feats:[{t:'🎯 Customer Behavior Analysis',d:'Analyzed customer consumption patterns, preferences, and demographics across segments.'},{t:'💬 Sentiment Analysis',d:'Multi-sentiment analysis understanding customer perception and feedback on products.'},{t:'📊 Product Insights Dashboard',d:'Identified top-performing products, price preferences (₹50-₹99 range), and ingredient preferences.'},{t:'🔍 Customer Segmentation Strategy',d:'Segment customers by age (majority 19-30), purchase behavior, and online engagement for targeted marketing.'}],
    tech:['Power BI','Python','Pandas','NumPy','DAX','Data Modeling','Scikit-learn'],
    images:['images/Food and Beverage Customer Preference Dashboard.png','images/Food and Beverage Customer Segmentation Dashboard.png','images/Food and Beverage KPI Dashboard.png','images/Food and Beverage Sentiment Analysis Dashboard.png'],
    github:'https://github.com/Ganesh9346/Food-Beverage-Customer-Segmentation',live:'#'}
};

window.openProj=function(id){
  const p=PD[id];if(!p)return;
  let imagesHTML='';
  if(p.images && p.images.length>0){
    imagesHTML=`<div class="msec"><h3>Project Gallery</h3><div class="proj-gallery">${p.images.map(img=>`<img src="${img}" alt="Project image" class="proj-img" loading="lazy" onerror="this.style.display='none'">`).join('')}</div></div>`;
  }
  document.getElementById('projContent').innerHTML=`
    <div><h2 class="m-title">${p.title}</h2><p class="m-sub">${p.sub}</p></div>
    <div class="msec"><h3>Overview</h3><p class="m-desc">${p.desc}</p></div>
    ${imagesHTML}
    <div class="msec"><h3>Key Features</h3><div class="m-feats">${p.feats.map(f=>`<div class="m-feat"><h4>${f.t}</h4><p>${f.d}</p></div>`).join('')}</div></div>
    <div class="msec"><h3>Tech Stack</h3><div class="m-tags">${p.tech.map(t=>`<span class="m-tag">${t}</span>`).join('')}</div></div>
    <div class="msec"><h3>Links</h3><div class="m-links"><a href="${p.github}" target="_blank" class="m-btn">⌥ View on GitHub</a>${p.live!=='#'?`<a href="${p.live}" target="_blank" class="m-btn">↗ Live Demo</a>`:''}</div></div>`;
  document.getElementById('projModal').style.display='block';document.body.style.overflow='hidden';
};

window.openCert=function(img,name,org,date){
  document.getElementById('certContent').innerHTML=`
    <div><h2 class="m-title">${name}</h2><p class="m-sub">${org} · ${date}</p></div>
    <img src="${img}" alt="${name}" class="cert-modal-img" loading="lazy"
      onerror="this.outerHTML='<div style=\\'padding:50px;text-align:center;color:var(--muted);font-family:JetBrains Mono,monospace;font-size:13px\\''>⚠ Image not found.<br><br>Place <strong style=\\'color:var(--cyan)\\'>${img}</strong> in the same folder.</div>'">`;
  document.getElementById('certModal').style.display='block';document.body.style.overflow='hidden';
};

function closeAll(){
  document.getElementById('projModal').style.display='none';
  document.getElementById('certModal').style.display='none';
  syncBodyScrollState();
}
document.getElementById('projClose').onclick=closeAll;
document.getElementById('certClose').onclick=closeAll;
document.getElementById('projModal').onclick=e=>{if(e.target===e.currentTarget)closeAll()};
document.getElementById('certModal').onclick=e=>{if(e.target===e.currentTarget)closeAll()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});

const lightbox=document.createElement('div');
lightbox.className='lightbox';
lightbox.innerHTML='<button class="lightbox-close" type="button" aria-label="Close image">&times;</button><img alt="Project preview">';
document.body.appendChild(lightbox);
const lightboxImg=lightbox.querySelector('img');
const lightboxClose=()=>{
  lightbox.classList.remove('open');
  syncBodyScrollState();
};

document.addEventListener('click',e=>{
  const img=e.target.closest('.proj-img');
  if(!img)return;
  lightboxImg.src=img.src;
  lightbox.classList.add('open');
  syncBodyScrollState();
});

lightbox.querySelector('.lightbox-close').addEventListener('click',lightboxClose);
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightboxClose()});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&lightbox.classList.contains('open'))lightboxClose();
  if(e.key==='Escape'&&cvDrawer?.classList.contains('open'))closeCvDrawer();
});

const infoForm=document.getElementById('infoForm');
const infoFormStatus=document.getElementById('infoFormStatus');
if(infoForm){
  infoForm.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(infoForm);
    const name=(fd.get('name')||'').toString().trim();
    const email=(fd.get('email')||'').toString().trim();
    const subject=(fd.get('subject')||'').toString().trim();
    const message=(fd.get('message')||'').toString().trim();

    const mailSubject=encodeURIComponent(`[Portfolio] ${subject}`);
    const body=encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href=`mailto:bandaruganesh876@gmail.com?subject=${mailSubject}&body=${body}`;
    if(infoFormStatus)infoFormStatus.textContent='Mail draft opened. Please click send in your mail app.';
    infoForm.reset();
  });
}
