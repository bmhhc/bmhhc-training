/* BMHHC online manuals: letter-size paged view (same look as the print version). Config: window.PAGED */
(function(){
var C=window.PAGED||{},H=document.documentElement,B=document.body;
var css=
"html.paged body{background:#dde3ee!important;padding:20px 0 80px!important;margin:0!important;max-width:none!important;overflow-x:hidden}"+
"html.paged #book{display:flex;flex-direction:column;align-items:center;gap:28px}"+
".pgs{position:relative;width:8.5in;height:11in;background:#fff;box-sizing:border-box;overflow:hidden;flex:none;box-shadow:0 1px 2px rgba(20,30,60,.2),0 12px 32px rgba(20,30,60,.2);border-radius:2px}"+
".pgs::before{content:'';position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#2B3A8C,#4f68cf);z-index:2}"+
".pgs .pgb{position:absolute;left:"+C.side+"in;right:"+C.side+"in;top:"+C.top+"in;height:"+(11-C.top-C.bottom)+"in;overflow:hidden}"+
".pgs.cv .pgb{left:"+C.cm+"in;right:"+C.cm+"in;top:"+C.cm+"in;height:"+(11-2*C.cm)+"in}"+
".pgs .pgh{position:absolute;top:.5in;right:"+C.side+"in;text-align:right;font:"+(C.hf||"10.5pt")+" 'Liberation Serif','Times New Roman',serif;color:#000;line-height:1.3}"+
".pgs .pgh b{display:block}.pgs.cv .pgh{display:none}"+
".pgs .pgb>*{margin-top:0}"+
"html.paged .pgb .phs{display:none}"+
"html.paged .pgb .cov,html.paged .pgb .cover{margin:0!important;padding:0!important;box-sizing:border-box;"+(C.coverCss||"")+"}"+
"html.paged .pgb .pol,html.paged .pgb .form,html.paged .pgb .chap,html.paged .pgb .part{border:0!important;margin:0!important;padding:0!important;box-sizing:border-box}"+
"html.paged .pgb .stoc,html.paged .pgb .toc{margin:0}"+
".pgn{flex:0 0 auto}.toc .lead{flex:1 1 auto;border-bottom:1.2pt dotted #000;margin:0 4pt 5pt;min-width:12pt}.toc .r.pgr{display:flex!important;align-items:flex-end}"+
"#pbar{display:none;position:fixed;left:0;right:0;bottom:0;height:34px;background:rgba(255,255,255,.96);border-top:1px solid #c5cbdc;box-shadow:0 -4px 14px rgba(20,30,60,.12);font:13px/34px 'Liberation Serif',Georgia,serif;color:#222;z-index:50;padding:0 18px;justify-content:space-between;align-items:center}"+
"html.live #pbar{display:flex}#pbar .fill{position:absolute;left:0;top:-1px;height:4px;width:0;background:linear-gradient(90deg,#2B3A8C,#4f68cf);transition:width .15s}"+
"#pbar b{font-weight:bold}#pbar a{color:#2B3A8C;text-decoration:none;font-weight:bold}"+
"@media print{@page{size:Letter;margin:0}html.paged body{background:#fff!important;padding:0!important}html.paged #book{display:block}.pgs{box-shadow:none;margin:0;border-radius:0;page-break-after:always;break-after:page}.pgs::before{display:none}#pbar{display:none!important}}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

var bar=document.createElement("div");bar.id="pbar";bar.innerHTML='<div class="fill"></div><span>'+C.title+'</span><span id="pc"></span><a href="#" id="pcl">Contents ▲</a>';B.appendChild(bar);
H.classList.add("live");
var fill=bar.querySelector(".fill"),pc=document.getElementById("pc"),sheets=[],book;
function upd(){var s=window.scrollY,mx=Math.max(1,document.documentElement.scrollHeight-innerHeight);fill.style.width=Math.min(100,s/mx*100)+"%";
 if(!sheets.length){pc.innerHTML="<b>"+Math.round(s/mx*100)+"%</b> read";return}
 var mid=innerHeight/2,cur=0;sheets.forEach(function(e,i){var r=e.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)cur=i});
 pc.innerHTML=cur===0?"Cover":"<b>Page "+(cur+1)+" of "+sheets.length+"</b>";}
addEventListener("scroll",upd,{passive:true});

var units=[].filter.call(B.children,function(e){return e.matches(C.units)});
if(!units.length)return;
book=document.createElement("div");book.id="book";units[0].parentNode.insertBefore(book,units[0]);H.classList.add("paged");
function sheet(cv){var s=document.createElement("section");s.className="pgs"+(cv?" cv":"");s.innerHTML='<div class="pgh"></div><div class="pgb"></div>';book.appendChild(s);sheets.push(s);return s}
function over(b){return b.scrollHeight>b.clientHeight+1}
function split(c,b,shell){ /* c overflows alone-ish: split lists/tables across sheets; returns remaining pieces list */
 return null}
units.forEach(function(u){
 var cv=u.matches(C.cover);
 var s=sheet(cv),b=s.querySelector(".pgb");
 s._u=u;s._i=0;
 b.appendChild(u);
 if(cv||!over(b))return;
 /* flow children across sheets */
 var kids=[].slice.call(u.children);kids.forEach(function(k){u.removeChild(k)});
 var shell=u,first=true,n=1,cur=s;
 function newSheet(){var s2=sheet(false);s2._u=u;s2._i=n++;var sh=u.cloneNode(false);sh.removeAttribute("id");s2.querySelector(".pgb").appendChild(sh);shell=sh;b=s2.querySelector(".pgb");cur=s2;}
 kids.forEach(function(k){
  shell.appendChild(k);
  if(!over(b)||shell.children.length<2)return;
  /* split a long list / table / div (e.g. contents) across sheets */
  var tag=k.tagName,host=tag==="TABLE"?(k.tBodies[0]||k):k;
  if(/^(OL|UL|TABLE|DIV)$/.test(tag)&&host.children.length>1&&k.offsetHeight>b.clientHeight*0.5){
   if(tag==="OL"){var v=1;[].forEach.call(k.children,function(li){if(li.hasAttribute("value"))v=+li.getAttribute("value");else li.setAttribute("value",v);v++;});}
   while(over(b)){
     var mv=[];while(over(b)&&host.children.length>0){mv.unshift(host.lastElementChild);host.removeChild(host.lastElementChild);}
     var lead=[],k2,h2;
     if(host.children.length===0){shell.removeChild(k);var q=shell.lastElementChild;while(q&&/^H[1-6]$/.test(q.tagName)&&shell.children.length>1){lead.unshift(q);shell.removeChild(q);q=shell.lastElementChild}k2=k;h2=host;}
     else{k2=k.cloneNode(false);k2.removeAttribute("id");h2=host===k?k2:k2.appendChild(host.cloneNode(false));}
     newSheet();lead.forEach(function(x){shell.appendChild(x)});mv.forEach(function(x){h2.appendChild(x)});shell.appendChild(k2);k=k2;host=h2;
     if(host.children.length<2)break;
   }
   return;
  }
  /* move child (and preceding headings) to a new sheet */
  var mv=[k],p=k.previousElementSibling;
  while(p&&/^H[1-6]$/.test(p.tagName)&&shell.children.length>mv.length+0&&shell.children.length>mv.length){mv.unshift(p);p=p.previousElementSibling}
  mv.forEach(function(x){shell.removeChild(x)});
  newSheet();mv.forEach(function(x){shell.appendChild(x)});
 });
});
var N=sheets.length;
sheets.forEach(function(s,i){var h=s.querySelector(".pgh");if(i===0)return;
 var cnt=sheets.filter(function(x){return x._u===s._u}).length;
 h.innerHTML=C.header(s,i,cnt);});
function pageOf(id){var e=document.getElementById(id);if(!e)return"";return sheets.indexOf(e.closest(".pgs"))+1}
document.querySelectorAll(C.tocRows).forEach(function(r){
 var a=r.querySelector("a");if(!a)return;var id=a.getAttribute("href").slice(1);
 var pn=r.querySelector(".pn");
 if(pn){pn.textContent=pageOf(id);return}
 r.classList.add("pgr");var l=document.createElement("span");l.className="lead";var p=document.createElement("a");p.className="pgn";p.href="#"+id;p.textContent=pageOf(id);r.appendChild(l);r.appendChild(p);
});
var ts=document.querySelector(C.tocFirst);var tid=ts&&ts.closest(".pgs");if(tid){tid.id="toc-main";document.getElementById("pcl").href="#toc-main"}
function fit(){var z=Math.min(1,(H.clientWidth-16)/816);book.style.zoom=z;upd()}
addEventListener("resize",fit);fit();
if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView()}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href^='#']");if(!a)return;var t=document.getElementById(a.getAttribute("href").slice(1));if(t){e.preventDefault();t.scrollIntoView();history.replaceState(null,"",a.getAttribute("href"))}});
})();
