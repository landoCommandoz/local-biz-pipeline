(function(){

// Background handled by CSS

// ---- FULL-PAGE CALL ICON FIELD (v2 - spatial distribution, organic motion) ----
(function(){
  var field=document.getElementById('callField');
  if(!field)return;
  var section=document.querySelector('.call-section');
  var connSvg=document.getElementById('lsConnectionSvg');
  var W=window.innerWidth,H=window.innerHeight,offX=0,offY=0;

  function fieldResize(){
    if(section){var r=section.getBoundingClientRect();W=r.width;H=r.height;offX=r.left;offY=r.top}
    else{W=window.innerWidth;H=window.innerHeight}
  }
  fieldResize();
  window.addEventListener('resize',fieldResize);
  window.addEventListener('scroll',fieldResize,{passive:true});

  // --- Better SVG icons ---
  // Missed call: phone with X, feels urgent
  var missedSvg='<svg viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 01-3-3l1.72-1.72a1 1 0 00.2-1.1A11.4 11.4 0 019 4a1 1 0 00-1-1H4.5A1.5 1.5 0 003 4.5 17.5 17.5 0 0019.5 21a1.5 1.5 0 001.5-1.5V16a1 1 0 00-1-1 11.4 11.4 0 01-3.49-.61 1 1 0 00-1.1.2z"/><line x1="17" y1="3" x2="22" y2="8"/><line x1="22" y1="3" x2="17" y2="8"/></svg>';
  // Agent: shield with check, feels protective
  var agentSvg='<svg viewBox="0 0 24 24"><path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6z"/><path d="M9 12l2 2 4-4"/></svg>';

  var reds=[];
  var agents=[];
  var beaconX=70,beaconY=0;
  setTimeout(function(){if(section)beaconY=section.offsetHeight/2},200);

  // --- SPATIAL GRID for anti-clustering ---
  var CELL=80; // grid cell size in px
  var grid={};
  function cellKey(x,y){ return Math.floor(x/CELL)+'_'+Math.floor(y/CELL) }
  function isZoneOpen(x,y,minDist){
    // Check no existing uncaught red is within minDist
    for(var i=0;i<reds.length;i++){
      if(reds[i].caught)continue;
      var dx=reds[i].x-x, dy=reds[i].y-y;
      if(dx*dx+dy*dy < minDist*minDist) return false;
    }
    return true;
  }
  function findOpenSpot(edge){
    // Try up to 20 times to find a non-clustered position
    var MIN_DIST=90; // minimum px between red icons
    for(var attempt=0;attempt<20;attempt++){
      var x,y;
      if(edge==='right')     { x=W-30-Math.random()*40; y=60+Math.random()*(H-120) }
      else if(edge==='bottom'){ x=W*0.15+Math.random()*W*0.7; y=H-30-Math.random()*40 }
      else if(edge==='top')   { x=W*0.3+Math.random()*W*0.5; y=30+Math.random()*40 }
      else                    { x=30+Math.random()*40; y=60+Math.random()*(H-120) }
      if(isZoneOpen(x,y,MIN_DIST)) return {x:x,y:y};
    }
    // Fallback: pick any edge spot (won't cluster badly with 20 attempts)
    return {x:W*0.3+Math.random()*W*0.4, y:60+Math.random()*(H-120)};
  }

  // --- Organic drift per red icon ---
  function spawnRed(){
    fieldResize();
    var edges=['right','right','right','bottom','top','left'];
    var edge=edges[Math.floor(Math.random()*edges.length)];
    var spot=findOpenSpot(edge);

    var el=document.createElement('div');
    el.className='call-icon missed';
    el.innerHTML=missedSvg;

    // Randomize animation timings per icon for organic feel
    var pulseDur=(2+Math.random()*2).toFixed(1);
    var wobbleDur=(4+Math.random()*4).toFixed(1);
    var pulseDelay=(Math.random()*2).toFixed(1);
    var wobbleDelay=(Math.random()*3).toFixed(1);
    var ringDur=(2.5+Math.random()*2).toFixed(1);
    var ringDelay=(Math.random()*2).toFixed(1);
    el.style.setProperty('--pulse-dur',pulseDur+'s');
    el.style.setProperty('--wobble-dur',wobbleDur+'s');
    el.style.setProperty('--pulse-delay',pulseDelay+'s');
    el.style.setProperty('--wobble-delay',wobbleDelay+'s');
    el.style.setProperty('--ring-dur',ringDur+'s');
    el.style.setProperty('--ring-delay',ringDelay+'s');

    el.style.left=spot.x+'px';
    el.style.top=spot.y+'px';

    var val=Math.floor(Math.random()*150)+50;
    field.appendChild(el);

    // Each red drifts organically with its own speed/direction
    var driftSpeed=0.08+Math.random()*0.15;
    var driftAngle=Math.random()*Math.PI*2;
    var driftTurnRate=0.003+Math.random()*0.008;

    var obj={
      el:el, x:spot.x, y:spot.y, value:val, caught:false,
      driftSpeed:driftSpeed, driftAngle:driftAngle, driftTurn:driftTurnRate,
      age:0
    };
    reds.push(obj);
    netAmount-=val;updateCounter();
    return obj;
  }

  function spawnAgent(fromX,fromY){
    var el=document.createElement('div');
    el.className='call-icon agent';
    el.innerHTML=agentSvg;
    var sx=(fromX!==undefined)?fromX:beaconX;
    var sy=(fromY!==undefined)?fromY:beaconY;
    el.style.left=sx+'px';
    el.style.top=sy+'px';
    field.appendChild(el);
    // Each agent gets a unique speed multiplier
    var speedMult=0.8+Math.random()*0.5;
    agents.push({el:el,x:sx,y:sy,vx:0,vy:0,target:null,speedMult:speedMult,lockedTarget:null});
  }

  // --- Burst particles on catch ---
  function spawnBurst(x,y){
    var count=8+Math.floor(Math.random()*4);
    for(var i=0;i<count;i++){
      var p=document.createElement('div');
      p.className='ls-burst-particle';
      p.style.left=x+'px';
      p.style.top=y+'px';
      var angle=(Math.PI*2/count)*i + (Math.random()-0.5)*0.5;
      var dist=30+Math.random()*50;
      var dur=300+Math.random()*300;
      field.appendChild(p);
      // Animate via JS for smooth burst
      (function(el,a,d,duration){
        var start=performance.now();
        function tick(now){
          var t=Math.min((now-start)/duration,1);
          var ease=1-Math.pow(1-t,3); // ease-out cubic
          el.style.left=(x+Math.cos(a)*d*ease)+'px';
          el.style.top=(y+Math.sin(a)*d*ease)+'px';
          el.style.opacity=(1-t)*0.8;
          el.style.transform='scale('+(1-t*0.5)+')';
          if(t<1)requestAnimationFrame(tick);
          else el.remove();
        }
        requestAnimationFrame(tick);
      })(p,angle,dist,dur);
    }
  }

  // --- Connection lines ---
  function updateConnections(){
    if(!connSvg)return;
    // Clear old lines
    while(connSvg.firstChild)connSvg.removeChild(connSvg.firstChild);
    for(var i=0;i<agents.length;i++){
      var a=agents[i];
      if(!a.lockedTarget||a.lockedTarget.caught)continue;
      var line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',a.x);
      line.setAttribute('y1',a.y);
      line.setAttribute('x2',a.lockedTarget.x);
      line.setAttribute('y2',a.lockedTarget.y);
      line.setAttribute('class','ls-connection-line');
      connSvg.appendChild(line);
    }
  }

  var sectionVisible=false;
  if(section){
    var visObs=new IntersectionObserver(function(entries){
      sectionVisible=entries[0].isIntersecting;
      if(sectionVisible){fieldResize();beaconY=section.offsetHeight/2}
    },{threshold:0.1});
    visObs.observe(section);
  }

  // Spawn reds at varied intervals
  var redSpawnBase=800;
  var lastRedSpawn=0;
  function maybeSpawnRed(now){
    if(!sectionVisible)return;
    var activeReds=0;
    for(var i=0;i<reds.length;i++){if(!reds[i].caught)activeReds++}
    if(activeReds>=16)return;
    // Vary spawn interval: faster when fewer reds, slower when more
    var interval=redSpawnBase + activeReds*60 + Math.random()*400;
    if(now-lastRedSpawn>interval){
      spawnRed();
      lastRedSpawn=now;
    }
  }

  // Beacon sends agents
  var lastAgentSpawn=0;
  function maybeSpawnAgent(now){
    if(!sectionVisible)return;
    var activeReds=0;
    for(var i=0;i<reds.length;i++){if(!reds[i].caught)activeReds++}
    if(agents.length<7&&activeReds>3&&now-lastAgentSpawn>3000+Math.random()*1500){
      spawnAgent();
      lastAgentSpawn=now;
    }
  }

  // Click to deploy agent
  if(section){section.addEventListener('click',function(e){
    fieldResize();
    spawnAgent(e.clientX-offX,e.clientY-offY);
  })}

  // --- Main loop ---
  function mainLoop(now){
    if(!now)now=performance.now();

    maybeSpawnRed(now);
    maybeSpawnAgent(now);

    // Drift red icons organically
    for(var i=reds.length-1;i>=0;i--){
      var r=reds[i];
      if(r.caught)continue;
      r.age++;
      // Slowly wander: turn the angle, move forward
      r.driftAngle+=Math.sin(r.age*0.01)*r.driftTurn;
      r.x+=Math.cos(r.driftAngle)*r.driftSpeed;
      r.y+=Math.sin(r.driftAngle)*r.driftSpeed;

      // Soft boundary: steer away from edges
      var margin=60;
      if(r.x<margin) r.driftAngle+= 0.04;
      if(r.x>W-margin) r.driftAngle-= 0.04;
      if(r.y<margin) r.driftAngle+= (r.driftAngle>0?0.04:-0.04);
      if(r.y>H-margin) r.driftAngle-= (r.driftAngle>0?0.04:-0.04);

      // Repel from other reds (soft collision)
      for(var j=i+1;j<reds.length;j++){
        if(reds[j].caught)continue;
        var dx=r.x-reds[j].x, dy=r.y-reds[j].y;
        var distSq=dx*dx+dy*dy;
        if(distSq<6400&&distSq>0){ // 80px radius
          var dist=Math.sqrt(distSq);
          var push=0.03*(1-dist/80);
          r.x+=dx/dist*push;
          r.y+=dy/dist*push;
          reds[j].x-=dx/dist*push;
          reds[j].y-=dy/dist*push;
        }
      }

      r.el.style.left=r.x+'px';
      r.el.style.top=r.y+'px';
    }

    // Agent movement - purposeful, fast, with personality
    for(var i=agents.length-1;i>=0;i--){
      var a=agents[i];

      // Find or keep locked target (agents don't switch targets mid-chase)
      if(!a.lockedTarget||a.lockedTarget.caught){
        a.lockedTarget=null;
        var nearest=null,nearDist=Infinity;
        for(var j=0;j<reds.length;j++){
          if(reds[j].caught)continue;
          // Check if another agent already locked this target
          var taken=false;
          for(var k=0;k<agents.length;k++){
            if(k!==i&&agents[k].lockedTarget===reds[j]){taken=true;break}
          }
          if(taken)continue;
          var dx=reds[j].x-a.x,dy=reds[j].y-a.y;
          var d=Math.sqrt(dx*dx+dy*dy);
          if(d<nearDist){nearDist=d;nearest=reds[j]}
        }
        // Fallback: if all taken, pick nearest regardless
        if(!nearest){
          for(var j=0;j<reds.length;j++){
            if(reds[j].caught)continue;
            var dx=reds[j].x-a.x,dy=reds[j].y-a.y;
            var d=Math.sqrt(dx*dx+dy*dy);
            if(d<nearDist){nearDist=d;nearest=reds[j]}
          }
        }
        a.lockedTarget=nearest;
      }

      if(a.lockedTarget){
        var tx=a.lockedTarget.x-a.x,ty=a.lockedTarget.y-a.y;
        var td=Math.sqrt(tx*tx+ty*ty)||1;
        // Accelerate toward target with agent's unique speed
        var accel=0.14*a.speedMult;
        a.vx+=(tx/td)*accel;
        a.vy+=(ty/td)*accel;

        // Catch!
        if(td<35){
          a.lockedTarget.caught=true;
          a.lockedTarget.el.className='call-icon caught';
          var cx=a.lockedTarget.x, cy=a.lockedTarget.y;
          spawnBurst(cx,cy);
          setTimeout(function(el){el.remove()}.bind(null,a.lockedTarget.el),700);
          netAmount+=a.lockedTarget.value*3;updateCounter();
          a.lockedTarget=null;
        }
      }else{
        // No targets: orbit gently near beacon
        var bx=beaconX-a.x, by=beaconY-a.y;
        var bd=Math.sqrt(bx*bx+by*by)||1;
        if(bd>120){
          a.vx+=(bx/bd)*0.04;
          a.vy+=(by/bd)*0.04;
        }
        // Add slight perpendicular drift for orbiting
        a.vx+=(-by/bd)*0.02;
        a.vy+=(bx/bd)*0.02;
        a.vx*=0.96;a.vy*=0.96;
      }

      // Speed limit (faster than before, agents should feel quick)
      var spd=Math.sqrt(a.vx*a.vx+a.vy*a.vy);
      var maxSpd=4*a.speedMult;
      if(spd>maxSpd){a.vx*=maxSpd/spd;a.vy*=maxSpd/spd}
      a.vx*=0.985;a.vy*=0.985;

      a.x+=a.vx;a.y+=a.vy;
      a.el.style.left=a.x+'px';
      a.el.style.top=a.y+'px';

      // Remove if way off screen
      if(a.x<-120||a.x>W+120||a.y<-120||a.y>H+120){
        a.el.remove();agents.splice(i,1);
      }
    }

    // Clean up
    for(var i=reds.length-1;i>=0;i--){
      if(reds[i].caught&&!reds[i].el.parentNode){reds.splice(i,1)}
    }

    updateConnections();
    requestAnimationFrame(mainLoop);
  }
  mainLoop();
})();

// ---- SCROLL REVEALS ----
var rObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('v');rObs.unobserve(e.target)}});
},{threshold:0.08,rootMargin:'0px 0px -20px 0px'});
document.querySelectorAll('.r,.r-wipe,.r-scale').forEach(function(el){rObs.observe(el)});

// ---- NAV HIDE/SHOW ----
var nav=document.getElementById('nav'),lastY=0;
window.addEventListener('scroll',function(){var y=window.scrollY;
if(y>100&&y>lastY)nav.classList.add('hide');else nav.classList.remove('hide');lastY=y},{passive:true});

// ---- MOBILE BAR ----
var mobBar=document.getElementById('mobBar'),heroEl=document.querySelector('.hero');
if(mobBar&&heroEl){var mObs=new IntersectionObserver(function(entries){
entries.forEach(function(e){if(e.isIntersecting)mobBar.classList.remove('show');else mobBar.classList.add('show')});
},{threshold:0.1});mObs.observe(heroEl)}

// ---- HERO COUNTER + CALL FEED SYSTEM ----
var lostEl=document.getElementById('lostCounter');
var heroCounter=document.getElementById('heroCounter');
var counterLabelEl=document.getElementById('counterLabel');
var netAmount=0;
var systemActive=false;
// Counter is driven by red spawns (subtract) and green catches (add) in the bubble system
// No separate timer needed

function updateCounter(){
  if(netAmount<=0){
    heroCounter.className='hero-counter losing';
    lostEl.textContent='-$'+Math.abs(netAmount).toLocaleString();
    counterLabelEl.textContent='Lost while you\'ve been here';
  }else{
    heroCounter.className='hero-counter earning';
    lostEl.textContent='+$'+netAmount.toLocaleString();
    counterLabelEl.textContent='Revenue captured by Brewington';
  }
}



// ---- HERO CMD LIVE SYSTEM ----
var cmdCalls=document.getElementById('cmdCalls');
var cmdLog=document.getElementById('cmdLog');
var cmdCount=47;
var logMsgs=['Call answered','Text sent','Booking confirmed','Follow-up scheduled',
'Lead captured','Review requested','Appointment set','Customer connected'];
var logNames=['Sarah T.','Mike R.','John M.','Lisa K.','David W.','Amy L.','Carlos P.','Jen H.'];

if(cmdCalls){
  cmdCalls.textContent=cmdCount;
  setInterval(function(){cmdCount+=1;cmdCalls.textContent=cmdCount},4000);
}
if(cmdLog){
  function addLogEntry(){
    var now=new Date();
    var h=now.getHours()%12||12;var m=now.getMinutes();
    var time=h+':'+(m<10?'0':'')+m+(now.getHours()<12?' AM':' PM');
    var msg=logMsgs[Math.floor(Math.random()*logMsgs.length)];
    var name=logNames[Math.floor(Math.random()*logNames.length)];
    var el=document.createElement('div');el.className='hero-cmd-log-item';
    el.innerHTML='<span class="hero-cmd-log-time">'+time+'</span><span class="hero-cmd-log-dot"></span>'+msg+' <span style="color:rgba(255,255,255,0.1)">|</span> '+name;
    cmdLog.appendChild(el);
    if(cmdLog.children.length>5)cmdLog.removeChild(cmdLog.firstChild);
  }
  addLogEntry();addLogEntry();addLogEntry();
  setInterval(addLogEntry,3500);
}

// ---- ANIMATED COUNTERS ----
var counted=false;
var proofObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting&&!counted){counted=true;
    document.querySelectorAll('.proof-num[data-count]').forEach(function(el){
      var target=parseInt(el.getAttribute('data-count'));
      var prefix=el.getAttribute('data-prefix')||'';
      var suffix=el.getAttribute('data-suffix')||'';
      var current=0;var step=Math.max(1,Math.floor(target/30));
      var iv=setInterval(function(){current+=step;if(current>=target){current=target;clearInterval(iv)}
      el.textContent=prefix+current+suffix},30);
    });
  }});
},{threshold:0.5});
proofObs.observe(document.querySelector('.proof'));

// ---- 3D PHONE TILT ----
var phone=document.getElementById('phone3d'),phoneWrap=document.getElementById('phoneWrap');
if(phone&&!window.matchMedia('(pointer:coarse)').matches){
  phoneWrap.addEventListener('mousemove',function(e){
    var rect=phoneWrap.getBoundingClientRect();
    var x=(e.clientX-rect.left)/rect.width-0.5;
    var y=(e.clientY-rect.top)/rect.height-0.5;
    phone.style.transform='rotateY('+x*12+'deg) rotateX('+(-y*8)+'deg)';
  });
  phoneWrap.addEventListener('mouseleave',function(){phone.style.transform='rotateY(0) rotateX(0)'});
}

// ---- PHONE SIMULATOR (ALIVE REBUILD) ----
(function(){
  var curStep=0,stepDur=5500,steps=document.querySelectorAll('.sim-step'),
  scenes=document.querySelectorAll('.ph-scene'),simTimer,barTimer,simOn=false,
  sceneTimeouts=[],phoneEl=document.getElementById('phone3d');

  // Phone glow classes per scene
  var glowMap=['glow-call','glow-text','glow-cal','glow-rev','glow-dash'];
  var tiltMap=['tilt-right','tilt-left','tilt-up','tilt-down','tilt-right'];

  function clearSceneTimeouts(){
    for(var i=0;i<sceneTimeouts.length;i++) clearTimeout(sceneTimeouts[i]);
    sceneTimeouts=[];
  }
  function st(fn,ms){var t=setTimeout(fn,ms);sceneTimeouts.push(t);return t}

  // Reset all animated elements to hidden state
  function resetScene(idx){
    if(idx===0){
      var cs=document.getElementById('callStatus');if(cs)cs.classList.remove('show');
      var cb=document.getElementById('callBtn');if(cb)cb.classList.remove('ringing');
      var ct=document.getElementById('callTimer');if(ct){ct.classList.remove('show');ct.textContent='0:00'}
    }
    if(idx===1){
      ['typ1','typ2','typ3','typ4'].forEach(function(id){
        var el=document.getElementById(id);if(el){el.classList.remove('show');el.classList.remove('hide')}
      });
      ['tb1','tb2','tb3','tb4'].forEach(function(id){
        var el=document.getElementById(id);if(el)el.classList.remove('show')
      });
    }
    if(idx===2){
      ['cs1','cs2','cs3','cs4'].forEach(function(id){
        var el=document.getElementById(id);if(el)el.classList.remove('show')
      });
      var badge=document.getElementById('calBadge');if(badge)badge.classList.remove('show');
    }
    if(idx===3){
      document.querySelectorAll('#revStars .rev-star').forEach(function(s){
        s.classList.remove('lit');s.classList.remove('popping')
      });
      var rc=document.getElementById('rc1');if(rc)rc.classList.remove('show');
      var rt=document.getElementById('revText');if(rt){rt.textContent='';rt.innerHTML=''}
    }
    if(idx===4){
      ['ds1','ds2','ds3','ds4'].forEach(function(id){
        var el=document.getElementById(id);if(el)el.classList.remove('show');
        var val=el?el.querySelector('.d-val'):null;if(val)val.textContent='0'
      });
      var ch=document.getElementById('dashChart');if(ch)ch.classList.remove('show');
      var brs=document.getElementById('dashBars');
      if(brs){var bars=brs.children;for(var i=0;i<bars.length;i++)bars[i].style.height='0'}
    }
  }

  function actStep(idx,direction){
    clearSceneTimeouts();
    var prevStep=curStep;
    curStep=idx;
    var goingForward=direction!=='back';

    // Update step indicators
    steps.forEach(function(s,i){
      s.classList.remove('active');
      s.querySelector('.ss-bar').style.width='0';
      if(i<idx)s.classList.add('done');else s.classList.remove('done')
    });
    steps[idx].classList.add('active');

    // Swipe transition: exit old scene, enter new
    scenes.forEach(function(s,i){
      if(s.classList.contains('active')&&i!==idx){
        s.classList.remove('active');
        s.classList.add(goingForward?'exiting-left':'exiting-right');
        setTimeout(function(){
          s.classList.remove('exiting-left','exiting-right');
        },550);
      }
    });

    // Small delay so exit starts before enter
    var enterScene=scenes[idx];
    resetScene(idx);
    enterScene.classList.remove('active','exiting-left','exiting-right','entering-left','entering-right');
    enterScene.classList.add(goingForward?'entering-right':'entering-left');

    // Force reflow then activate
    void enterScene.offsetWidth;
    requestAnimationFrame(function(){
      enterScene.classList.remove('entering-right','entering-left');
      enterScene.classList.add('active');
    });

    // Phone body effects: glow + tilt
    if(phoneEl){
      glowMap.forEach(function(c){phoneEl.classList.remove(c)});
      tiltMap.forEach(function(c){phoneEl.classList.remove(c)});
      phoneEl.classList.add(glowMap[idx]);
      phoneEl.classList.add(tiltMap[idx]);
      st(function(){phoneEl.classList.remove(tiltMap[idx])},600);
    }

    // Progress bar
    var bar=steps[idx].querySelector('.ss-bar'),start=Date.now();
    clearInterval(barTimer);
    barTimer=setInterval(function(){
      var p=Math.min((Date.now()-start)/stepDur*100,100);
      bar.style.width=p+'%';
      if(p>=100)clearInterval(barTimer);
    },30);

    // Animate the scene content
    animScene(idx);
  }

  // ---- SCENE ANIMATIONS ----
  function animScene(idx){
    // Scene 0: Call - button rings, status appears, timer counts
    if(idx===0){
      var btn=document.getElementById('callBtn');
      var status=document.getElementById('callStatus');
      var timer=document.getElementById('callTimer');
      st(function(){if(btn)btn.classList.add('ringing')},300);
      st(function(){if(status)status.classList.add('show')},800);
      st(function(){
        if(timer){
          timer.classList.add('show');
          var sec=0;
          var iv=setInterval(function(){
            sec++;
            var m=Math.floor(sec/60);
            var s=sec%60;
            timer.textContent=m+':'+(s<10?'0':'')+s;
          },1000);
          sceneTimeouts.push(iv);
        }
      },1600);
    }

    // Scene 1: Texts - typing indicators appear before each bubble
    if(idx===1){
      var sequence=[
        // Show typing indicator for outgoing
        {type:'typ',id:'typ1',delay:200},
        // Hide typing, show bubble
        {type:'bubble',id:'tb1',typId:'typ1',delay:1000},
        // Typing indicator for incoming
        {type:'typ',id:'typ2',delay:1800},
        {type:'bubble',id:'tb2',typId:'typ2',delay:2800},
        {type:'typ',id:'typ3',delay:3400},
        {type:'bubble',id:'tb3',typId:'typ3',delay:4200},
        {type:'typ',id:'typ4',delay:4600},
        {type:'bubble',id:'tb4',typId:'typ4',delay:5200}
      ];
      sequence.forEach(function(item){
        st(function(){
          if(item.type==='typ'){
            var el=document.getElementById(item.id);
            if(el){el.classList.remove('hide');el.classList.add('show')}
          }else{
            // Hide typing indicator, show bubble
            var typ=document.getElementById(item.typId);
            if(typ){typ.classList.remove('show');typ.classList.add('hide')}
            var bub=document.getElementById(item.id);
            if(bub)bub.classList.add('show');
          }
        },item.delay);
      });
    }

    // Scene 2: Calendar slots slide in one by one, booked slot slams
    if(idx===2){
      ['cs1','cs2','cs3','cs4'].forEach(function(id,i){
        st(function(){
          var el=document.getElementById(id);
          if(el)el.classList.add('show');
        },300+i*400);
      });
      // Badge pops in after the booked slot
      st(function(){
        var badge=document.getElementById('calBadge');
        if(badge)badge.classList.add('show');
      },1800);
    }

    // Scene 3: Stars fill one by one with pop, then review types in
    if(idx===3){
      var stars=document.querySelectorAll('#revStars .rev-star');
      stars.forEach(function(s,i){
        st(function(){
          s.classList.add('popping');
          s.classList.add('lit');
        },400+i*280);
      });
      // Review card slides in
      var rc=document.getElementById('rc1');
      st(function(){if(rc)rc.classList.add('show')},2000);
      // Typewriter effect for review text
      var reviewStr="Called and got a text back in seconds. Tech was here the same day. Best HVAC experience I've ever had.";
      var revText=document.getElementById('revText');
      if(revText){
        st(function(){
          var charIdx=0;
          revText.innerHTML='<span class="cursor"></span>';
          var typeIv=setInterval(function(){
            if(charIdx>=reviewStr.length){
              clearInterval(typeIv);
              // Remove cursor after a beat
              st(function(){
                var cur=revText.querySelector('.cursor');
                if(cur)cur.remove();
              },800);
              return;
            }
            revText.textContent=reviewStr.substring(0,charIdx+1);
            revText.innerHTML=reviewStr.substring(0,charIdx+1)+'<span class="cursor"></span>';
            charIdx++;
          },28);
          sceneTimeouts.push(typeIv);
        },2300);
      }
    }

    // Scene 4: Stats count up, bars grow
    if(idx===4){
      ['ds1','ds2','ds3','ds4'].forEach(function(id,i){
        st(function(){
          var el=document.getElementById(id);
          if(el)el.classList.add('show');
          // Count up animation
          var valEl=el?el.querySelector('.d-val'):null;
          if(valEl){
            var target=parseFloat(valEl.getAttribute('data-target'));
            var isDecimal=valEl.getAttribute('data-decimal')==='true';
            var current=0;
            var steps2=40;
            var step=target/steps2;
            var count=0;
            var countIv=setInterval(function(){
              count++;
              current+=step;
              if(count>=steps2){current=target;clearInterval(countIv)}
              valEl.textContent=isDecimal?current.toFixed(1):Math.round(current).toString();
            },30);
            sceneTimeouts.push(countIv);
          }
        },200+i*250);
      });
      // Chart
      var ch=document.getElementById('dashChart');
      st(function(){if(ch)ch.classList.add('show')},1200);
      var brs=document.getElementById('dashBars');
      if(brs&&!brs.children.length){
        for(var b=0;b<12;b++){var d=document.createElement('div');d.className='d-bar';d.style.height='0';brs.appendChild(d)}
      }
      if(brs){
        var bars=brs.children;
        var hts=[30,35,28,42,50,45,55,62,58,70,75,82];
        st(function(){
          for(var i=0;i<bars.length;i++){
            (function(el,h,dl){st(function(){el.style.height=h+'%'},dl)})(bars[i],hts[i],i*80);
          }
        },1400);
      }
    }
  }

  function nextStep(){actStep((curStep+1)%5,'forward')}

  function startSim(){
    if(simOn)return;simOn=true;
    actStep(0,'forward');
    simTimer=setInterval(nextStep,stepDur);
  }

  // Click handler for steps
  steps.forEach(function(s,i){
    s.addEventListener('click',function(){
      var dir=i>curStep?'forward':'back';
      clearInterval(simTimer);
      actStep(i,dir);
      simTimer=setInterval(nextStep,stepDur);
    });
  });

  // Start when section scrolls into view
  var simSec=document.querySelector('.sim');
  if(simSec){
    var sObs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){startSim();sObs.unobserve(simSec)}
      });
    },{threshold:0.15});
    sObs.observe(simSec);
  }
})()


// ---- ROI CALCULATOR (ENHANCED) ----
var roiSlider=document.getElementById('roiSlider'),roiCurrent=document.getElementById('roiCurrent'),
roiJobSlider=document.getElementById('roiJobSlider'),roiJobCurrent=document.getElementById('roiJobCurrent'),
roiLost=document.getElementById('roiLost'),roiLossSmall=document.getElementById('roiLossSmall'),
roiAnnual=document.getElementById('roiAnnual'),roiPayback=document.getElementById('roiPayback');
function calcROI(){
  var calls=parseInt(roiSlider.value);
  var jobVal=parseInt(roiJobSlider.value);
  roiCurrent.textContent=calls+' call'+(calls!==1?'s':'');
  roiJobCurrent.textContent='$'+jobVal.toLocaleString();
  roiSlider.setAttribute('aria-valuetext',calls+' calls per week');
  roiJobSlider.setAttribute('aria-valuetext','$'+jobVal.toLocaleString()+' per job');
  var monthly=calls*jobVal*4;
  var annual=monthly*12;
  var multiplier=Math.floor(monthly/297);
  roiLost.textContent='$'+monthly.toLocaleString();
  roiLossSmall.textContent='$'+monthly.toLocaleString();
  roiAnnual.textContent='$'+annual.toLocaleString();
  roiPayback.textContent='Brewington pays for itself '+multiplier+'x over every month';
}
roiSlider.addEventListener('input',calcROI);
roiJobSlider.addEventListener('input',calcROI);
calcROI();

// ---- FAQ ----
document.querySelectorAll('.faq-q').forEach(function(btn){
  btn.addEventListener('click',function(){var item=btn.parentElement;var open=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(el){el.classList.remove('open');
  el.querySelector('.faq-q').setAttribute('aria-expanded','false')});
  if(!open){item.classList.add('open');btn.setAttribute('aria-expanded','true')}})});

// ---- PRELOADER ----
window.addEventListener('load',function(){
  var pl=document.getElementById('preloader');
  if(pl){pl.classList.add('loaded');setTimeout(function(){pl.style.display='none'},700)}
});

// ---- SCROLL PROGRESS ----
var spBar=document.getElementById('scrollProgress');
window.addEventListener('scroll',function(){
  var h=document.documentElement.scrollHeight-window.innerHeight;
  if(h>0)spBar.style.width=(window.scrollY/h*100)+'%';
},{passive:true});

// ---- CURSOR GLOW ----
var isDesktop=!window.matchMedia('(pointer:coarse)').matches;
if(isDesktop){
  var glow=document.getElementById('cursorGlow');
  if(glow){glow.style.display='block';var gx=0,gy=0,cx=0,cy=0;
  document.addEventListener('mousemove',function(e){gx=e.clientX;gy=e.clientY});
  (function glowLoop(){cx+=(gx-cx)*0.12;cy+=(gy-cy)*0.12;
  glow.style.left=cx+'px';glow.style.top=cy+'px';requestAnimationFrame(glowLoop)})()}
}

// ---- AURORA BACKGROUND (disabled - bubbles replace it) ----
(function(){
  var ac=document.getElementById('auroraCanvas');
  if(!ac||ac.style.display==='none')return;
  var actx=ac.getContext('2d');
  var w,h;
  function setSize(){w=ac.width=window.innerWidth;h=ac.height=window.innerHeight}
  setSize();window.addEventListener('resize',setSize);

  // Mesh control points
  var pts=[
    {hue:165,sat:80,light:18,speed:0.7,phase:0},
    {hue:185,sat:70,light:14,speed:0.5,phase:1.2},
    {hue:155,sat:85,light:16,speed:0.9,phase:2.5},
    {hue:280,sat:40,light:12,speed:0.6,phase:3.8},
    {hue:200,sat:65,light:15,speed:0.8,phase:5.0},
    {hue:145,sat:75,light:17,speed:1.0,phase:0.7}
  ];

  var t=0,amx=w/2,amy=h/2,scrollPct=0;
  document.addEventListener('mousemove',function(e){amx=e.clientX;amy=e.clientY});
  window.addEventListener('scroll',function(){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    scrollPct=max>0?window.scrollY/max:0;
  },{passive:true});

  function drawAurora(){
    t+=0.0015;
    // Scroll shifts the overall hue palette - top is cool, bottom is warm
    var scrollHueShift=scrollPct*40;

    var anchors=[];
    for(var i=0;i<pts.length;i++){
      var p=pts[i];
      var ax=(0.1+0.8*((i%3)/2))+Math.sin(t*p.speed+p.phase)*0.2;
      var ay=(0.15+0.7*(Math.floor(i/3)/1.5))+Math.cos(t*p.speed*0.7+p.phase)*0.18;
      var mx2=amx/w,my2=amy/h;
      ax+=(mx2-ax)*0.04;
      ay+=(my2-ay)*0.04;
      anchors.push({
        x:ax*w,y:ay*h,
        hue:p.hue+Math.sin(t*0.3+i)*30+scrollHueShift,
        sat:p.sat+scrollPct*5,
        light:p.light+Math.sin(t*0.5+i*1.3)*4+scrollPct*3
      });
    }

    // Draw full-screen gradient mesh using overlapping large radials
    // First: dark base
    actx.fillStyle='#050507';
    actx.fillRect(0,0,w,h);

    // Layer: large soft washes
    actx.globalCompositeOperation='screen';
    for(var i=0;i<anchors.length;i++){
      var a=anchors[i];
      var radius=Math.max(w,h)*0.7;
      var grad=actx.createRadialGradient(a.x,a.y,0,a.x,a.y,radius);
      grad.addColorStop(0,'hsla('+a.hue+','+a.sat+'%,'+a.light+'%,1)');
      grad.addColorStop(0.3,'hsla('+a.hue+','+(a.sat-10)+'%,'+(a.light*0.7)+'%,0.6)');
      grad.addColorStop(0.6,'hsla('+a.hue+','+(a.sat-20)+'%,'+(a.light*0.4)+'%,0.2)');
      grad.addColorStop(1,'hsla('+a.hue+',20%,3%,0)');
      actx.fillStyle=grad;
      actx.fillRect(0,0,w,h);
    }

    // Layer: brighter concentrated spots for depth
    for(var i=0;i<anchors.length;i++){
      var a=anchors[i];
      var radius2=Math.max(w,h)*0.3;
      var grad2=actx.createRadialGradient(a.x,a.y,0,a.x,a.y,radius2);
      grad2.addColorStop(0,'hsla('+a.hue+','+Math.min(a.sat+10,100)+'%,'+(a.light+8)+'%,0.5)');
      grad2.addColorStop(0.5,'hsla('+a.hue+','+a.sat+'%,'+a.light+'%,0.1)');
      grad2.addColorStop(1,'hsla('+a.hue+',20%,5%,0)');
      actx.fillStyle=grad2;
      actx.fillRect(0,0,w,h);
    }

    actx.globalCompositeOperation='source-over';
    requestAnimationFrame(drawAurora);
  }
  drawAurora();
})();

// ---- FLOATING PARTICLES (page-wide, mouse-reactive) ----
(function(){
  var fc=document.getElementById('floatParticles');
  if(!fc)return;
  var fctx=fc.getContext('2d');
  function fResize(){fc.width=window.innerWidth;fc.height=window.innerHeight}
  fResize();window.addEventListener('resize',fResize);

  var pts=[],pmx=fc.width/2,pmy=fc.height/2;
  for(var i=0;i<40;i++){
    pts.push({
      x:Math.random()*fc.width,y:Math.random()*fc.height,
      vx:(Math.random()-0.5)*0.4,vy:-Math.random()*0.3-0.1,
      r:Math.random()*2+0.5,
      o:Math.random()*0.4+0.1,
      hue:150+Math.random()*60
    });
  }
  document.addEventListener('mousemove',function(e){pmx=e.clientX;pmy=e.clientY});

  function drawFloat(){
    fctx.clearRect(0,0,fc.width,fc.height);
    for(var i=0;i<pts.length;i++){
      var p=pts[i];
      // Mouse repulsion
      var dx=p.x-pmx,dy=p.y-pmy;
      var dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<200&&dist>0){
        var force=(200-dist)/200*0.5;
        p.vx+=dx/dist*force;
        p.vy+=dy/dist*force;
      }
      p.vx*=0.98;p.vy*=0.98;
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=fc.width;if(p.x>fc.width)p.x=0;
      if(p.y<-10){p.y=fc.height+10;p.x=Math.random()*fc.width}
      if(p.y>fc.height+10){p.y=-10;p.x=Math.random()*fc.width}
      fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      fctx.fillStyle='hsla('+p.hue+',80%,60%,'+p.o+')';
      fctx.shadowBlur=p.r*4;fctx.shadowColor='hsla('+p.hue+',80%,60%,0.3)';
      fctx.fill();
      fctx.shadowBlur=0;
    }
    requestAnimationFrame(drawFloat);
  }
  drawFloat();
})();


// ---- CARD MOUSE TRACKING (spotlight + 3D tilt) ----
if(isDesktop){
  document.querySelectorAll('.feat-card,.test-card,.p-card,.ind-card,.proof-item,.reality-panel').forEach(function(card){
    card.style.transition='transform .25s ease-out,box-shadow .25s ease-out,'+card.style.transition;
    card.style.transformStyle='preserve-3d';
    card.parentElement.style.perspective='800px';
    card.addEventListener('mousemove',function(e){
      var rect=card.getBoundingClientRect();
      var x=((e.clientX-rect.left)/rect.width)*100;
      var y=((e.clientY-rect.top)/rect.height)*100;
      card.style.setProperty('--spotlight-x',x+'%');
      card.style.setProperty('--spotlight-y',y+'%');
      // 3D tilt
      var rx=(y-50)/5;
      var ry=(x-50)/-5;
      card.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-8px) scale(1.02)';
    });
    card.addEventListener('mouseleave',function(){
      card.style.transform='rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });
}

// ---- STAGGERED ANIMATION DELAYS ----
document.querySelectorAll('.feat-card').forEach(function(c,i){c.style.setProperty('--i',i)});
document.querySelectorAll('.ind-card').forEach(function(c,i){c.style.setProperty('--i',i)});
document.querySelectorAll('.p-list li').forEach(function(li,i){li.style.setProperty('--li',i)});

// ---- ACTIVE NAV LINK (underline style) ----
var navLinksAll=document.querySelectorAll('.n-links a');
var navSections=[];
navLinksAll.forEach(function(a){
  var id=a.getAttribute('href');
  if(id&&id.startsWith('#')){var el=document.querySelector(id);if(el)navSections.push({el:el,link:a})}
});
function updateActiveNav(){
  var scrollY=window.scrollY+250;
  var active=null;
  navSections.forEach(function(s){if(s.el.offsetTop<=scrollY)active=s});
  navLinksAll.forEach(function(a){a.classList.remove('active')});
  if(active){active.link.classList.add('active')}
}
window.addEventListener('scroll',updateActiveNav,{passive:true});
setTimeout(updateActiveNav,100);

// ---- NAV SCROLL STATE ----
var navEl=document.getElementById('nav');
var lastScroll=0;
window.addEventListener('scroll',function(){
  var y=window.scrollY;
  if(y>60)navEl.classList.add('scrolled');
  else navEl.classList.remove('scrolled');
  if(y>300&&y>lastScroll)navEl.classList.add('hide');
  else navEl.classList.remove('hide');
  lastScroll=y;
},{passive:true});

// ---- MOBILE MENU ----
var menuBtn=document.getElementById('navMenu');
var drawer=document.getElementById('navDrawer');
if(menuBtn&&drawer){
  menuBtn.addEventListener('click',function(){
    var open=menuBtn.getAttribute('aria-expanded')==='true';
    menuBtn.setAttribute('aria-expanded',!open);
    drawer.classList.toggle('open');
    drawer.setAttribute('aria-hidden',open);
  });
  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){
      menuBtn.setAttribute('aria-expanded','false');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden','true');
    });
  });
}

// ---- RATING DEBUG: track which section is in viewport ----
var ratedEls=document.querySelectorAll('[data-rating]');
if(ratedEls.length){
  var ratingObs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        ratedEls.forEach(function(el){el.classList.remove('in-view')});
        e.target.classList.add('in-view');
      }
    });
  },{threshold:0.3});
  ratedEls.forEach(function(el){ratingObs.observe(el)});
}

// =====================================================================
// SCAN STATE MACHINE
// States: input -> scanning -> results -> revealed
// =====================================================================
(function(){
  var overlay    = document.getElementById('scanOverlay');
  var heroOriginal= document.getElementById('heroOriginal');
  if(!overlay || !heroOriginal) return;

  // Panels
  var panelInput    = document.getElementById('scanPanelInput');
  var panelScanning = document.getElementById('scanPanelScanning');
  var panelResults  = document.getElementById('scanPanelResults');

  // Input state elements
  var urlInput  = document.getElementById('scanUrlInput');
  var scanBtn   = document.getElementById('scanBtn');
  var skipBtn   = document.getElementById('scanSkip');

  // Scanning state elements
  var targetUrlEl = document.getElementById('scanTargetUrl');
  var liveUrlEl   = document.getElementById('scanLiveUrl');
  var termLive    = document.getElementById('scanTermLive');
  var checklist   = document.getElementById('scanChecklist');

  // Results state elements
  var resultHeading   = document.getElementById('scanResultHeading');
  var problemCountEl  = document.getElementById('scanProblemCount');
  var leakLineEl      = document.getElementById('scanLeakLine');
  var emailInput      = document.getElementById('scanEmailInput');
  var emailBtn        = document.getElementById('scanEmailBtn');
  var textBtn         = document.getElementById('scanTextBtn');
  var gradeEl         = document.getElementById('scanGrade');
  var scoreBarsEl     = document.getElementById('scanScoreBars');
  var leakBreakdownEl = document.getElementById('scanLeakBreakdown');

  var currentState = 'input';
  var autoSkipTimer = null;

  // --- AUTO-SKIP after 8 seconds of no interaction ---
  function startAutoSkip(){
    clearAutoSkip();
    autoSkipTimer = setTimeout(function(){
      revealHero();
    }, 8000);
  }
  function clearAutoSkip(){
    if(autoSkipTimer){ clearTimeout(autoSkipTimer); autoSkipTimer=null; }
  }

  // Interaction cancels auto-skip
  ['mousedown','touchstart','keydown'].forEach(function(evt){
    overlay.addEventListener(evt, clearAutoSkip, {once:false, passive:true});
  });

  startAutoSkip();

  // --- URL VALIDATION ---
  function cleanUrl(raw){
    raw = raw.trim();
    if(!raw) return null;
    if(!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    try{
      var u = new URL(raw);
      if(!u.hostname || u.hostname.indexOf('.') < 0) return null;
      return raw;
    }catch(e){ return null; }
  }

  // --- STATE TRANSITIONS ---
  function showState(state){
    currentState = state;
    overlay.setAttribute('data-state', state);
    panelInput.hidden    = (state !== 'input');
    panelScanning.hidden = (state !== 'scanning');
    panelResults.hidden  = (state !== 'results');
  }

  function revealHero(){
    clearAutoSkip();
    overlay.classList.add('scan-revealed');
    heroOriginal.classList.add('scan-visible');
    setTimeout(function(){
      overlay.style.display = 'none';
    }, 700);
  }

  // --- SCAN TRIGGER ---
  scanBtn.addEventListener('click', function(){
    clearAutoSkip();
    var url = cleanUrl(urlInput.value);
    if(!url){
      urlInput.focus();
      urlInput.style.borderColor = 'var(--red)';
      urlInput.style.boxShadow = '0 0 0 3px rgba(255,42,80,0.15)';
      setTimeout(function(){
        urlInput.style.borderColor = '';
        urlInput.style.boxShadow = '';
      }, 1200);
      return;
    }
    startScan(url);
  });

  urlInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      clearAutoSkip();
      scanBtn.click();
    }
  });

  skipBtn.addEventListener('click', function(){
    clearAutoSkip();
    revealHero();
  });

  // Email submit
  if(emailBtn) emailBtn.addEventListener('click', function(){
    var email = (emailInput ? emailInput.value : '').trim();
    if(!email || !/\S+@\S+\.\S+/.test(email)){
      if(emailInput) emailInput.focus();
      return;
    }
    console.log('[Scan] Email captured:', email);
    revealHero();
  });

  if(textBtn) textBtn.addEventListener('click', revealHero);

  // --- MOCK DATA for local dev ---
  function mockScanData(url){
    return {
      url: url,
      crawl: {
        ok: true,
        ssl: Math.random() > 0.3,
        title: { present: true, text: 'Example Business', length: 42, good: true },
        metaDesc: { present: Math.random() > 0.4, good: Math.random() > 0.5, length: 130 },
        h1: { present: Math.random() > 0.3 },
        viewport: { present: Math.random() > 0.25 },
        phone: { visible: Math.random() > 0.45, clickToCall: Math.random() > 0.55 },
        schema: { present: Math.random() > 0.6 },
        contactForm: { present: Math.random() > 0.5 },
        images: { total: 12, withAlt: Math.floor(Math.random() * 12), altPct: Math.floor(Math.random() * 100) }
      },
      pagespeed: {
        ok: true,
        scores: {
          performance:   20 + Math.floor(Math.random() * 75),
          seo:           40 + Math.floor(Math.random() * 55),
          accessibility: 35 + Math.floor(Math.random() * 60),
          bestPractices: 40 + Math.floor(Math.random() * 55)
        },
        metrics: { fcp: '3.2 s', lcp: '5.8 s', tbt: '420 ms', cls: '0.18', speed: '4.9 s' },
        mobile: { friendly: Math.random() > 0.4 }
      },
      timestamp: Date.now()
    };
  }

  // --- FETCH SCAN DATA ---
  function fetchScan(url){
    var endpoint = '/.netlify/functions/scan?url=' + encodeURIComponent(url);
    return fetch(endpoint)
      .then(function(res){
        if(!res.ok){ throw new Error('HTTP ' + res.status); }
        return res.json();
      })
      .catch(function(err){
        console.warn('[Scan] Function unavailable, using mock data:', err.message);
        return mockScanData(url);
      });
  }

  // --- SCORE CALCULATION ---
  function calcScores(data){
    var c = data.crawl || {};
    var ps = data.pagespeed || {};
    var scores = { speed:5, mobile:5, seo:5, leads:5, security:5 };

    if(ps.ok && ps.scores){
      if(ps.scores.performance != null) scores.speed = Math.round(ps.scores.performance / 10);
      if(ps.scores.seo != null) scores.seo = Math.round(ps.scores.seo / 10);
      if(ps.mobile != null) scores.mobile = ps.mobile.friendly ? 9 : 3;
    }
    if(c.ok){
      if(!ps.ok || ps.scores == null){
        var seoPoints = 0;
        if(c.title && c.title.present) seoPoints += 2;
        if(c.title && c.title.good) seoPoints += 1;
        if(c.metaDesc && c.metaDesc.present) seoPoints += 2;
        if(c.metaDesc && c.metaDesc.good) seoPoints += 1;
        if(c.h1 && c.h1.present) seoPoints += 2;
        if(c.schema && c.schema.present) seoPoints += 2;
        scores.seo = Math.min(10, seoPoints);
      }
      if(!ps.ok) scores.mobile = c.viewport && c.viewport.present ? 7 : 3;

      var leadPts = 0;
      if(c.phone && c.phone.visible) leadPts += 3;
      if(c.phone && c.phone.clickToCall) leadPts += 3;
      if(c.contactForm && c.contactForm.present) leadPts += 4;
      scores.leads = Math.min(10, leadPts);

      var secPts = c.ssl ? 8 : 2;
      if(ps.ok && ps.scores && ps.scores.bestPractices != null){
        secPts = Math.round((secPts + Math.round(ps.scores.bestPractices / 10)) / 2);
      }
      scores.security = Math.min(10, secPts);
    }

    return scores;
  }

  function calcGrade(scores){
    var avg = (scores.speed + scores.mobile + scores.seo + scores.leads + scores.security) / 5;
    if(avg >= 8.5) return 'A';
    if(avg >= 7)   return 'B';
    if(avg >= 5)   return 'C';
    if(avg >= 3.5) return 'D';
    return 'F';
  }

  var LEAK_RATES = {
    ssl:         { label: 'Insecure site (no SSL)',       monthly: 800  },
    slowSpeed:   { label: 'Slow page load',               monthly: 2200 },
    notMobile:   { label: 'Not mobile friendly',          monthly: 1900 },
    noH1:        { label: 'Missing SEO headlines',        monthly: 600  },
    noMeta:      { label: 'Missing meta description',     monthly: 500  },
    noPhone:     { label: 'Phone number not visible',     monthly: 1400 },
    noClickCall: { label: 'No click-to-call button',      monthly: 900  },
    noForm:      { label: 'No contact form',              monthly: 1100 },
    noSchema:    { label: 'No structured data (schema)',  monthly: 400  },
    poorAlt:     { label: 'Missing image alt tags',       monthly: 300  }
  };

  function calcLeaks(data){
    var c = data.crawl || {};
    var ps = data.pagespeed || {};
    var leaks = [];
    if(c.ok){
      if(!c.ssl) leaks.push(LEAK_RATES.ssl);
      if(!c.h1 || !c.h1.present) leaks.push(LEAK_RATES.noH1);
      if(!c.metaDesc || !c.metaDesc.present) leaks.push(LEAK_RATES.noMeta);
      if(!c.phone || !c.phone.visible) leaks.push(LEAK_RATES.noPhone);
      if(!c.phone || !c.phone.clickToCall) leaks.push(LEAK_RATES.noClickCall);
      if(!c.contactForm || !c.contactForm.present) leaks.push(LEAK_RATES.noForm);
      if(!c.schema || !c.schema.present) leaks.push(LEAK_RATES.noSchema);
      if(c.images && c.images.altPct != null && c.images.altPct < 70) leaks.push(LEAK_RATES.poorAlt);
    }
    if(ps.ok){
      if(ps.scores && ps.scores.performance != null && ps.scores.performance < 50) leaks.push(LEAK_RATES.slowSpeed);
      if(ps.mobile && ps.mobile.friendly === false) leaks.push(LEAK_RATES.notMobile);
    }
    return leaks;
  }

  // --- TERMINAL LINE PRINTER ---
  function printLine(container, html, delayMs){
    setTimeout(function(){
      var div = document.createElement('div');
      div.className = 'scan-t-line';
      div.style.maxWidth = '0';
      div.style.overflow = 'hidden';
      div.style.whiteSpace = 'nowrap';
      div.innerHTML = html;
      container.appendChild(div);
      requestAnimationFrame(function(){
        div.style.transition = 'max-width 0.4s ease';
        div.style.maxWidth = '100%';
      });
      container.scrollTop = container.scrollHeight;
    }, delayMs);
  }

  function printSpacer(container, delayMs){
    setTimeout(function(){
      var div = document.createElement('div');
      div.className = 'scan-t-spacer';
      container.appendChild(div);
    }, delayMs);
  }

  // --- CHECK ITEM HELPERS ---
  var checkItems = {};
  if(checklist){
    checklist.querySelectorAll('.scan-check-item').forEach(function(el){
      checkItems[el.dataset.check] = el;
    });
  }

  function setCheck(key, state){
    var el = checkItems[key];
    if(!el) return;
    el.classList.remove('active','done','fail');
    if(state) el.classList.add(state);
  }

  // --- MAIN SCAN FLOW ---
  function startScan(url){
    clearAutoSkip();
    showState('scanning');

    var displayUrl = url.replace(/^https?:\/\//,'').replace(/\/$/,'');
    if(targetUrlEl) targetUrlEl.textContent = displayUrl;
    if(liveUrlEl) liveUrlEl.textContent = displayUrl;

    var checks = ['crawl','speed','seo','leads','security'];
    checks.forEach(function(k){ setCheck(k,''); });
    setCheck('crawl','active');

    var scanPromise = fetchScan(url);

    setTimeout(function(){ setCheck('speed','active'); }, 1800);
    setTimeout(function(){ setCheck('seo','active'); }, 3200);
    setTimeout(function(){ setCheck('leads','active'); }, 4500);
    setTimeout(function(){ setCheck('security','active'); }, 5800);

    scanPromise.then(function(data){
      var c = data.crawl || {};
      var ps = data.pagespeed || {};

      setCheck('crawl', c.ok ? 'done' : 'fail');
      setCheck('speed', (ps.ok && ps.scores && ps.scores.performance >= 50) ? 'done' : 'fail');
      setCheck('seo', 'done');
      setCheck('leads', 'done');
      setCheck('security', (c.ok && c.ssl) ? 'done' : 'fail');

      var d = 400;

      printSpacer(termLive, d); d += 100;
      printLine(termLive, '<span class="scan-t-section">WEBSITE HEALTH</span>', d); d += 350;

      if(c.ok){
        printLine(termLive, (c.ssl
          ? '<span class="scan-t-ok">&#10003;</span> SSL secure (HTTPS)'
          : '<span class="scan-t-fail">&#10005;</span> No SSL. Google penalizes this.'), d); d+=220;
        printLine(termLive, (c.title && c.title.good
          ? '<span class="scan-t-ok">&#10003;</span> Title tag: ' + c.title.length + ' chars'
          : '<span class="scan-t-warn">&#9888;</span> Title ' + (c.title && c.title.present ? (c.title.length < 30 ? 'too short' : 'too long') + ' (' + c.title.length + ' chars)' : 'missing')), d); d+=220;
        printLine(termLive, (c.h1 && c.h1.present
          ? '<span class="scan-t-ok">&#10003;</span> H1 tag present'
          : '<span class="scan-t-fail">&#10005;</span> No H1 tag. Hurts SEO.'), d); d+=220;
        printLine(termLive, (c.phone && c.phone.visible
          ? '<span class="scan-t-ok">&#10003;</span> Phone number visible'
          : '<span class="scan-t-fail">&#10005;</span> No phone visible to visitors'), d); d+=220;
        printLine(termLive, (c.phone && c.phone.clickToCall
          ? '<span class="scan-t-ok">&#10003;</span> Click-to-call link found'
          : '<span class="scan-t-warn">&#9888;</span> No click-to-call link'), d); d+=220;
        printLine(termLive, (c.contactForm && c.contactForm.present
          ? '<span class="scan-t-ok">&#10003;</span> Contact form present'
          : '<span class="scan-t-fail">&#10005;</span> No contact form found'), d); d+=220;
      } else {
        printLine(termLive, '<span class="scan-t-warn">&#9888;</span> ' + (c.error || 'Could not fully reach site'), d); d+=300;
      }

      if(ps.ok && ps.scores){
        printSpacer(termLive, d); d+=150;
        printLine(termLive, '<span class="scan-t-section">PERFORMANCE</span>', d); d+=300;
        if(ps.scores.performance != null){
          var pScore = ps.scores.performance;
          var pIcon = pScore >= 90 ? '<span class="scan-t-ok">&#10003;</span>' : pScore >= 50 ? '<span class="scan-t-warn">&#9888;</span>' : '<span class="scan-t-fail">&#10005;</span>';
          printLine(termLive, pIcon + ' Mobile speed score: ' + pScore + '/100', d); d+=220;
        }
        if(ps.metrics && ps.metrics.lcp){
          var lcpVal = parseFloat(ps.metrics.lcp);
          var lcpIcon = lcpVal <= 2.5 ? '<span class="scan-t-ok">&#10003;</span>' : '<span class="scan-t-fail">&#10005;</span>';
          printLine(termLive, lcpIcon + ' Largest paint: ' + ps.metrics.lcp, d); d+=220;
        }
        if(ps.scores.seo != null){
          var seoScore = ps.scores.seo;
          var seoIcon = seoScore >= 90 ? '<span class="scan-t-ok">&#10003;</span>' : '<span class="scan-t-warn">&#9888;</span>';
          printLine(termLive, seoIcon + ' SEO score: ' + seoScore + '/100', d); d+=220;
        }
      }

      setTimeout(function(){ showResults(data); }, d + 600);

    }).catch(function(err){
      console.error('[Scan] Error:', err);
      showResults({ crawl: { ok: false, error: err.message }, pagespeed: { ok: false } });
    });
  }

  // --- SHOW RESULTS STATE ---
  function showResults(data){
    showState('results');
    var scores = calcScores(data);
    var grade  = calcGrade(scores);
    var leaks  = calcLeaks(data);

    gradeEl.textContent = grade;
    gradeEl.className = 'scan-grade scan-grade--' + grade;

    var problemCount = leaks.length;
    if(problemCount === 0){
      if(resultHeading) resultHeading.innerHTML = 'Your site looks <em class="scan-accent">solid</em>';
      if(leakLineEl) leakLineEl.hidden = true;
    } else {
      if(problemCountEl) problemCountEl.textContent = problemCount + ' problem' + (problemCount !== 1 ? 's' : '');
      var totalLeak = leaks.reduce(function(s,l){ return s + l.monthly; }, 0);
      if(leakLineEl){
        leakLineEl.textContent = 'costing you an estimated $' + totalLeak.toLocaleString() + ' every month';
        leakLineEl.hidden = false;
      }
    }

    var cats = ['speed','mobile','seo','leads','security'];
    cats.forEach(function(cat, idx){
      var row = scoreBarsEl ? scoreBarsEl.querySelector('[data-cat="' + cat + '"]') : null;
      if(!row) return;
      var fill = row.querySelector('.scan-score-bar-fill');
      var num  = row.querySelector('.scan-score-num');
      var score = scores[cat] || 0;
      var cls = score >= 7 ? 'good' : score >= 4 ? 'warn' : 'bad';
      setTimeout(function(){
        if(fill){ fill.style.width = (score * 10) + '%'; fill.className = 'scan-score-bar-fill ' + cls; }
        if(num){ num.textContent = score + '/10'; num.className = 'scan-score-num ' + cls; }
      }, idx * 150 + 200);
    });

    if(leakBreakdownEl){
      leakBreakdownEl.innerHTML = '';
      if(leaks.length > 0){
        leaks.slice(0, 4).forEach(function(leak){
          var row = document.createElement('div');
          row.className = 'scan-leak-item';
          row.innerHTML = '<span class="scan-leak-item-label">' + leak.label + '</span>'
            + '<span class="scan-leak-item-val">-$' + leak.monthly.toLocaleString() + '/mo</span>';
          leakBreakdownEl.appendChild(row);
        });
        var totalAll = leaks.reduce(function(s,l){ return s+l.monthly; }, 0);
        var totalRow = document.createElement('div');
        totalRow.className = 'scan-leak-total';
        totalRow.innerHTML = '<span class="scan-leak-total-label">Total monthly leak</span>'
          + '<span class="scan-leak-total-val">-$' + totalAll.toLocaleString() + '/mo</span>';
        leakBreakdownEl.appendChild(totalRow);
      }
    }
  }

})();

})();
