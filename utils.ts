import * as path from "path";

export function extend(dest:object, src:object) {
  if(!src) return dest;
  if(!dest) return src;
  for(let key in src) {
    (dest as any)[key] = (src as any)[key];
  }
  return dest;
}

export function getPackage() {
  try {
    return require(path.join(process.cwd(), "package.json"));
  } catch(err) {
  }
}

export function getPackageAttribute(attribute:string) {
  let pkg = getPackage();
  return pkg && pkg[attribute];
}
