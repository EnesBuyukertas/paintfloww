// @ts-nocheck
import { useState, useRef, useEffect } from “react”;

/* ═══════════════════════════════════════════
PALETTE
═══════════════════════════════════════════ */
const C = {
bg:        “#0E1116”,
surface:   “#161B22”,
surface2:  “#1C2128”,
border:    “#30363D”,
border2:   “#444C56”,
text:      “#E6EDF3”,
textSub:   “#8B949E”,
textDim:   “#484F58”,
accent:    “#388BFD”,
accentDim: “#1F4A8A”,
success:   “#2EA043”,
successDim:”#1A5C28”,
warn:      “#D29922”,
warnDim:   “#6E4F0A”,
danger:    “#DA3633”,
dangerDim: “#6E1C1A”,
};

const STEP_C = {
hazirlik: { bg:”#5A4A1A”, border:”#C49A2A”, text:”#EDD68A” },
boya:     { bg:”#1A3A6E”, border:”#388BFD”, text:”#90BEFF” },
cure:     { bg:”#3A1A6E”, border:”#8957E5”, text:”#C4A1FF” },
firin:    { bg:”#6E1A1A”, border:”#DA3633”, text:”#FF9090” },
};

const REZ_COLORS = [
“#388BFD”,”#2EA043”,”#DA3633”,”#D29922”,”#8957E5”,”#39C5CF”,”#F78166”,”#56D364”
];

/* ═══════════════════════════════════════════
DATA
═══════════════════════════════════════════ */
const PARCALAR = {
“P-1001”: { ad:“Ön Panel”,       boya_turu:“topcoat”, kat_sayisi:2, primer:true,  firin:true,  otomatik_kabin:true,  zimpara:true,  maske:false, min_kisi:2, max_kisi:4, islem_suresi_dk:90,  cure_suresi_dk:120, tools:[{tip:“Sprey Tabancası”,adet:2}], bina:“A” },
“P-1002”: { ad:“Yan Kapak”,      boya_turu:“primer”,  kat_sayisi:1, primer:true,  firin:false, otomatik_kabin:false, zimpara:false, maske:true,  min_kisi:1, max_kisi:2, islem_suresi_dk:60,  cure_suresi_dk:90,  tools:[{tip:“Sprey Tabancası”,adet:1},{tip:“Maske Seti”,adet:1}], bina:“B” },
“P-1003”: { ad:“Tavan Kirişi”,   boya_turu:“topcoat”, kat_sayisi:3, primer:true,  firin:true,  otomatik_kabin:true,  zimpara:true,  maske:true,  min_kisi:3, max_kisi:5, islem_suresi_dk:120, cure_suresi_dk:180, tools:[{tip:“Sprey Tabancası”,adet:3},{tip:“Maske Seti”,adet:2}], bina:“A” },
“P-1004”: { ad:“Alt Şasi”,       boya_turu:“primer”,  kat_sayisi:2, primer:false, firin:false, otomatik_kabin:false, zimpara:false, maske:false, min_kisi:2, max_kisi:3, islem_suresi_dk:75,  cure_suresi_dk:60,  tools:[{tip:“Sprey Tabancası”,adet:2}], bina:“C” },
“P-2001”: { ad:“Kapı Çerçevesi”, boya_turu:“topcoat”, kat_sayisi:2, primer:true,  firin:true,  otomatik_kabin:false, zimpara:true,  maske:true,  min_kisi:2, max_kisi:4, islem_suresi_dk:100, cure_suresi_dk:150, tools:[{tip:“Sprey Tabancası”,adet:2},{tip:“Maske Seti”,adet:3}], bina:“B” },
“P-2002”: { ad:“Arka Tampon”,    boya_turu:“topcoat”, kat_sayisi:2, primer:true,  firin:true,  otomatik_kabin:true,  zimpara:true,  maske:false, min_kisi:2, max_kisi:3, islem_suresi_dk:80,  cure_suresi_dk:110, tools:[{tip:“Sprey Tabancası”,adet:2}], bina:“A” },
“P-2003”: { ad:“Motor Kapağı”,   boya_turu:“topcoat”, kat_sayisi:3, primer:true,  firin:true,  otomatik_kabin:true,  zimpara:true,  maske:true,  min_kisi:3, max_kisi:5, islem_suresi_dk:110, cure_suresi_dk:160, tools:[{tip:“Sprey Tabancası”,adet:3},{tip:“Maske Seti”,adet:2}], bina:“A” },
};

const BINALAR = {
A:{ ad:“A Binası”, kabinler:[{id:“A-K1”,ad:“Kabin 1”,tip:“otomatik”,kapasite:4},{id:“A-K2”,ad:“Kabin 2”,tip:“otomatik”,kapasite:4},{id:“A-K3”,ad:“Kabin 3”,tip:“manuel”,kapasite:3}] },
B:{ ad:“B Binası”, kabinler:[{id:“B-K1”,ad:“Kabin 1”,tip:“manuel”,kapasite:2},{id:“B-K2”,ad:“Kabin 2”,tip:“manuel”,kapasite:3}] },
C:{ ad:“C Binası”, kabinler:[{id:“C-K1”,ad:“Kabin 1”,tip:“manuel”,kapasite:3},{id:“C-K2”,ad:“Kabin 2”,tip:“otomatik”,kapasite:5}] },
};

const TOOLS_ENV = { “Sprey Tabancası”:{toplam:8,mevcut:6}, “Maske Seti”:{toplam:5,mevcut:4}, “Maske Aparatı”:{toplam:3,mevcut:3} };

const PERSONEL = [
{id:“U1”,ad:“Ahmet Yılmaz”, vardiya:“sabah”,         musait:true},
{id:“U2”,ad:“Mehmet Kaya”,  vardiya:“sabah”,         musait:true},
{id:“U3”,ad:“Ali Demir”,    vardiya:“sabah”,         musait:false},
{id:“U4”,ad:“Hasan Çelik”,  vardiya:“öğleden sonra”, musait:true},
{id:“U5”,ad:“Mustafa Avcı”, vardiya:“öğleden sonra”, musait:true},
{id:“U6”,ad:“İbrahim Kurt”, vardiya:“öğleden sonra”, musait:true},
];

/* ═══════════════════════════════════════════
PLAN ENGINE
═══════════════════════════════════════════ */
function planOlustur(parcaNo, teslimTarihi) {
const p = PARCALAR[parcaNo]; if (!p) return null;
const teslim = new Date(teslimTarihi);
let toplamDk = 0;
for (let i = 0; i < p.kat_sayisi; i++) toplamDk += p.islem_suresi_dk + p.cure_suresi_dk;
if (p.zimpara) toplamDk += 30; if (p.maske) toplamDk += 20; if (p.firin) toplamDk += 60;
if (p.primer) toplamDk += p.islem_suresi_dk/2 + p.cure_suresi_dk/2;
const bas = new Date(teslim.getTime() - toplamDk*60000);
const adimlar=[]; let sure=0;
const push=(ad,s,tip)=>{ adimlar.push({ad,sure:s,baslangic:new Date(bas.getTime()+sure*60000),tip}); sure+=s; };
if (p.maske)   push(“Maskeleme”,20,“hazirlik”);
if (p.zimpara) push(“Zımparalama”,30,“hazirlik”);
if (p.primer)  { push(“Primer Uygulama”,p.islem_suresi_dk/2,“boya”); push(“Primer Kurutma”,p.cure_suresi_dk/2,“cure”); }
for (let k=1;k<=p.kat_sayisi;k++) {
push(`${p.boya_turu==="topcoat"?"Topcoat":"Boya"} - ${k}. Kat`,p.islem_suresi_dk,“boya”);
push(`Cure - ${k}. Kat`,p.cure_suresi_dk,“cure”);
}
if (p.firin) push(“Fırın”,60,“firin”);
const bina=BINALAR[p.bina];
const kabin=bina.kabinler.find(k=>p.otomatik_kabin?k.tip===“otomatik”:k.tip===“manuel”)||bina.kabinler[0];
const personel=PERSONEL.filter(x=>x.musait).slice(0,p.max_kisi);
const tools=p.tools.filter(t=>t.adet>0).map(t=>({…t,mevcut:TOOLS_ENV[t.tip]?.mevcut??0,yeterli:(TOOLS_ENV[t.tip]?.mevcut??0)>=t.adet}));
return {parca:p,parcaNo,baslangic:bas,teslim,toplamDk,adimlar,bina:bina.ad,kabin,personel,tools,
rezervasyonMumkun:personel.length>=p.min_kisi&&tools.every(t=>t.yeterli)};
}

/* ═══════════════════════════════════════════
HELPERS
═══════════════════════════════════════════ */
function fmtDT(d)  { if(!d)return”-”; return new Date(d).toLocaleString(“tr-TR”,{day:“2-digit”,month:“2-digit”,year:“numeric”,hour:“2-digit”,minute:“2-digit”}); }
function fmtTime(d){ return new Date(d).toLocaleTimeString(“tr-TR”,{hour:“2-digit”,minute:“2-digit”}); }
function fmtDate(d){ return new Date(d).toLocaleDateString(“tr-TR”,{day:“2-digit”,month:“2-digit”,year:“numeric”}); }
function fmtSure(dk){ const s=Math.floor(dk/60),m=dk%60; return s>0?`${s}s${m>0?" "+m+"dk":""}`:`${m}dk`; }
function minTarih(){ const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,16); }

/* ═══════════════════════════════════════════
EXCEL EXPORT (SheetJS CDN)
═══════════════════════════════════════════ */
function loadXLSX() {
return new Promise((resolve,reject)=>{
if (window.XLSX) { resolve(window.XLSX); return; }
const s=document.createElement(“script”);
s.src=“https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js”;
s.onload=()=>resolve(window.XLSX);
s.onerror=reject;
document.head.appendChild(s);
});
}

async function exportToExcel(rezervasyonlar) {
const XLSX = await loadXLSX();

// Sheet 1: Rezervasyon listesi
const rezRows = rezervasyonlar.map(r=>({
“Rezervasyon No”:  r.id,
“Parça No”:        r.parcaNo,
“Parça Adı”:       r.parcaAd,
“Bina”:            r.bina,
“Kabin”:           r.kabin,
“Başlangıç”:       fmtDT(r.baslangic),
“Teslim”:          fmtDT(r.teslim),
“Toplam Süre”:     fmtSure(r.toplamDk),
“Personel Sayısı”: r.personelSayisi,
“Durum”:           r.durum,
}));

// Sheet 2: Adım detayları
const adimRows = [];
rezervasyonlar.forEach(r=>{
r.adimlar.forEach(a=>{
adimRows.push({
“Rezervasyon No”: r.id,
“Parça No”:       r.parcaNo,
“Parça Adı”:      r.parcaAd,
“Adım”:           a.ad,
“Tip”:            a.tip,
“Başlangıç”:      fmtDT(a.baslangic),
“Bitiş”:          fmtDT(new Date(new Date(a.baslangic).getTime()+a.sure*60000)),
“Süre (dk)”:      a.sure,
});
});
});

const wb = XLSX.utils.book_new();
const ws1 = XLSX.utils.json_to_sheet(rezRows);
const ws2 = XLSX.utils.json_to_sheet(adimRows);

// Column widths
ws1[”!cols”]=[{wch:16},{wch:10},{wch:18},{wch:10},{wch:10},{wch:18},{wch:18},{wch:12},{wch:14},{wch:12}];
ws2[”!cols”]=[{wch:16},{wch:10},{wch:18},{wch:22},{wch:10},{wch:18},{wch:18},{wch:10}];

XLSX.utils.book_append_sheet(wb,ws1,“Rezervasyonlar”);
XLSX.utils.book_append_sheet(wb,ws2,“İşlem Adımları”);

const now = new Date().toISOString().slice(0,10);
XLSX.writeFile(wb,`PaintFlow_${now}.xlsx`);
}

/* ═══════════════════════════════════════════
SHARED ATOMS
═══════════════════════════════════════════ */
const card  = { background:C.surface,  borderRadius:12, padding:16, border:`1px solid ${C.border}` };
const card2 = { background:C.surface2, borderRadius:10, padding:14, border:`1px solid ${C.border}` };
const sHdr  = { fontSize:10, fontWeight:700, color:C.textDim, letterSpacing:2, textTransform:“uppercase”, marginBottom:10 };
const iStyle= { width:“100%”, background:C.bg, border:`1px solid ${C.border2}`, borderRadius:8, padding:“12px 14px”, color:C.text, fontSize:15, fontFamily:“inherit”, outline:“none”, boxSizing:“border-box”, WebkitAppearance:“none” };
const lStyle= { fontSize:10, fontWeight:700, color:C.textDim, letterSpacing:2, textTransform:“uppercase”, display:“block”, marginBottom:6 };

function Chip({label,bg,fg=”#fff”}) {
return <span style={{padding:“2px 8px”,borderRadius:4,fontSize:10,fontWeight:700,color:fg,background:bg,whiteSpace:“nowrap”,letterSpacing:0.3}}>{label}</span>;
}

function Btn({children,onClick,ghost,danger,style:{…sx}={}}){
return(
<button onClick={onClick} style={{
flex:1,padding:“12px”,border:`1px solid ${danger?C.danger:ghost?C.border2:C.accent}`,
borderRadius:8,background:danger?C.dangerDim:ghost?C.surface:C.accentDim,
color:danger?C.danger:ghost?C.textSub:C.accent,
fontSize:14,fontWeight:700,fontFamily:“inherit”,cursor:“pointer”,letterSpacing:0.3,…sx
}}>{children}</button>
);
}

function Sheet({children,onClose,tall}){
return(
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,0.85)”,display:“flex”,alignItems:“flex-end”,zIndex:200}} onClick={onClose}>
<div style={{…card,borderRadius:“16px 16px 0 0”,padding:20,width:“100%”,boxSizing:“border-box”,maxHeight:tall?“90vh”:“auto”,overflowY:tall?“auto”:“visible”,borderBottom:“none”}} onClick={e=>e.stopPropagation()}>
<div style={{width:32,height:3,background:C.border2,borderRadius:2,margin:“0 auto 16px”}}/>
{children}
</div>
</div>
);
}

/* ═══════════════════════════════════════════
PARÇA SEÇİCİ
═══════════════════════════════════════════ */
function ParcaSecici({value,onChange}){
const [open,setOpen]=useState(false);
const [q,setQ]=useState(””);
const ref=useRef();
useEffect(()=>{
if(!open)return;
const fn=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
document.addEventListener(“mousedown”,fn);
return ()=>document.removeEventListener(“mousedown”,fn);
},[open]);

const list=Object.entries(PARCALAR).filter(([k,v])=>
!q||k.includes(q.toUpperCase())||v.ad.toLowerCase().includes(q.toLowerCase())
);

return(
<div ref={ref} style={{position:“relative”}}>
<div style={{…iStyle,display:“flex”,alignItems:“center”,justifyContent:“space-between”,cursor:“pointer”,userSelect:“none”}} onClick={()=>setOpen(o=>!o)}>
<span style={{color:value?C.text:C.textDim,fontSize:14}}>{value?`${value} — ${PARCALAR[value]?.ad}`:“Parça numarası seçin…”}</span>
<span style={{color:C.textDim,fontSize:10,transform:open?“rotate(180deg)”:“none”,transition:“transform 0.15s”}}>▼</span>
</div>
{open&&(
<div style={{position:“absolute”,top:“calc(100% + 4px)”,left:0,right:0,background:C.surface,border:`1px solid ${C.border2}`,borderRadius:10,zIndex:100,overflow:“hidden”,boxShadow:“0 12px 32px rgba(0,0,0,0.6)”}}>
<div style={{padding:8,borderBottom:`1px solid ${C.border}`}}>
<input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder=“Ara…”
style={{…iStyle,fontSize:13,padding:“8px 10px”,borderRadius:6}}/>
</div>
<div style={{maxHeight:220,overflowY:“auto”}}>
{list.length===0&&<div style={{padding:“12px 14px”,color:C.textSub,fontSize:13}}>Sonuç yok</div>}
{list.map(([k,v])=>(
<div key={k} onClick={()=>{onChange(k);setOpen(false);setQ(””);}}
style={{padding:“10px 14px”,cursor:“pointer”,display:“flex”,justifyContent:“space-between”,alignItems:“center”,borderBottom:`1px solid ${C.border}`,background:value===k?C.surface2:“transparent”}}
onMouseEnter={e=>e.currentTarget.style.background=C.surface2}
onMouseLeave={e=>e.currentTarget.style.background=value===k?C.surface2:“transparent”}>
<div>
<span style={{fontWeight:700,fontSize:13,color:C.text,marginRight:8}}>{k}</span>
<span style={{fontSize:12,color:C.textSub}}>{v.ad}</span>
</div>
<div style={{display:“flex”,gap:4}}>
<Chip label={v.boya_turu} bg={v.boya_turu===“topcoat”?C.accentDim:C.successDim} fg={v.boya_turu===“topcoat”?C.accent:C.success}/>
<Chip label={`${v.kat_sayisi}k`} bg={C.surface2} fg={C.textSub}/>
</div>
</div>
))}
</div>
</div>
)}
</div>
);
}

/* ═══════════════════════════════════════════
ROOT APP
═══════════════════════════════════════════ */
export default function App(){
const [tab,setTab]=useState(“rez”);
const [parcaNo,setParcaNo]=useState(””);
const [teslim,setTeslim]=useState(””);
const [plan,setPlan]=useState(null);
const [hata,setHata]=useState(””);
const [rezervasyonlar,setRezervasyonlar]=useState([]);
const [onayModal,setOnayModal]=useState(false);
const [detayRez,setDetayRez]=useState(null);
const [silOnay,setSilOnay]=useState(null);
const [adimDetay,setAdimDetay]=useState(null); // {adim, rez}

const secili=PARCALAR[parcaNo];

function hesapla(){
setHata(””);
if(!parcaNo) return setHata(“Parça numarası seçin.”);
if(!teslim)  return setHata(“Teslim tarihi seçin.”);
const r=planOlustur(parcaNo,teslim);
if(!r) return setHata(“Parça bulunamadı.”);
setPlan(r);
}

function onayla(){
if(!plan)return;
setRezervasyonlar(prev=>[{
id:`REZ-${String(prev.length+1).padStart(3,"0")}`,
parcaNo:plan.parcaNo, parcaAd:plan.parca.ad,
bina:plan.bina, kabin:plan.kabin.ad,
baslangic:plan.baslangic, teslim:plan.teslim,
personelSayisi:plan.personel.length,
personelAdlari:plan.personel.map(p=>p.ad),
adimlar:plan.adimlar, tools:plan.tools,
durum:“Planlandı”, toplamDk:plan.toplamDk,
},…prev]);
setPlan(null); setParcaNo(””); setTeslim(””); setOnayModal(false); setTab(“liste”);
}

function sil(id){
setRezervasyonlar(prev=>prev.filter(r=>r.id!==id));
setSilOnay(null);
if(detayRez?.id===id) setDetayRez(null);
}

const TABS=[
{id:“rez”,     icon:“＋”, label:“Rezervasyon”},
{id:“liste”,   icon:“≡”,  label:“Liste”},
{id:“takvim”,  icon:“◫”,  label:“Takvim”},
{id:“kabinler”,icon:“⬚”,  label:“Kabinler”},
{id:“envanter”,icon:“⚙”,  label:“Envanter”},
];

return(
<div style={{minHeight:“100vh”,background:C.bg,color:C.text,fontFamily:”‘SF Mono’,‘Fira Code’,‘Courier New’,monospace”,display:“flex”,flexDirection:“column”}}>

```
  {/* HEADER */}
  <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
    <div style={{width:30,height:30,borderRadius:7,background:C.accentDim,border:`1px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎨</div>
    <div style={{flex:1}}>
      <div style={{fontWeight:800,fontSize:14,letterSpacing:2,color:C.text}}>PAINTFLOW</div>
      <div style={{fontSize:9,color:C.textDim,letterSpacing:2}}>BOYA REZERVASYON SİSTEMİ</div>
    </div>
    <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",textAlign:"center",minWidth:42}}>
      <div style={{fontSize:15,fontWeight:700,color:C.accent,lineHeight:1}}>{rezervasyonlar.length}</div>
      <div style={{fontSize:8,color:C.textDim,marginTop:1,letterSpacing:1}}>PLAN</div>
    </div>
  </div>

  {/* CONTENT */}
  <div style={{flex:1,overflowY:"auto",paddingBottom:66}}>
    {tab==="rez"     &&<RezTab parcaNo={parcaNo} setParcaNo={setParcaNo} teslim={teslim} setTeslim={setTeslim} plan={plan} hata={hata} secili={secili} onHesapla={hesapla} onOnayla={()=>setOnayModal(true)}/>}
    {tab==="liste"   &&<ListeTab rezervasyonlar={rezervasyonlar} onDetay={setDetayRez} onSilOnay={setSilOnay}/>}
    {tab==="takvim"  &&<TakvimTab rezervasyonlar={rezervasyonlar} onDetay={setDetayRez} onAdimDetay={setAdimDetay}/>}
    {tab==="kabinler"&&<KabinTab/>}
    {tab==="envanter"&&<EnvanterTab/>}
  </div>

  {/* BOTTOM NAV */}
  <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:50}}>
    {TABS.map(t=>(
      <button key={t.id} onClick={()=>setTab(t.id)}
        style={{flex:1,padding:"8px 0 11px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <span style={{fontSize:15,opacity:tab===t.id?1:0.25}}>{t.icon}</span>
        <span style={{fontSize:9,color:tab===t.id?C.accent:C.textDim,fontFamily:"inherit",fontWeight:tab===t.id?700:400,letterSpacing:0.4}}>{t.label}</span>
        {tab===t.id&&<span style={{width:14,height:2,background:C.accent,borderRadius:1}}/>}
      </button>
    ))}
  </div>

  {/* ONAY MODAL */}
  {onayModal&&plan&&(
    <Sheet onClose={()=>setOnayModal(false)}>
      <div style={{fontSize:16,fontWeight:700,marginBottom:5}}>Rezervasyonu Onayla</div>
      <div style={{color:C.textSub,fontSize:13,marginBottom:14}}><strong style={{color:C.text}}>{plan.parcaNo}</strong> — {plan.parca.ad}</div>
      <div style={{...card2,marginBottom:16,display:"flex",flexDirection:"column",gap:6,fontSize:13,color:C.textSub}}>
        <div>Başlangıç: <strong style={{color:C.text}}>{fmtDT(plan.baslangic)}</strong></div>
        <div>Teslim:    <strong style={{color:C.text}}>{fmtDT(plan.teslim)}</strong></div>
        <div>{plan.bina} / {plan.kabin.ad} · {plan.personel.length} kişi · {fmtSure(plan.toplamDk)}</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn ghost onClick={()=>setOnayModal(false)}>İptal</Btn>
        <Btn onClick={onayla} style={{flex:2}}>✓ Onayla</Btn>
      </div>
    </Sheet>
  )}

  {/* SİL ONAY */}
  {silOnay&&(
    <Sheet onClose={()=>setSilOnay(null)}>
      <div style={{fontSize:16,fontWeight:700,marginBottom:5,color:C.danger}}>Rezervasyonu Sil</div>
      <div style={{color:C.textSub,fontSize:13,marginBottom:18}}><strong style={{color:C.text}}>{silOnay}</strong> kalıcı olarak silinecek.</div>
      <div style={{display:"flex",gap:10}}>
        <Btn ghost onClick={()=>setSilOnay(null)}>İptal</Btn>
        <Btn danger onClick={()=>sil(silOnay)} style={{flex:2}}>Evet, Sil</Btn>
      </div>
    </Sheet>
  )}

  {/* REZ DETAY */}
  {detayRez&&(
    <Sheet onClose={()=>setDetayRez(null)} tall>
      <DetayIcerik rez={detayRez} onClose={()=>setDetayRez(null)} onSil={()=>{setSilOnay(detayRez.id);setDetayRez(null);}}/>
    </Sheet>
  )}

  {/* ADIM DETAY */}
  {adimDetay&&(
    <Sheet onClose={()=>setAdimDetay(null)}>
      <AdimDetay adim={adimDetay.adim} rez={adimDetay.rez} onClose={()=>setAdimDetay(null)}/>
    </Sheet>
  )}
</div>
```

);
}

/* ═══════════════════════════════════════════
ADIM DETAY SHEET
═══════════════════════════════════════════ */
function AdimDetay({adim,rez,onClose}){
const sc=STEP_C[adim.tip];
const bitis=new Date(new Date(adim.baslangic).getTime()+adim.sure*60000);
return(
<div>
<div style={{display:“flex”,alignItems:“center”,gap:10,marginBottom:14}}>
<div style={{width:4,height:40,borderRadius:2,background:sc.border}}/>
<div>
<div style={{fontSize:10,color:C.textDim,letterSpacing:1.5,textTransform:“uppercase”,marginBottom:2}}>{adim.tip}</div>
<div style={{fontSize:18,fontWeight:800,color:sc.text}}>{adim.ad}</div>
</div>
</div>
<div style={{…card2,marginBottom:14,display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10}}>
{[
{label:“Başlangıç”,val:fmtDT(adim.baslangic),col:sc.border},
{label:“Bitiş”,    val:fmtDT(bitis),          col:sc.border},
{label:“Süre”,     val:fmtSure(adim.sure),    col:sc.border},
{label:“Rezervasyon”,val:rez.id,               col:sc.border},
].map((k,i)=>(
<div key={i} style={{background:C.bg,borderRadius:8,padding:10,borderLeft:`2px solid ${k.col}`}}>
<div style={{fontSize:9,color:C.textDim,textTransform:“uppercase”,letterSpacing:1.5}}>{k.label}</div>
<div style={{fontSize:12,fontWeight:700,color:k.col,marginTop:3,wordBreak:“break-word”}}>{k.val}</div>
</div>
))}
</div>
<div style={{...card2,marginBottom:14,fontSize:13,color:C.textSub}}>
<div style={{marginBottom:4}}>Parça: <strong style={{color:C.text}}>{rez.parcaNo} — {rez.parcaAd}</strong></div>
<div>Kabin: <strong style={{color:C.text}}>{rez.bina} / {rez.kabin}</strong></div>
</div>
<Btn onClick={onClose} style={{width:“100%”}}>Kapat</Btn>
</div>
);
}

/* ═══════════════════════════════════════════
REZ TAB
═══════════════════════════════════════════ */
function RezTab({parcaNo,setParcaNo,teslim,setTeslim,plan,hata,secili,onHesapla,onOnayla}){
return(
<div style={{padding:16,display:“flex”,flexDirection:“column”,gap:12}}>
<div>
<div style={{fontSize:18,fontWeight:800,letterSpacing:0.3}}>Yeni Boya Planı</div>
<div style={{fontSize:12,color:C.textSub,marginTop:2}}>Parça no ve teslim tarihini girin</div>
</div>

```
  <div style={card}>
    <div style={{marginBottom:14}}>
      <label style={lStyle}>Parça Numarası</label>
      <ParcaSecici value={parcaNo} onChange={setParcaNo}/>
      {secili&&(
        <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
          {secili.firin  &&<Chip label="Fırın"   bg={STEP_C.firin.bg}   fg={STEP_C.firin.text}/>}
          {secili.zimpara&&<Chip label="Zımpara" bg={STEP_C.hazirlik.bg} fg={STEP_C.hazirlik.text}/>}
          {secili.maske  &&<Chip label="Maske"   bg="#2A1A4A"            fg="#C4A1FF"/>}
          <Chip label={`${secili.kat_sayisi} kat`} bg={C.surface2} fg={C.textSub}/>
          <Chip label={`min ${secili.min_kisi} kişi`} bg={C.surface2} fg={C.textSub}/>
        </div>
      )}
    </div>

    <div style={{marginBottom:14}}>
      <label style={lStyle}>Teslim Tarihi &amp; Saati</label>
      <input type="datetime-local" min={minTarih()} value={teslim} onChange={e=>setTeslim(e.target.value)} style={iStyle}/>
    </div>

    {hata&&<div style={{background:C.dangerDim,border:`1px solid ${C.danger}`,color:"#FF8080",borderRadius:6,padding:"8px 12px",fontSize:12,marginBottom:12}}>⚠ {hata}</div>}

    <button onClick={onHesapla} style={{width:"100%",background:C.accentDim,border:`1px solid ${C.accent}`,borderRadius:8,padding:13,color:C.accent,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.5}}>
      Plan Oluştur →
    </button>
  </div>

  {plan&&(
    <>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[
          {l:"Başlangıç",  v:fmtDT(plan.baslangic), c:C.accent},
          {l:"Toplam Süre",v:fmtSure(plan.toplamDk),c:"#8957E5"},
          {l:"Kabin",      v:`${plan.bina}/${plan.kabin.ad}`,c:C.warn},
          {l:"Personel",   v:`${plan.personel.length} kişi`,c:C.success},
        ].map((k,i)=>(
          <div key={i} style={{...card2,borderTop:`2px solid ${k.c}`,padding:10}}>
            <div style={{fontSize:9,color:C.textDim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>{k.l}</div>
            <div style={{fontSize:12,fontWeight:700,color:k.c,wordBreak:"break-word"}}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={sHdr}>İşlem Adımları</div>
        {plan.adimlar.map((a,i)=>{
          const sc=STEP_C[a.tip];
          return(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:i<plan.adimlar.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:3,alignSelf:"stretch",borderRadius:2,background:sc.border,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:12,color:sc.text}}>{a.ad}</div>
                <div style={{fontSize:10,color:C.textDim,marginTop:1}}>{fmtDT(a.baslangic)}</div>
              </div>
              <div style={{color:sc.border,fontWeight:700,fontSize:11}}>{fmtSure(a.sure)}</div>
            </div>
          );
        })}
      </div>

      <div style={card}>
        <div style={sHdr}>Personel</div>
        {plan.personel.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:C.accentDim,border:`1px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.accent,flexShrink:0}}>{p.ad[0]}</div>
            <div style={{flex:1,fontSize:12,color:C.text}}>{p.ad}</div>
            <Chip label="Müsait" bg={C.successDim} fg={C.success}/>
          </div>
        ))}
      </div>

      {plan.tools.length>0&&(
        <div style={card}>
          <div style={sHdr}>Toollar</div>
          {plan.tools.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<plan.tools.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{flex:1,fontSize:12,color:C.text}}>{t.tip}</div>
              <span style={{fontSize:11,color:C.textSub}}>×{t.adet}</span>
              <Chip label={t.yeterli?"OK":"EKSİK"} bg={t.yeterli?C.successDim:C.dangerDim} fg={t.yeterli?C.success:C.danger}/>
            </div>
          ))}
        </div>
      )}

      {!plan.rezervasyonMumkun&&<div style={{background:C.warnDim,border:`1px solid ${C.warn}`,color:C.warn,borderRadius:8,padding:"9px 12px",fontSize:12}}>⚠ Eksik kaynak. Manuel düzenleme gerekebilir.</div>}

      <button onClick={onOnayla} style={{width:"100%",background:C.successDim,border:`1px solid ${C.success}`,borderRadius:8,padding:13,color:C.success,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
        ✓ Rezervasyonu Onayla &amp; Kaydet
      </button>
    </>
  )}
</div>
```

);
}

/* ═══════════════════════════════════════════
LİSTE TAB
═══════════════════════════════════════════ */
function ListeTab({rezervasyonlar,onDetay,onSilOnay}){
return(
<div style={{padding:16}}>
<div style={{marginBottom:14}}>
<div style={{fontSize:18,fontWeight:800,letterSpacing:0.3}}>Rezervasyonlar</div>
<div style={{fontSize:12,color:C.textSub,marginTop:2}}>{rezervasyonlar.length} kayıt · detay için tıkla</div>
</div>
{rezervasyonlar.length===0?(
<div style={{…card,display:“flex”,flexDirection:“column”,alignItems:“center”,padding:“50px 20px”,gap:8,color:C.textDim}}>
<div style={{fontSize:36}}>◫</div>
<div style={{fontSize:14}}>Henüz rezervasyon yok</div>
</div>
):(
<div style={{display:“flex”,flexDirection:“column”,gap:8}}>
{rezervasyonlar.map((r,ri)=>{
const rc=REZ_COLORS[ri%REZ_COLORS.length];
return(
<div key={r.id} style={{…card,cursor:“pointer”,borderLeft:`3px solid ${rc}`}} onClick={()=>onDetay(r)}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:8}}>
<div>
<div style={{color:rc,fontSize:10,fontWeight:700,letterSpacing:1.5}}>{r.id}</div>
<div style={{fontSize:15,fontWeight:700,color:C.text}}>{r.parcaNo}</div>
<div style={{fontSize:12,color:C.textSub}}>{r.parcaAd}</div>
</div>
<div style={{display:“flex”,flexDirection:“column”,alignItems:“flex-end”,gap:5}}>
<Chip label={r.durum} bg={C.accentDim} fg={C.accent}/>
<button onClick={e=>{e.stopPropagation();onSilOnay(r.id);}}
style={{background:“none”,border:`1px solid ${C.border}`,borderRadius:4,color:C.danger,fontSize:10,padding:“2px 7px”,cursor:“pointer”,fontFamily:“inherit”}}>
Sil
</button>
</div>
</div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:“3px 8px”,fontSize:11,color:C.textSub}}>
<div>🏭 {r.bina} / {r.kabin}</div>
<div>👥 {r.personelSayisi} kişi</div>
<div>▶ {fmtDT(r.baslangic)}</div>
<div>🏁 {fmtDT(r.teslim)}</div>
</div>
</div>
);
})}
</div>
)}
</div>
);
}

/* ═══════════════════════════════════════════
DETAY İÇERİK
═══════════════════════════════════════════ */
function DetayIcerik({rez,onClose,onSil}){
return(
<div>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:12}}>
<div>
<div style={{color:C.accent,fontSize:10,fontWeight:700,letterSpacing:1.5}}>{rez.id}</div>
<div style={{fontSize:19,fontWeight:800}}>{rez.parcaNo}</div>
<div style={{fontSize:13,color:C.textSub}}>{rez.parcaAd}</div>
</div>
<Chip label={rez.durum} bg={C.accentDim} fg={C.accent}/>
</div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:8,marginBottom:12}}>
{[
{l:“Başlangıç”, v:fmtDT(rez.baslangic),  c:C.accent},
{l:“Teslim”,    v:fmtDT(rez.teslim),      c:C.success},
{l:“Bina/Kabin”,v:`${rez.bina}/${rez.kabin}`,c:C.warn},
{l:“Süre”,      v:fmtSure(rez.toplamDk),  c:”#8957E5”},
].map((k,i)=>(
<div key={i} style={{background:C.bg,borderRadius:8,padding:10,borderTop:`2px solid ${k.c}`}}>
<div style={{fontSize:9,color:C.textDim,textTransform:“uppercase”,letterSpacing:1.5}}>{k.l}</div>
<div style={{fontSize:11,fontWeight:700,color:k.c,marginTop:3,wordBreak:“break-word”}}>{k.v}</div>
</div>
))}
</div>
<div style={{...card,marginBottom:10}}>
<div style={sHdr}>İşlem Adımları</div>
{rez.adimlar.map((a,i)=>{
const sc=STEP_C[a.tip];
return(
<div key={i} style={{display:“flex”,alignItems:“flex-start”,gap:8,padding:“7px 0”,borderBottom:i<rez.adimlar.length-1?`1px solid ${C.border}`:“none”}}>
<div style={{width:3,alignSelf:“stretch”,borderRadius:2,background:sc.border,flexShrink:0}}/>
<div style={{flex:1}}>
<div style={{fontSize:12,fontWeight:600,color:sc.text}}>{a.ad}</div>
<div style={{fontSize:10,color:C.textDim,marginTop:1}}>{fmtDT(a.baslangic)}</div>
</div>
<div style={{color:sc.border,fontWeight:700,fontSize:11}}>{fmtSure(a.sure)}</div>
</div>
);
})}
</div>
<div style={{...card,marginBottom:10}}>
<div style={sHdr}>Personel</div>
{rez.personelAdlari.map((ad,i)=>(
<div key={i} style={{display:“flex”,alignItems:“center”,gap:8,padding:“6px 0”,borderBottom:i<rez.personelAdlari.length-1?`1px solid ${C.border}`:“none”}}>
<div style={{width:26,height:26,borderRadius:“50%”,background:C.accentDim,border:`1px solid ${C.accent}`,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:11,fontWeight:700,color:C.accent}}>{ad[0]}</div>
<span style={{fontSize:12,color:C.text}}>{ad}</span>
</div>
))}
</div>
{rez.tools.length>0&&(
<div style={{...card,marginBottom:12}}>
<div style={sHdr}>Toollar</div>
{rez.tools.map((t,i)=>(
<div key={i} style={{display:“flex”,alignItems:“center”,gap:8,padding:“6px 0”,borderBottom:i<rez.tools.length-1?`1px solid ${C.border}`:“none”}}>
<div style={{flex:1,fontSize:12,color:C.text}}>{t.tip}</div>
<Chip label={t.yeterli?“OK”:“EKSİK”} bg={t.yeterli?C.successDim:C.dangerDim} fg={t.yeterli?C.success:C.danger}/>
</div>
))}
</div>
)}
<div style={{display:“flex”,gap:10}}>
<Btn danger onClick={onSil}>Sil</Btn>
<Btn onClick={onClose} style={{flex:2}}>Kapat</Btn>
</div>
</div>
);
}

/* ═══════════════════════════════════════════
TAKVİM TAB  (tamamen yeniden tasarlandı)
═══════════════════════════════════════════ */

// Zoom konfigürasyonları
const ZOOMS = [
{ id:“1s”,  label:“1s”,   dk:60,    tikDk:10,   dateFmt:(d)=>fmtTime(d) },
{ id:“12s”, label:“12s”,  dk:720,   tikDk:60,   dateFmt:(d)=>fmtTime(d) },
{ id:“1g”,  label:“1G”,   dk:1440,  tikDk:180,  dateFmt:(d)=>fmtTime(d) },
{ id:“7g”,  label:“7G”,   dk:10080, tikDk:1440, dateFmt:(d)=>new Date(d).toLocaleDateString(“tr-TR”,{weekday:“short”,day:“2-digit”}) },
{ id:“1ay”, label:“1A”,   dk:43200, tikDk:7200, dateFmt:(d)=>new Date(d).toLocaleDateString(“tr-TR”,{day:“2-digit”,month:“short”}) },
];

// Row height for each reservation: main bar + step bar + padding
const ROW_H = 58;
const BAR_TOP = 8;
const BAR_H  = 20;
const STEP_TOP = 32;
const STEP_H   = 14;
const LABEL_W  = 70;

function TakvimTab({rezervasyonlar,onDetay,onAdimDetay}){
const [zoomId,setZoomId]=useState(“7g”);
const [anchor,setAnchor]=useState(()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; });
const [exporting,setExporting]=useState(false);

const zoom=ZOOMS.find(z=>z.id===zoomId)||ZOOMS[3];
const winMs =zoom.dk*60000;
const tikMs =zoom.tikDk*60000;
const viewStart=anchor;
const viewEnd  =new Date(anchor.getTime()+winMs);

// Build ticks — start from first tick >= anchor
const ticks=[];
let tk=new Date(Math.ceil(anchor.getTime()/tikMs)*tikMs);
while(tk<=viewEnd){ ticks.push(new Date(tk)); tk=new Date(tk.getTime()+tikMs); }

const pct=d=>((new Date(d)-viewStart)/winMs)*100;
const wPct=(a,b)=>Math.max(((new Date(b)-new Date(a))/winMs)*100,0.5);

function shift(n){ setAnchor(prev=>new Date(prev.getTime()+n*winMs)); }
function goNow(){ const d=new Date(); if(zoomId===“1s”||zoomId===“12s”){}else d.setHours(0,0,0,0); setAnchor(d); }

async function doExport(){
if(!rezervasyonlar.length)return;
setExporting(true);
try{ await exportToExcel(rezervasyonlar); }catch(e){ alert(“Export hatası: “+e.message); }
setExporting(false);
}

const nowPct=pct(new Date());

return(
<div style={{padding:16}}>
{/* Başlık */}
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:12}}>
<div>
<div style={{fontSize:18,fontWeight:800,letterSpacing:0.3}}>Takvim</div>
<div style={{fontSize:11,color:C.textSub,marginTop:1}}>
{viewStart.toLocaleDateString(“tr-TR”,{day:“2-digit”,month:“short”,year:“numeric”})} — {viewEnd.toLocaleDateString(“tr-TR”,{day:“2-digit”,month:“short”,year:“numeric”})}
</div>
</div>
<button onClick={doExport} disabled={exporting||!rezervasyonlar.length}
style={{padding:“8px 12px”,background:rezervasyonlar.length?C.successDim:C.surface2,border:`1px solid ${rezervasyonlar.length?C.success:C.border}`,borderRadius:7,color:rezervasyonlar.length?C.success:C.textDim,fontSize:11,fontWeight:700,fontFamily:“inherit”,cursor:rezervasyonlar.length?“pointer”:“default”,letterSpacing:0.5}}>
{exporting?”…”:“⬇ Excel”}
</button>
</div>

```
  {/* Zoom + Nav */}
  <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
    {/* Zoom pills */}
    <div style={{display:"flex",gap:4,background:C.surface2,borderRadius:8,padding:3,border:`1px solid ${C.border}`}}>
      {ZOOMS.map(z=>(
        <button key={z.id} onClick={()=>setZoomId(z.id)}
          style={{padding:"5px 9px",border:"none",borderRadius:5,background:zoomId===z.id?C.accentDim:"transparent",color:zoomId===z.id?C.accent:C.textSub,fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",transition:"all 0.1s"}}>
          {z.label}
        </button>
      ))}
    </div>
    {/* Nav */}
    <div style={{display:"flex",gap:4,flex:1}}>
      <button onClick={()=>shift(-1)} style={{flex:1,padding:"7px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.textSub,fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>◀</button>
      <button onClick={goNow} style={{flex:2,padding:"7px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:10,fontWeight:700,fontFamily:"inherit",cursor:"pointer",letterSpacing:1}}>BUGÜN</button>
      <button onClick={()=>shift(1)}  style={{flex:1,padding:"7px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.textSub,fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>▶</button>
    </div>
  </div>

  {/* GANTT */}
  <div style={{...card,padding:0,overflow:"hidden"}}>

    {/* ── Zaman eksenı header ── */}
    <div style={{display:"flex",background:C.bg,borderBottom:`1px solid ${C.border}`,height:34}}>
      {/* Label alanı */}
      <div style={{width:LABEL_W,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 8px"}}>
        <span style={{fontSize:9,color:C.textDim,letterSpacing:1.5,textTransform:"uppercase"}}>Parça</span>
      </div>
      {/* Tick marks */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        {/* Bugün şeridi */}
        {nowPct>=0&&nowPct<=100&&(
          <div style={{position:"absolute",left:`${nowPct}%`,top:0,bottom:0,width:1,background:C.danger,opacity:0.5,zIndex:2}}/>
        )}
        {ticks.map((tk,i)=>{
          const lft=pct(tk);
          if(lft<0||lft>100)return null;
          return(
            <div key={i} style={{position:"absolute",left:`${lft}%`,top:0,bottom:0,pointerEvents:"none"}}>
              <div style={{position:"absolute",top:4,left:2,fontSize:9,color:C.textSub,whiteSpace:"nowrap",fontWeight:600}}>
                {zoom.dateFmt(tk)}
              </div>
              <div style={{position:"absolute",bottom:0,left:0,width:1,height:6,background:C.border2}}/>
            </div>
          );
        })}
      </div>
    </div>

    {/* ── Satırlar ── */}
    {rezervasyonlar.length===0?(
      <div style={{padding:"30px 16px",textAlign:"center",color:C.textDim,fontSize:13}}>
        Rezervasyon ekleyince burada görünür
      </div>
    ):(
      rezervasyonlar.map((r,ri)=>{
        const rc=REZ_COLORS[ri%REZ_COLORS.length];
        const rBas=pct(r.baslangic);
        const rW  =wPct(r.baslangic,r.teslim);
        // Rezervasyon tamamen görünür pencere dışındaysa soluk göster
        const outOfView=new Date(r.teslim)<viewStart||new Date(r.baslangic)>viewEnd;

        return(
          <div key={r.id} style={{display:"flex",borderBottom:`1px solid ${C.border}`,height:ROW_H,opacity:outOfView?0.3:1,transition:"opacity 0.2s"}}>

            {/* Sol etiket */}
            <div style={{width:LABEL_W,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:"6px 6px",display:"flex",flexDirection:"column",justifyContent:"center",gap:1,cursor:"pointer"}} onClick={()=>onDetay(r)}>
              <div style={{fontSize:9,fontWeight:700,color:rc,letterSpacing:0.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.parcaNo}</div>
              <div style={{fontSize:8,color:C.textDim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.parcaAd}</div>
              <div style={{fontSize:8,color:C.textDim}}>{r.kabin}</div>
            </div>

            {/* Bar alanı */}
            <div style={{flex:1,position:"relative",background:C.bg}}>

              {/* Dikey tick çizgileri (arka plan) */}
              {ticks.map((tk,i)=>{
                const lft=pct(tk);
                if(lft<0||lft>100)return null;
                return <div key={i} style={{position:"absolute",left:`${lft}%`,top:0,bottom:0,width:1,background:C.border,opacity:0.4}}/>;
              })}

              {/* Bugün çizgisi */}
              {nowPct>=0&&nowPct<=100&&(
                <div style={{position:"absolute",left:`${nowPct}%`,top:0,bottom:0,width:1,background:C.danger,opacity:0.4,zIndex:3}}/>
              )}

              {/* Ana rezervasyon barı */}
              {!outOfView&&rBas<100&&(
                <div onClick={()=>onDetay(r)}
                  style={{
                    position:"absolute",
                    left:`${Math.max(rBas,0)}%`,
                    width:`${Math.min(rW,100-Math.max(rBas,0))}%`,
                    top:BAR_TOP,height:BAR_H,
                    background:`${rc}33`,
                    border:`1px solid ${rc}`,
                    borderRadius:4,
                    cursor:"pointer",
                    display:"flex",alignItems:"center",paddingLeft:5,overflow:"hidden",
                    zIndex:2,
                    boxSizing:"border-box",
                  }}>
                  <span style={{fontSize:9,color:rc,fontWeight:700,whiteSpace:"nowrap",letterSpacing:0.3}}>{r.parcaNo} · {r.parcaAd}</span>
                </div>
              )}

              {/* Adım barları */}
              {r.adimlar.map((a,ai)=>{
                const sc=STEP_C[a.tip];
                const ab=pct(a.baslangic);
                const bitis=new Date(new Date(a.baslangic).getTime()+a.sure*60000);
                const aw=wPct(a.baslangic,bitis);
                if(ab>=100||ab+aw<=0)return null;
                const clampLeft=Math.max(ab,0);
                const clampW=Math.min(aw,100-clampLeft);
                if(clampW<=0)return null;
                return(
                  <div key={ai}
                    onClick={()=>onAdimDetay({adim:a,rez:r})}
                    style={{
                      position:"absolute",
                      left:`${clampLeft}%`,
                      width:`${clampW}%`,
                      top:STEP_TOP, height:STEP_H,
                      background:sc.bg,
                      border:`1px solid ${sc.border}`,
                      borderRadius:3,
                      cursor:"pointer",
                      display:"flex",alignItems:"center",
                      paddingLeft:3,
                      overflow:"hidden",
                      zIndex:3,
                      boxSizing:"border-box",
                    }}>
                    <span style={{fontSize:8,color:sc.text,fontWeight:700,whiteSpace:"nowrap",letterSpacing:0.2}}>{a.ad}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })
    )}

    {/* Legend */}
    <div style={{padding:"8px 12px",background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      {Object.entries(STEP_C).map(([tip,sc])=>(
        <div key={tip} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:C.textSub}}>
          <div style={{width:14,height:8,borderRadius:2,background:sc.bg,border:`1px solid ${sc.border}`}}/>
          <span>{tip}</span>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:C.textSub}}>
        <div style={{width:1,height:12,background:C.danger}}/>
        <span>şu an</span>
      </div>
      <div style={{marginLeft:"auto",fontSize:9,color:C.textDim}}>Adıma tıkla → detay</div>
    </div>
  </div>
</div>
```

);
}

/* ═══════════════════════════════════════════
KABİN TAB
═══════════════════════════════════════════ */
function KabinTab(){
return(
<div style={{padding:16}}>
<div style={{marginBottom:14}}>
<div style={{fontSize:18,fontWeight:800,letterSpacing:0.3}}>Kabin Durumu</div>
<div style={{fontSize:12,color:C.textSub,marginTop:2}}>Tüm binaların anlık durumu</div>
</div>
<div style={{display:“flex”,flexDirection:“column”,gap:10}}>
{Object.entries(BINALAR).map(([id,bina])=>(
<div key={id} style={card}>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,letterSpacing:0.5}}>
🏭 {bina.ad}
</div>
{bina.kabinler.map((k,i)=>(
<div key={k.id} style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,padding:“8px 0”,borderBottom:i<bina.kabinler.length-1?`1px solid ${C.border}`:“none”}}>
<div>
<div style={{fontWeight:600,fontSize:13,color:C.text}}>{k.ad}</div>
<div style={{color:C.textDim,fontSize:11}}>Kapasite: {k.kapasite} kişi</div>
</div>
<div style={{display:“flex”,gap:5}}>
<Chip label={k.tip} bg={k.tip===“otomatik”?C.accentDim:”#2A1A4A”} fg={k.tip===“otomatik”?C.accent:”#8957E5”}/>
<Chip label="Müsait" bg={C.successDim} fg={C.success}/>
</div>
</div>
))}
</div>
))}
</div>
</div>
);
}

/* ═══════════════════════════════════════════
ENVANTER TAB
═══════════════════════════════════════════ */
function EnvanterTab(){
return(
<div style={{padding:16}}>
<div style={{marginBottom:14}}>
<div style={{fontSize:18,fontWeight:800,letterSpacing:0.3}}>Tool & Personel</div>
<div style={{fontSize:12,color:C.textSub,marginTop:2}}>Ekipman ve personel müsaitliği</div>
</div>
<div style={{...card,marginBottom:10}}>
<div style={sHdr}>Tool Envanteri</div>
{Object.entries(TOOLS_ENV).map(([tip,data],i,arr)=>(
<div key={tip} style={{padding:“9px 0”,borderBottom:i<arr.length-1?`1px solid ${C.border}`:“none”}}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:6}}>
<span style={{color:C.text,fontWeight:500,fontSize:13}}>{tip}</span>
<span style={{color:C.textSub,fontSize:12}}>{data.mevcut} / {data.toplam}</span>
</div>
<div style={{height:4,background:C.bg,borderRadius:2,overflow:“hidden”}}>
<div style={{width:`${(data.mevcut/data.toplam)*100}%`,height:“100%”,background:C.accent,borderRadius:2}}/>
</div>
</div>
))}
</div>
<div style={card}>
<div style={sHdr}>Personel Havuzu</div>
{PERSONEL.map(p=>(
<div key={p.id} style={{display:“flex”,alignItems:“center”,gap:10,padding:“8px 0”,borderBottom:`1px solid ${C.border}`}}>
<div style={{width:30,height:30,borderRadius:“50%”,background:p.musait?C.accentDim:C.surface2,border:`1px solid ${p.musait?C.accent:C.border2}`,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:12,fontWeight:700,color:p.musait?C.accent:C.textDim,flexShrink:0}}>{p.ad[0]}</div>
<div style={{flex:1}}>
<div style={{fontWeight:500,fontSize:13,color:C.text}}>{p.ad}</div>
<div style={{color:C.textDim,fontSize:11}}>{p.vardiya} vardiyası</div>
</div>
<Chip label={p.musait?“Müsait”:“Meşgul”} bg={p.musait?C.successDim:C.dangerDim} fg={p.musait?C.success:C.danger}/>
</div>
))}
</div>
</div>
);
}
