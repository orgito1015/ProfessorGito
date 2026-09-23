export function el(tag,attrs={},...children){
 const node=document.createElement(tag);
 for(const [key,value] of Object.entries(attrs)){if(key.startsWith('on')&&typeof value==='function')node.addEventListener(key.slice(2).toLowerCase(),value);else if(key==='class')node.className=value;else if(key==='checked')node.checked=value;else if(key==='disabled')node.disabled=value;else if(value!==null&&value!==undefined)node.setAttribute(key,String(value));}
 for(const child of children.flat(Infinity)){if(child!==null&&child!==undefined)node.append(child instanceof Node?child:document.createTextNode(String(child)));}
 return node;
}
export const button=(text,onClick,cls='')=>el('button',{type:'button',class:cls,onClick},text);
export function emptyIcon(){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 48 48');
 svg.setAttribute('aria-hidden','true');
 svg.setAttribute('class','empty-icon-svg');
 svg.innerHTML='<path d="M18 15v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="6" y="15" width="36" height="27" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M6 24h11l2 4h10l2-4h11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>';
 return svg;
}
