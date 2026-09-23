import { el } from './dom.js';
export function graph(nodes,edges,{label,onSelect}={}){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 const rows=Math.max(1,Math.ceil(nodes.length/2)),height=rows*125+35;
 for(const [k,v] of Object.entries({viewBox:`0 0 380 ${height}`,class:'relationship-graph',role:'group','aria-label':label||'Connections'}))svg.setAttribute(k,v);
 const make=(tag,attrs,text)=>{const n=document.createElementNS(svg.namespaceURI,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;return n;};
 const pos=new Map(nodes.map((n,i)=>[n.id,{x:95+(i%2)*190,y:65+Math.floor(i/2)*125}]));
 for(const e of edges){const a=pos.get(e.from),b=pos.get(e.to);if(a&&b)svg.append(make('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'relationship-edge'}));}
 for(const n of nodes){const p=pos.get(n.id),attrs={class:'relationship-node'+(n.active?' active':'')+(n.locked?' locked':'')};if(!n.locked&&onSelect){attrs.tabindex=0;attrs.role='button';attrs['aria-label']=n.ariaLabel||n.id;}
  const g=make('g',attrs);g.append(make('rect',{x:p.x-81,y:p.y-28,width:162,height:56,rx:8}),make('text',{x:p.x,y:p.y-3,class:'graph-title'},n.id),make('text',{x:p.x,y:p.y+15,class:'graph-status'},n.status||''));
  if(!n.locked&&onSelect){g.addEventListener('click',()=>onSelect(n.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(n.id);}});}svg.append(g);
 }
 return svg;
}
