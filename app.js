const KEY = "semaine-v1";
const DAYSN = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const SHOP = {
  veg: [["pdt-2kg","Pommes de terre 2 kg","2,60"],["carottes","Carottes 1 kg","1,25"],["oignons","Oignons 1 kg","1,40"],["ail","Ail","0,70"],["salade","Salade x2","2,00"],["courgettes","Courgettes 1 kg","1,80"],["citron","Citrons x2","0,80"],["bananes","Bananes 1 kg","1,50"],["pommes","Pommes 1 kg","2,00"]],
  frais: [["poulet","Cuisses de poulet 1 kg","5,50"],["oeufs","Oeufs x12","2,50"],["yaourts","Yaourts nature x12","2,20"],["lait","Lait 1 L","0,95"],["rape","Fromage rape 200 g","1,80"],["emmental","Emmental 250 g","2,30"],["thon","Thon x2","2,40"],["beurre","Beurre 250 g","2,45"]],
  epi: [["riz","Riz 1 kg","1,50"],["pates","Pates 1 kg","1,10"],["lentilles","Lentilles 500 g","1,50"],["avoine","Flocons avoine 500 g","1,20"],["tomates","Tomates pelees x2","1,60"],["pain","Pain","1,80"],["bouillon","Bouillon","1,00"],["pois","Pois chiches","0,85"]]
};
const SHOP_LABEL = { veg: "Legumes / fruits", frais: "Frais / proteines", epi: "Epicerie" };
const MENUS = {
  1: { midi: "Restes ou oeufs + pain", soir: "Poulet four + riz + carottes" },
  2: { midi: "Reste poulet + riz", soir: "Poulet four + riz + carottes" },
  3: { midi: "Reste poulet + riz", soir: "Lentilles + carottes + pain" },
  4: { midi: "Reste lentilles + oeuf", soir: "Omelette PDT-oignons + salade" },
  5: { midi: "Reste omelette / riz", soir: "Pates + tomate + thon + salade" },
  6: { midi: "Brunch oeufs + pain", soir: "Gratin PDT-fromage" },
  0: { midi: "Restes / tartines", soir: "Soupe restes + pain-fromage" }
};
const WEEK = {
  1: ["Pose 8h30", "Didask cafe 9h30-15h15", "Recup 16h30", "Soir: atterrir"],
  2: ["Pose 8h30", "Salle 8h40-9h20", "Didask cafe", "Recup 16h30", "20h15 apprendre"],
  3: ["Pose 8h30", "Ecole souvent 11h30", "Aprem Logan + courses"],
  4: ["Pose 8h30", "Salle 8h40-9h20", "Didask cafe", "Recup 16h30", "20h15 kiff perso"],
  5: ["Pose 8h30", "Didask jusqu a 15h15", "16h30 week-end. Stop Slack."],
  6: ["Marche Lepic", "Butte avec Logan", "Pas de Didask"],
  0: ["45 min prep lundi", "Diner tot", "Pas de taff"]
};
function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
var state = Object.assign({ checks:{}, shop:{}, extras:{}, steps:{}, wedEarly:true, notes:"" }, load());
function el(tag, attrs, kids){
  var n = document.createElement(tag); attrs = attrs || {};
  Object.keys(attrs).forEach(function(k){
    if(k==="class") n.className=attrs[k];
    else if(k==="text") n.textContent=attrs[k];
    else if(k==="checked") n.checked=!!attrs[k];
    else if(k==="value") n.value=attrs[k];
    else n.setAttribute(k, attrs[k]);
  });
  (kids||[]).forEach(function(c){ if(c) n.appendChild(c); });
  return n;
}
function todayKey(d){ d=d||new Date(); return d.toISOString().slice(0,10); }
function tagClass(tag){ return ({logan:"logan",work:"work",move:"move",food:"food",kiff:"food"})[tag]||"food"; }
function baseToday(dow, wedEarly){
  if(dow===0||dow===6){
    return [
      {t:"09:30",id:"we-slow",label:"Matin lent. Pas de Didask.",tag:"kiff"},
      {t:"11:00",id:"we-out",label: dow===6?"Marche Lepic + butte avec Logan":"Sortie douce / square",tag:"logan"},
      {t:"16:00",id:"we-prep",label: dow===0?"45 min prep lundi-mardi":"Apres-midi libre",tag:"food"},
      {t:"19:00",id:"we-dinner",label:"Diner simple avec Logan",tag:"logan"}
    ];
  }
  var gym = (dow===2||dow===4);
  var list = [
    {t:"07:00",id:"wake",label:"Debout. Petit-dej avec Logan.",tag:"food"},
    {t:"08:10",id:"leave",label:"Sortie. Marche vers Lepic.",tag:"move"},
    {t:"08:30",id:"drop",label:"Pose Logan — ecole Lepic",tag:"logan"}
  ];
  list.push(gym ? {t:"08:40",id:"gym",label:"Salle 40 min",tag:"move"} : {t:"08:40",id:"stairs",label:"Retour Halles St-Pierre / escaliers",tag:"move"});
  if(dow===3 && wedEarly){
    list.push({t:"09:30",id:"work-am",label:"Didask cafe jusqu a 11h15",tag:"work"});
    list.push({t:"11:30",id:"pick-early",label:"Recup Logan 11h30",tag:"logan"});
    list.push({t:"12:00",id:"wed-kiff",label:"Aprem Logan + courses Lidl Belliard",tag:"logan"});
  } else {
    list.push({t:"09:30",id:"work-am",label:"Didask au cafe — bloc profond",tag:"work"});
    list.push({t:"12:15",id:"lunch",label:"Restes + 15 min rue Lepic",tag:"food"});
    list.push({t:"13:15",id:"work-pm",label:"Didask calls / Slack",tag:"work"});
    list.push({t:"15:15",id:"stop",label:"HARD STOP. Laptop ferme.",tag:"work"});
    list.push({t:"16:30",id:"pick",label:"Recup Logan — plus de taff",tag:"logan"});
  }
  list.push({t:"18:30",id:"dinner",label:"Diner assis. Tel ailleurs.",tag:"logan"});
  if(dow===2) list.push({t:"20:15",id:"learn",label:"Apprendre 30 min",tag:"kiff"});
  else if(dow===4) list.push({t:"20:15",id:"kiff",label:"Kiff perso 45 min",tag:"kiff"});
  else if(dow===5) list.push({t:"20:15",id:"weekend",label:"Week-end. Rien a rattraper.",tag:"kiff"});
  else list.push({t:"20:15",id:"land",label:"Atterrir. Douche. Lit.",tag:"kiff"});
  return list;
}
function nextLock(now){
  var dow=now.getDay(), mins=now.getHours()*60+now.getMinutes();
  function mk(h,m,title){ return {t:h*60+m, title:title, label:(h<10?"0":"")+h+":"+(m<10?"0":"")+m}; }
  var locks=[];
  if(dow>=1&&dow<=5){
    locks=[mk(8,25,"Pose ecole"),mk(15,15,"Stop Didask"),mk(16,25,"Recup Logan")];
    if(dow===3&&state.wedEarly) locks=[mk(8,25,"Pose ecole"),mk(11,20,"Recup 11h30")];
  }
  var n=locks.filter(function(l){return l.t>mins;})[0];
  if(!n) return {title:"Plus de lock",eta:"soir",soon:false};
  var diff=n.t-mins,h=Math.floor(diff/60),m=diff%60;
  return {title:n.title+" "+n.label, eta:h?h+"h "+m+" min":m+" min", soon:diff<=20};
}
function renderToday(){
  var now=new Date(), dow=now.getDay(), key=todayKey(now);
  var items=baseToday(dow,state.wedEarly).concat(state.extras[key]||[]);
  var menu=MENUS[dow], checks=state.checks[key]||{};
  var done=items.filter(function(i){return checks[i.id];}).length;
  var steps=state.steps[key]||"";
  document.getElementById("todayLabel").textContent=DAYSN[dow]+" "+now.toLocaleDateString("fr-FR")+" · "+done+"/"+items.length+" faits";
  var lock=nextLock(now);
  document.getElementById("lockTitle").textContent=lock.title;
  document.getElementById("lockEta").textContent=lock.eta;
  document.getElementById("lock1").classList.toggle("soon",!!lock.soon);
  document.getElementById("lock2").classList.toggle("soon",!!lock.soon);
  var root=document.getElementById("tab-today");
  while(root.firstChild) root.removeChild(root.firstChild);
  root.appendChild(el("div",{class:"stats"},[
    el("div",{class:"stat"},[el("b",{text:done+"/"+items.length}),el("span",{text:"taches"})]),
    el("div",{class:"stat"},[el("b",{text:steps||"—"}),el("span",{text:"pas"})]),
    el("div",{class:"stat"},[el("b",{text:"55 €"}),el("span",{text:"cap courses"})])
  ]));
  root.appendChild(el("div",{class:"card"},[
    el("h2",{text:"Tu manges"}),
    el("div",{class:"row"},[el("div",{class:"time",text:"midi"}),el("label",{text:menu.midi})]),
    el("div",{class:"row"},[el("div",{class:"time",text:"soir"}),el("label",{text:menu.soir})])
  ]));
  var dayCard=el("div",{class:"card"},[el("h2",{text:"La journee"})]);
  items.forEach(function(item){
    var box=el("input",{type:"checkbox"}); box.checked=!!checks[item.id];
    box.onchange=function(ev){ state.checks[key]=state.checks[key]||{}; state.checks[key][item.id]=ev.target.checked; save(state); renderToday(); };
    dayCard.appendChild(el("div",{class:"row"+(checks[item.id]?" done":"")},[
      el("div",{class:"time",text:item.t}), box,
      el("label",{},[el("span",{class:"pill "+tagClass(item.tag),text:item.tag||""}), document.createTextNode(" "+item.label)])
    ]));
  });
  var extraIn=el("input",{placeholder:"Ajouter une tache..."});
  var extraBtn=el("button",{text:"+";}); extraBtn.textContent="+";
  extraBtn.onclick=function(){ var v=extraIn.value.trim(); if(!v) return; state.extras[key]=state.extras[key]||[]; state.extras[key].push({t:"+",id:"x-"+Date.now(),label:v,tag:"kiff"}); save(state); renderToday(); };
  dayCard.appendChild(el("div",{class:"add"},[extraIn, extraBtn]));
  root.appendChild(dayCard);
  var stepIn=el("input",{type:"number",placeholder:"ex. 8420"}); stepIn.value=steps;
  var stepBtn=el("button",{class:"btn",text:"OK"});
  stepBtn.onclick=function(){ state.steps[key]=stepIn.value; save(state); renderToday(); };
  root.appendChild(el("div",{class:"card"},[
    el("h2",{text:"Pas — objectif 10 000"}),
    el("div",{class:"steps"},[stepIn, stepBtn]),
    el("p",{class:"tag",text:"Ecole x2 + salle/butte + Lepic + detour 15h15 + square"})
  ]));
}
function renderWeek(){
  var now=new Date(), root=document.getElementById("tab-week");
  while(root.firstChild) root.removeChild(root.firstChild);
  var box=el("input",{type:"checkbox"}); box.checked=!!state.wedEarly;
  box.onchange=function(e){ state.wedEarly=e.target.checked; save(state); renderAll(); };
  root.appendChild(el("div",{class:"wed"},[el("label",{},[box, document.createTextNode(" Mercredi : recup Logan a 11h30")])]));
  var wrap=el("div",{class:"week"});
  [1,2,3,4,5,6,0].forEach(function(d){
    var day=el("div",{class:"day"+(d===now.getDay()?" today":"")});
    day.appendChild(el("h3",{text:DAYSN[d]+(d===now.getDay()?" · aujourd hui":"")}));
    var ul=el("ul",{class:"plain"});
    WEEK[d].forEach(function(x){ ul.appendChild(el("li",{text:x})); });
    day.appendChild(ul);
    day.appendChild(el("div",{class:"tag",text:"midi "+MENUS[d].midi+" · soir "+MENUS[d].soir}));
    wrap.appendChild(day);
  });
  root.appendChild(wrap);
}
function renderShop(){
  var root=document.getElementById("tab-shop");
  while(root.firstChild) root.removeChild(root.firstChild);
  var got=Object.keys(state.shop).filter(function(k){return state.shop[k];}).length;
  var total=SHOP.veg.length+SHOP.frais.length+SHOP.epi.length;
  root.appendChild(el("div",{class:"stats"},[
    el("div",{class:"stat"},[el("b",{text:got+"/"+total}),el("span",{text:"coche"})]),
    el("div",{class:"stat"},[el("b",{text:"~44 €"}),el("span",{text:"liste"})]),
    el("div",{class:"stat"},[el("b",{text:"55 €"}),el("span",{text:"plafond"})])
  ]));
  var card=el("div",{class:"card"},[el("p",{class:"tag",text:"Coche le frigo ou le caddie. Lidl Belliard 47 rue Belliard."})]);
  ["veg","frais","epi"].forEach(function(cat){
    var block=el("div",{class:"shop-cat"},[el("h3",{text:SHOP_LABEL[cat]})]);
    SHOP[cat].forEach(function(item){
      var id=item[0], box=el("input",{type:"checkbox"}); box.checked=!!state.shop[id];
      box.onchange=function(){ state.shop[id]=box.checked; save(state); renderShop(); };
      block.appendChild(el("div",{class:"row"+(state.shop[id]?" done":"")},[box, el("label",{text:item[1]}), el("span",{class:"tag",text:item[2]+" €"})]));
    });
    card.appendChild(block);
  });
  var reset=el("button",{class:"btn ghost",text:"Tout decocher"});
  reset.onclick=function(){ state.shop={}; save(state); renderShop(); };
  card.appendChild(reset); root.appendChild(card);
}
function renderMore(){
  var root=document.getElementById("tab-more");
  while(root.firstChild) root.removeChild(root.firstChild);
  var kiffs=[["Lun soir","Rien. Atterrir."],["Mar 20h15","Apprendre 30 min"],["Mercredi aprem","Logan square Abbesses"],["Jeu 20h15","Truc a toi 45 min"],["Ven 16h30","Week-end. Stop Slack."],["Samedi","Marche Lepic + butte"],["Dimanche","Prep 45 min"]];
  var card=el("div",{class:"card"},[el("h2",{text:"Kiffs — 1 par creneau"})]);
  kiffs.forEach(function(pair,i){
    var box=el("input",{type:"checkbox"}); box.checked=!!state.checks["kiff-"+i];
    box.onchange=function(){ state.checks["kiff-"+i]=box.checked; save(state); };
    card.appendChild(el("div",{class:"row"},[box, el("label",{text:pair[0]+" — "+pair[1]})]));
  });
  root.appendChild(card);
  var ta=el("textarea",{rows:"4",placeholder:"notes..."}); ta.value=state.notes||"";
  var saveBtn=el("button",{text:"Enregistrer"}); saveBtn.onclick=function(){ state.notes=ta.value; save(state); };
  root.appendChild(el("div",{class:"card"},[el("h2",{text:"Notes"}), ta, el("div",{class:"add"},[saveBtn])]));
  root.appendChild(el("div",{class:"card"},[el("h2",{text:"Si ca derape"}), el("p",{text:"A normale · B cafe 3h · C ecole + repas + Logan. Interdit: taff apres 16h30."})]));
}
function renderAll(){ renderToday(); renderWeek(); renderShop(); renderMore(); }
document.querySelectorAll("nav.tabs button").forEach(function(btn){
  btn.onclick=function(){
    document.querySelectorAll("nav.tabs button").forEach(function(b){ b.classList.remove("on"); });
    btn.classList.add("on");
    ["today","week","shop","more"].forEach(function(t){ document.getElementById("tab-"+t).hidden = btn.getAttribute("data-tab")!==t; });
  };
});
renderAll();
setInterval(function(){ if(!document.getElementById("tab-today").hidden) renderToday(); }, 30000);
