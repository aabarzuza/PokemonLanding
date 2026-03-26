(function () {
const TYPES=['normal','fighting','flying','poison','ground','rock','bug','ghost','steel','fire','water','grass','electric','psychic','ice','dragon','dark','fairy'];
const TYPE_EN={normal:'Normal',fighting:'Fighting',flying:'Flying',poison:'Poison',ground:'Ground',rock:'Rock',bug:'Bug',ghost:'Ghost',steel:'Steel',fire:'Fire',water:'Water',grass:'Grass',electric:'Electric',psychic:'Psychic',ice:'Ice',dragon:'Dragon',dark:'Dark',fairy:'Fairy'};
const TYPE_ES={normal:'Normal',fighting:'Lucha',flying:'Volador',poison:'Veneno',ground:'Tierra',rock:'Roca',bug:'Bicho',ghost:'Fantasma',steel:'Acero',fire:'Fuego',water:'Agua',grass:'Planta',electric:'Eléctrico',psychic:'Psíquico',ice:'Hielo',dragon:'Dragón',dark:'Siniestro',fairy:'Hada'};
const TYPE_COLORS={normal:'#b9b8b2',fighting:'#f58b15',flying:'#4b8dc0',poison:'#9c45ce',ground:'#9a5b1f',rock:'#b9af7a',bug:'#94a80d',ghost:'#7a4f88',steel:'#69a7c2',fire:'#ef2b2c',water:'#3884e5',grass:'#43a629',electric:'#f3bf17',psychic:'#ef3c7d',ice:'#49c0e2',dragon:'#5867da',dark:'#695450',fairy:'#d863db'};
const CHART={normal:{rock:.5,ghost:0,steel:.5},fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},bug:{fire:.5,grass:2,fighting:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},ghost:{normal:0,psychic:2,ghost:2,dark:.5},dragon:{dragon:2,steel:.5,fairy:0},dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}};
const STATE={attackMode:1,defenseMode:1,editing:'attack',attacker:['flying'],defender:['fighting']};

function icon(type){return `https://play.pokemonshowdown.com/sprites/types/${TYPE_EN[type]}.png`;}
function effect(atk,defs){return defs.reduce((acc,def)=>acc*(((CHART[atk]||{})[def])??1),1);}
function comboEffect(atks,defs){return atks.reduce((acc,atk)=>acc*effect(atk,defs),1);}
function multLabel(v){return {0:'0x',0.25:'0.25x',0.5:'0.5x',1:'1x',2:'2x',4:'4x',8:'8x'}[v]||`${v}x`;}
function bucket(mults){return TYPES.filter(type=>mults.includes(comboEffect(STATE.attacker,[type])));}
function defendBucket(mults){return TYPES.filter(type=>mults.includes(effect(type,STATE.defender)));}
function selected(list,type){return STATE[list].includes(type);}
function pick(type){
  const listKey=STATE.editing==='attack'?'attacker':'defender';
  const modeKey=STATE.editing==='attack'?'attackMode':'defenseMode';
  const limit=listKey==='defender'?2:STATE[modeKey];
  const list=[...STATE[listKey]];
  const i=list.indexOf(type);
  if(i>=0){if(list.length>1)list.splice(i,1);}
  else if(limit===1){list.splice(0,list.length,type);}
  else if(list.length<2){list.push(type);}
  else{list.shift();list.push(type);}
  STATE[listKey]=list;
  render();
}
function setMode(modeKey,listKey,val){STATE[modeKey]=val;if(val===1&&listKey!=='defender')STATE[listKey]=[STATE[listKey][0]];render();}
function chip(type){return `<span class="typecalc-chip" style="--type:${TYPE_COLORS[type]}"><img class="typecalc-icon" src="${icon(type)}" alt="${TYPE_ES[type]}" /><span>${TYPE_ES[type]}</span></span>`;}
function typeButton(type){
  const active=selected(STATE.editing==='attack'?'attacker':'defender',type);
  return `<button class="typecalc-pick ${active?'active':''}" data-type="${type}" style="--type:${TYPE_COLORS[type]}"><img class="typecalc-icon" src="${icon(type)}" alt="${TYPE_ES[type]}" /><span>${TYPE_ES[type]}</span></button>`;
}
function resultCard(title,types){
  return `<div class="typecalc-group"><div class="typecalc-group-title">${title}</div><div class="typecalc-group-grid">${types.length?types.map(type=>`<span class="typecalc-badge" style="--type:${TYPE_COLORS[type]}"><img class="typecalc-icon" src="${icon(type)}" alt="${TYPE_ES[type]}" /><span>${TYPE_ES[type]}</span></span>`).join(''):'<span class="typecalc-empty">Ninguno</span>'}</div></div>`;
}
function render(){
  const el=document.getElementById('type-calc-section');
  if(!el)return;
  const direct=comboEffect(STATE.attacker,STATE.defender);
  const attackResults=[
    resultCard('Inflige 4x a',bucket([4,8])),
    resultCard('Inflige 2x a',bucket([2])),
    resultCard('Inflige 1x a',bucket([1])),
    resultCard('Inflige 0.5x / 0.25x a',bucket([0.5,0.25])),
    resultCard('No afecta a',bucket([0])),
  ].join('');
  const defenseResults=[
    resultCard('Te golpean 4x con',defendBucket([4,8])),
    resultCard('Te golpean 2x con',defendBucket([2])),
    resultCard('Te golpean 1x con',defendBucket([1])),
    resultCard('Resistes 0.5x / 0.25x',defendBucket([0.5,0.25])),
    resultCard('Eres inmune a',defendBucket([0])),
  ].join('');
  el.innerHTML=`<div class="typecalc-app">
    <aside class="typecalc-sidebar">
      <div class="typecalc-side-group">
        <div class="typecalc-side-title">Ataque</div>
        <button class="typecalc-side-btn ${STATE.attackMode===1?'active':''}" data-mode-key="attackMode" data-list-key="attacker" data-mode="1">Single</button>
        <button class="typecalc-side-btn ${STATE.attackMode===2?'active':''}" data-mode-key="attackMode" data-list-key="attacker" data-mode="2">Dual</button>
      </div>
      <div class="typecalc-side-group">
        <div class="typecalc-side-title">Defensa</div>
        <button class="typecalc-side-btn ${STATE.defenseMode===1?'active':''}" data-mode-key="defenseMode" data-list-key="defender" data-mode="1">Solo</button>
        <button class="typecalc-side-btn ${STATE.defenseMode===2?'active':''}" data-mode-key="defenseMode" data-list-key="defender" data-mode="2">Equipo</button>
      </div>
      <div class="typecalc-side-group">
        <div class="typecalc-side-title">Editar</div>
        <button class="typecalc-side-btn ${STATE.editing==='attack'?'active':''}" data-edit="attack">Tipos de ataque</button>
        <button class="typecalc-side-btn ${STATE.editing==='defense'?'active':''}" data-edit="defense">Tipos de defensa</button>
      </div>
    </aside>
    <section class="typecalc-picker">
      <div class="typecalc-panel-title">Elige los tipos</div>
      <div class="typecalc-selected-row">
        <div class="typecalc-selected-box"><div class="typecalc-selected-label">Ataque</div><div class="typecalc-selected-list">${STATE.attacker.map(chip).join('')}</div></div>
        <div class="typecalc-selected-box"><div class="typecalc-selected-label">Defensa</div><div class="typecalc-selected-list">${STATE.defender.map(chip).join('')}</div></div>
        <div class="typecalc-direct-box"><div class="typecalc-selected-label">Matchup</div><div class="typecalc-direct-value">${multLabel(direct)}</div></div>
      </div>
      <div class="typecalc-editing-tag">${STATE.editing==='attack'?'Editando tipos de ataque':'Editando tipos de defensa'}</div>
      <div class="typecalc-pick-grid">${TYPES.map(typeButton).join('')}</div>
    </section>
    <section class="typecalc-results-pane">${attackResults}${defenseResults}</section>
  </div>`;
  el.querySelectorAll('[data-type]').forEach(btn=>btn.addEventListener('click',()=>pick(btn.dataset.type)));
  el.querySelectorAll('[data-mode-key]').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.modeKey,btn.dataset.listKey,Number(btn.dataset.mode)||1)));
  el.querySelectorAll('[data-edit]').forEach(btn=>btn.addEventListener('click',()=>{STATE.editing=btn.dataset.edit;render();}));
}
function buildTypeCalculatorSection(){try{render();}catch(err){console.error('type calc render error',err);const el=document.getElementById('type-calc-section');if(el)el.innerHTML='<div class="battle-end">No se pudo cargar la calculadora de tipos.</div>';}}
document.addEventListener('DOMContentLoaded',()=>setTimeout(buildTypeCalculatorSection,60));
document.addEventListener('langchange',()=>setTimeout(buildTypeCalculatorSection,0));
window.buildTypeCalculatorSection=buildTypeCalculatorSection;
})();
