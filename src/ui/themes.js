// Shared palette registry. Theme IDs are serialized in preferences.
export const DEFAULT_THEME='cinder';
export const themes=[
  {
    "id": "cinder",
    "name": "Cinder Green",
    "scheme": "dark",
    "colors": {
      "bg": "#101512",
      "panel": "#171e19",
      "line": "#53634f",
      "muted": "#a0afa3",
      "text": "#e5ebe3",
      "accent": "#c0e98a",
      "chrome": "#141b16",
      "sidebar": "#131a15",
      "terminal": "#0a100c",
      "terminalHeader": "#18201a",
      "terminalText": "#b4c8b5",
      "card": "#1d271e",
      "hover": "#29352b",
      "accentText": "#152012",
      "warning": "#ffc19a",
      "selected": "#263323",
      "accentHover": "#d6ffa5"
    }
  },
  {
    "id": "crimson",
    "name": "Crimson",
    "scheme": "dark",
    "colors": {
      "bg": "#140e12",
      "panel": "#21161d",
      "line": "#78515e",
      "muted": "#c3a6b1",
      "text": "#f5e7ec",
      "accent": "#ff91aa",
      "chrome": "#1b1017",
      "sidebar": "#180f15",
      "terminal": "#0e090d",
      "terminalHeader": "#24161e",
      "terminalText": "#e8bbc9",
      "card": "#2d1b24",
      "hover": "#3b2430",
      "accentText": "#2b0c17",
      "warning": "#ffd0a3",
      "selected": "#3b1e2b",
      "accentHover": "#ffb3c5"
    }
  },
  {
    "id": "arctic",
    "name": "Arctic Blue",
    "scheme": "dark",
    "colors": {
      "bg": "#0c141f",
      "panel": "#142131",
      "line": "#4c6a87",
      "muted": "#a1b9cf",
      "text": "#e6f1fc",
      "accent": "#83d6ff",
      "chrome": "#101c2b",
      "sidebar": "#0e1926",
      "terminal": "#080f19",
      "terminalHeader": "#18293a",
      "terminalText": "#b8d4ed",
      "card": "#1b2e42",
      "hover": "#263d55",
      "accentText": "#082437",
      "warning": "#ffd39e",
      "selected": "#203b51",
      "accentHover": "#b3e7ff"
    }
  },
  {
    "id": "violet",
    "name": "Violet",
    "scheme": "dark",
    "colors": {
      "bg": "#14101f",
      "panel": "#201a30",
      "line": "#6d5b85",
      "muted": "#b7abc9",
      "text": "#f0e9fc",
      "accent": "#c9a4ff",
      "chrome": "#1b1529",
      "sidebar": "#181324",
      "terminal": "#0e0a17",
      "terminalHeader": "#271e38",
      "terminalText": "#d4bee9",
      "card": "#2b2140",
      "hover": "#3a2c51",
      "accentText": "#241336",
      "warning": "#ffcfad",
      "selected": "#342547",
      "accentHover": "#dfc6ff"
    }
  },
  {
    "id": "amber",
    "name": "Amber",
    "scheme": "dark",
    "colors": {
      "bg": "#18130c",
      "panel": "#241d12",
      "line": "#796642",
      "muted": "#c5b48f",
      "text": "#f6edd8",
      "accent": "#f7cf76",
      "chrome": "#1f180e",
      "sidebar": "#1c160d",
      "terminal": "#100d07",
      "terminalHeader": "#2b2213",
      "terminalText": "#decb9b",
      "card": "#302717",
      "hover": "#40341c",
      "accentText": "#2c2108",
      "warning": "#ffb89e",
      "selected": "#3b2f18",
      "accentHover": "#ffe4a6"
    }
  },
  {
    "id": "paper",
    "name": "Paper Light",
    "scheme": "light",
    "colors": {
      "bg": "#f3f4f0",
      "panel": "#ffffff",
      "line": "#727c72",
      "muted": "#505f54",
      "text": "#1e2a22",
      "accent": "#315e37",
      "chrome": "#e7ece3",
      "sidebar": "#edf0e8",
      "terminal": "#f8faf5",
      "terminalHeader": "#e5ebdf",
      "terminalText": "#2e4935",
      "card": "#eef3e9",
      "hover": "#dfe9d9",
      "accentText": "#ffffff",
      "warning": "#923e15",
      "selected": "#dce9d5",
      "accentHover": "#254b2b"
    }
  }
];
export function validTheme(id){return themes.some(t=>t.id===id);}
export function getPalette(id,contrast=false){
 const theme=themes.find(t=>t.id===id);
 if(!theme)throw new Error('Unknown theme.');
 const colors={...theme.colors};
 if(contrast){
  const light=theme.scheme==='light';
  for(const key of ['bg','panel','chrome','sidebar','terminal','terminalHeader','card'])colors[key]=light?'#ffffff':'#000000';
  for(const key of ['text','terminalText','muted'])colors[key]=light?'#000000':'#ffffff';
  colors.line=light?'#222222':'#dddddd';
 }
 return {...theme,colors};
}
export function applyTheme(preferences,root=document.documentElement){
 const theme=getPalette(preferences.theme||DEFAULT_THEME,preferences.contrast);
 for(const [name,value] of Object.entries(theme.colors))root.style.setProperty('--'+name,value);
 root.style.setProperty('color-scheme',theme.scheme);
 root.style.setProperty('--font-size',preferences.fontSize+'px');
 root.setAttribute('data-theme',theme.id);
 root.setAttribute('data-contrast',String(preferences.contrast));
}
