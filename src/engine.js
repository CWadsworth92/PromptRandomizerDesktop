export const MASTER_CATEGORIES = [
  ["subject","Identity / Subject"],["participants","Participant Count"],["appearance","Physical Appearance"],["hair","Hair"],["wardrobe","Wardrobe"],["accessories","Accessories"],["pose","Pose & Body Language"],["interaction","Interaction"],["expression","Expression"],["action","Action"],["environment","Environment"],["setting","Set Dressing"],["time","Time of Day"],["weather","Weather"],["lighting","Lighting"],["color","Color Palette"],["camera","Camera & Lens"],["framing","Framing"],["composition","Composition"],["perspective","Perspective"],["focus","Focus & Depth"],["texture","Texture & Materials"],["atmosphere","Atmosphere"],["style","Visual Style"],["render","Render Quality"],["effects","Optical Effects"],["continuity","Continuity Rules"],["finish","Final Finish"]
];

const shared = {
  environment:["in a carefully dressed private interior with coherent spatial depth","in a cinematic modern suite with practical background details","in a secluded studio set with believable furnishings"],
  lighting:["shaped by soft directional window light and controlled fill","lit with warm practical lamps and a subtle edge light","modeled by low-key cinematic lighting with preserved skin detail"],
  camera:["photographed with a natural 50mm perspective and restrained lens character","captured with an 85mm portrait lens from a respectful working distance","shot with a 35mm environmental perspective that keeps the scene legible"],
  framing:["framed as a full-body composition with hands and feet visible","framed from mid-thigh upward while preserving the body gesture","composed as a wide environmental portrait with the subject placed in context"],
  composition:["balanced through clear foreground, subject, and background separation","arranged with an intentional diagonal flow through the full pose","composed with negative space and an uncluttered silhouette"],
  style:["rendered as polished contemporary editorial photography","treated as cinematic realism with natural skin texture","styled as a refined fashion campaign with believable materials"],
  finish:["finished with controlled contrast, clean anatomy, and natural micro-detail","finished with coherent shadows, restrained sharpening, and realistic texture","finished with filmic color response and a clean high-resolution presentation"]
};

const standardOnly = {
  subject:["an adult woman presented with a confident, natural presence","an adult subject whose distinctive character remains the visual anchor","an adult model presented with relaxed poise and an authentic presence"],
  participants:["one adult subject occupies the scene","two adult subjects share the frame with clear spatial separation","a small group of adult subjects forms a readable ensemble"],
  appearance:["with natural proportions, believable anatomy, and subtle skin texture","with an athletic silhouette described without changing identity","with a soft, natural silhouette and realistic physical detail"],
  hair:["with loose hair responding naturally to movement and light","with a clean styled updo that preserves facial identity","with textured hair rendered as individual strands rather than a solid shape"],
  wardrobe:["wearing a tailored contemporary outfit with realistic fabric behavior","wearing an elegant evening look with restrained detailing","wearing casual layered clothing with coherent materials and fit"],
  pose:["standing in a relaxed contrapposto pose with visible hands","seated naturally with a readable full-body gesture","moving through the scene with balanced weight and believable anatomy"],
  expression:["with a calm, self-assured expression and relaxed eyes","with a candid half-smile that feels unforced","with a focused editorial expression directed just off camera"]
};

const explicitOnly = {
  subject:["an adult character whose established identity remains unchanged","an adult performer described by role and staging without replacing identity","an adult model whose face, body, and defining traits follow the loaded character reference"],
  participants:["one adult subject is staged alone with the full figure clearly readable","two consenting adult partners share the scene with distinct poses and unobstructed anatomy","three consenting adults form a clearly separated arrangement with readable limbs","four or more consenting adults are staged with deliberate spacing and unambiguous anatomy"],
  appearance:["with mature adult anatomy, natural proportions, and realistic skin detail","with the full adult figure described through pose and silhouette rather than identity traits","with believable anatomy, visible body gesture, and consistent physical proportions"],
  wardrobe:["wearing explicitly revealing adult attire with realistic tension, fit, and material response","wearing minimal fetish-inspired styling with coherent accessories and exposed anatomy","wearing partially removed clothing that clearly follows the action and body position"],
  pose:["holding an explicit full-body pose with the pelvis, hands, and leg placement clearly visible","reclining in an uninhibited adult pose framed to show the complete body arrangement","kneeling in a deliberate erotic pose with anatomically coherent weight and limb placement"],
  interaction:["engaged in a clearly consensual explicit adult interaction with readable body positions","sharing intimate adult contact staged so each participant remains visually distinct","participating in an explicit encounter with clear consent, coherent anatomy, and unobstructed action"],
  expression:["with an intense adult expression that supports the scene without dominating the framing","with a candid expression of pleasure while the camera retains full-body context","with direct, self-possessed eye contact balanced against the visible body action"]
};

function makeOptions(id, label, source) {
  const values = source[id] || shared[id] || [`${label.toLowerCase()} rendered with coherent, scene-specific detail`,`${label.toLowerCase()} chosen to support the complete composition`,`${label.toLowerCase()} expressed through natural visual prose`];
  return values.map((text,index)=>({id:`${id}-${index+1}`,name:`${label} ${index+1}`,text,enabled:true}));
}
function config(mode) {
  const source = mode==="explicit" ? explicitOnly : standardOnly;
  return {version:1,profile:"krea2_natural",categories:MASTER_CATEGORIES.map(([id,name],index)=>({
    id,name,enabled:["subject","participants","environment","lighting","camera","framing","composition","style","finish"].includes(id),
    behavior:"choose_one",chance:100,order:index,options:makeOptions(id,name,source)
  }))};
}
export function createDefaultState(){
  return {activeMode:"standard",standard:{seed:randomSeed(),lora:false,loraTrigger:"",config:config("standard")},explicit:{seed:randomSeed(),lora:false,loraTrigger:"",config:config("explicit")}};
}
export function randomSeed(){return String(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER))}
function hash(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>((h=Math.imul(h^(h>>>15),2246822507))>>>0)/4294967296}
export function compose(modeState){
  const rnd=hash(modeState.seed), selected=[];
  if(modeState.lora && modeState.loraTrigger.trim()) selected.push(modeState.loraTrigger.trim());
  for(const c of [...modeState.config.categories].sort((a,b)=>a.order-b.order)){
    const pool=(c.options||[]).filter(x=>x.enabled!==false);
    if(!c.enabled||!pool.length||rnd()*100>Number(c.chance??100))continue;
    if(c.behavior==="combine_all") selected.push(...pool.map(x=>x.text));
    else selected.push(pool[Math.floor(rnd()*pool.length)].text);
  }
  return {prompt:selected.join(", ").replace(/\s+/g," ").trim(),count:selected.length};
}
export function normalizeImported(input,current){
  if(!input||!Array.isArray(input.categories))throw new Error("This JSON does not contain a categories array.");
  const existing=new Map((current?.categories||[]).map(c=>[c.id,c]));
  return {...input,categories:input.categories.map(c=>({...c,enabled:existing.has(c.id)?existing.get(c.id).enabled:false,behavior:existing.get(c.id)?.behavior||c.behavior||"choose_one"}))};
}
