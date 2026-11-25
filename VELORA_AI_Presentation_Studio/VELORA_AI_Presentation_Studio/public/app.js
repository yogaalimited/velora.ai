const $ = (id) => document.getElementById(id);
let slides = [];
let selectedSlide = 0;
let theme = "midnight";
let deckTitle = "Your VELORA presentation";
let deckSubtitle = "";
let source = null;
const palettes = {
  midnight: { bg:"#17253c", accent:"#a89aff", text:"#ffffff", muted:"#a8b4ca" },
  ivory: { bg:"#f0e8d9", accent:"#aa8147", text:"#2a2c34", muted:"#77716a" },
  ocean: { bg:"#143746", accent:"#63c9c3", text:"#f5ffff", muted:"#b3d2d4" },
  clean: { bg:"#f3f5fa", accent:"#647ce7", text:"#172033", muted:"#78839a" }
};
function toast(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),3000); }
function escapeHtml(s="") { return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
document.querySelectorAll(".theme-option").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".theme-option").forEach(x=>x.classList.remove("selected")); btn.classList.add("selected"); theme=btn.dataset.theme; renderEditor();
}));
$("browseBtn").onclick=()=>$("sourceFile").click();
$("sourceFile").onchange=e=>{source=e.target.files[0]||null;$("fileName").textContent=source?source.name:"Up to 12 MB";};
const drop=$("dropZone");
drop.addEventListener("dragover",e=>{e.preventDefault();drop.style.borderColor="#8778ee";});
drop.addEventListener("dragleave",()=>drop.style.borderColor="");
drop.addEventListener("drop",e=>{e.preventDefault();drop.style.borderColor="";const f=e.dataTransfer.files[0];if(f){source=f;$("fileName").textContent=f.name;}});
async function generate(){
  const topic=$("topic").value.trim();
  if(!topic&&!source){toast("Add a topic or upload a document first.");return;}
  const btn=$("generateBtn");btn.disabled=true;btn.innerHTML="✦ Creating your presentation…";
  try{
    const fd=new FormData();fd.append("topic",topic);fd.append("count",$("count").value);fd.append("language",$("language").value);fd.append("audience",$("audience").value);fd.append("tone",$("tone").value);fd.append("instructions",$("instructions").value);if(source)fd.append("source",source);
    const r=await fetch("/api/generate",{method:"POST",body:fd});const data=await r.json();if(!r.ok)throw new Error(data.error||"Generation failed");
    slides=data.slides||[];deckTitle=data.title||topic||"Your presentation";deckSubtitle=data.subtitle||"AI-generated presentation draft";
    if(data.warning)toast(data.warning);else toast("Your presentation is ready.");
    selectedSlide=0;$("editorSection").classList.remove("hidden");$("deckTitle").textContent=deckTitle;$("deckSubtitle").textContent=deckSubtitle;renderEditor();$("editorSection").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(e){toast(e.message);}finally{btn.disabled=false;btn.innerHTML='<span>✦</span> Generate presentation <span class="arrow">↗</span>';}
}
$("generateBtn").onclick=generate;
function saveCurrent(){
  if(!slides[selectedSlide])return;
  slides[selectedSlide].title=$("editTitle").value;
  slides[selectedSlide].bullets=$("editBullets").value.split("\n").map(x=>x.trim()).filter(Boolean);
  slides[selectedSlide].notes=$("editNotes").value;
}
function renderEditor(){
  if(!slides.length)return;
  const p=palettes[theme];
  $("slideList").innerHTML=slides.map((s,i)=>`<button class="slide-thumb ${i===selectedSlide?"active":""}" data-index="${i}"><div class="thumb-art" style="background:${p.bg}"><b style="background:${p.text}"></b><i style="background:${p.muted}"></i><i style="background:${p.muted}"></i></div><small>${i+1}. ${escapeHtml(s.title)}</small></button>`).join("");
  document.querySelectorAll(".slide-thumb").forEach(b=>b.onclick=()=>{saveCurrent();selectedSlide=Number(b.dataset.index);renderEditor();});
  const s=slides[selectedSlide];$("editTitle").value=s.title||"";$("editBullets").value=(s.bullets||[]).join("\n");$("editNotes").value=s.notes||"";
  const bullets=(s.bullets||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  $("slideCanvas").style.background=p.bg;$("slideCanvas").style.color=p.text;
  $("slideCanvas").innerHTML=`<div class="canvas-kicker" style="color:${p.accent}">VELORA  /  ${String(selectedSlide+1).padStart(2,"0")}</div><h3>${escapeHtml(s.title)}</h3><ul style="color:${p.text}">${bullets}</ul><div class="canvas-foot" style="color:${p.muted}"><span>VELORA AI PRESENTATION</span><span>${selectedSlide+1} / ${slides.length}</span></div>`;
  $("slideCanvas").style.setProperty("--unused","0");
}
["editTitle","editBullets","editNotes"].forEach(id=>$(id).addEventListener("input",()=>{saveCurrent();const p=palettes[theme];const s=slides[selectedSlide];$("slideCanvas").querySelector("h3").textContent=s.title;$("slideCanvas").querySelector("ul").innerHTML=s.bullets.map(x=>`<li>${escapeHtml(x)}</li>`).join("");const label=$(`slideList`).querySelector(`[data-index="${selectedSlide}"] small`);if(label)label.textContent=`${selectedSlide+1}. ${s.title}`;}));
$("downloadBtn").onclick=async()=>{
  saveCurrent();const btn=$("downloadBtn");btn.disabled=true;btn.textContent="Preparing…";
  try{const r=await fetch("/api/export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slides,title:deckTitle,theme})});if(!r.ok){const e=await r.json();throw new Error(e.error||"Export failed");}
    const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(deckTitle.replace(/[^a-z0-9-_ ]/gi,"").trim().replace(/\s+/g,"-")||"velora")+".pptx";a.click();URL.revokeObjectURL(url);toast("PowerPoint downloaded successfully.");
  }catch(e){toast(e.message);}finally{btn.disabled=false;btn.textContent="↓ Export PPTX";}
};
$("regenerateBtn").onclick=()=>{ $("editorSection").classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"}); };
$("libraryNav").onclick=()=>toast("Your drafts are kept in this browser session. Export to save a copy.");
fetch("/api/health").then(r=>r.json()).then(d=>{$("apiStatus").textContent=d.aiConfigured?"AI engine connected":"Demo mode";}).catch(()=>{$("apiStatus").textContent="Offline";});
