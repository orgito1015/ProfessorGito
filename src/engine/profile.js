export const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{1,19}$/;
export function normalizeUsername(value){
 if(typeof value!=='string')throw new Error('Enter a username.');
 const name=value.trim();
 if(!USERNAME_PATTERN.test(name))throw new Error('Use 2 to 20 characters. Start with a letter; use letters, numbers, underscores, or hyphens.');
 return name;
}
export function personalize(text,username){return text.replaceAll('{username}',username);}
export function setUsername(state,value){const s=structuredClone(state);s.username=normalizeUsername(value);s.profileSet=true;return s;}
