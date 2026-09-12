import {createDefaultState,randomSeed,compose,normalizeImported} from "./engine.js";
const $=id=>document.getElementById(id);
let state=createDefaultState(), selectedId="subject";
const api=window.desktopAPI||{loadState:async()=>null,saveState:async()=>true,importConfig:async()=>null,exportConfig:async()=>false,copy:async text=>navigator.clipboard.writeText(text)};
const current=()=>state[state.activeMode];

function persist(){api.saveState(state)}
function render(){
  const mode=state.activeMode, data=current();
  $("modeToggle").checked=mode==="explicit"; $("modeStat").textContent=mode[0].toUpperCase()+mode.slice(1);
  $("categoryTitle").textContent=`${mode==="explicit"?"Explicit":"Standard"} Categories`;
  $("modeNotice").textContent=mode==="explicit"?"Adult-only generator. All participants must be consenting adults.":"Standard generator";
  $("seedInput").value=data.seed; $("seedStat").textContent=data.seed;
  $("loraToggle").checked=data.lora; $("loraTrigger").value=data.loraTrigger;
  const q=$("search").value.toLowerCase();
  $("categoryList").innerHTML=data.config.categories.filter(c=>c.name.toLowerCase().includes(q)).map(c=>`<label class="category ${c.id===selectedId?"selected":""}"><input type="checkbox" data-enable="${c.id}" ${c.enabled?"checked":""}><span data-select="${c.id}"><b>${c.name}</b><small>${c.behavior.replace("_"," ")}</small></span><span class="badge">${c.options?.length||0}</span></label>`).join("");
  let category=data.config.categories.find(c=>c.id===selectedId)||data.config.categories[0]; selectedId=category.id;
  $("categoryEditor").innerHTML=`<div class="category-detail"><h2>${category.name}</h2><p>Enable the category, then choose which options may enter the random pool.</p><label class="field"><span>Selection behavior</span><select id="behavior"><option value="choose_one" ${category.behavior==="choose_one"?"selected":""}>Choose one</option><option value="combine_all" ${category.behavior==="combine_all"?"selected":""}>Combine all enabled</option></select></label><div class="options">${(category.options||[]).map(o=>`<label class="option"><input type="checkbox" data-option="${o.id}" ${o.enabled!==false?"checked":""}><span><b>${o.name}</b><p>${o.text}</p></span></label>`).join("")}</div></div>`;
  $("behavior").onchange=e=>{category.behavior=e.target.value;update()};
  document.querySelectorAll("[data-enable]").forEach(el=>el.onchange=e=>{data.config.categories.find(c=>c.id===e.target.dataset.enable).enabled=e.target.checked;update()});
  document.querySelectorAll("[data-select]").forEach(el=>el.onclick=()=>{selectedId=el.dataset.select;render()});
  document.querySelectorAll("[data-option]").forEach(el=>el.onchange=e=>{category.options.find(o=>o.id===e.target.dataset.option).enabled=e.target.checked;update()});
  const result=compose(data); $("livePrompt").value=result.prompt; $("selectionStat").textContent=result.count;
}
function update(){persist();render()}
$("modeToggle").onchange=e=>{state.activeMode=e.target.checked?"explicit":"standard";selectedId="subject";update()};
$("seedInput").onchange=e=>{current().seed=e.target.value||randomSeed();update()};
$("rerollAll").onclick=$("rerollPrompt").onclick=()=>{current().seed=randomSeed();update()};
$("clearAll").onclick=()=>{current().config.categories.forEach(c=>c.enabled=false);update()};
$("loraToggle").onchange=e=>{current().lora=e.target.checked;update()};
$("loraTrigger").oninput=e=>{current().loraTrigger=e.target.value;persist();render()};
$("search").oninput=render;
$("copyPrompt").onclick=()=>api.copy($("livePrompt").value);
$("importConfig").onclick=async()=>{try{const imported=await api.importConfig();if(imported){current().config=normalizeImported(imported,current().config);update()}}catch(e){alert(e.message)}};
$("exportConfig").onclick=()=>api.exportConfig({mode:state.activeMode,config:current().config});
const saved=await api.loadState();if(saved?.standard?.config&&saved?.explicit?.config)state=saved;render();
