declare module "gulp-template" {
  interface TemplateOpts {
    /** The HTML "escape" delimiter. */
    escape: RegExp,
    /** The "evaluate" delimiter. */
    evaluate: RegExp,
    /** The "interpolate" delimiter. */
    interpolate: RegExp,
    /** The sourceURL of the compiled template. */
    sourceURL: string,
    /** The data object variable name. */
    variable: string,
  }

  function template(imports:object, opts?:Partial<TemplateOpts>):NodeJS.ReadWriteStream;
  export = template;
}

declare module "gulp-conflict" {
  interface ConflictOpts {
    /** Specify another working directory than `process.cwd()`. */
    cwd: string,
    /** Default choice on conflicts e.g. 'y' (replace, default), 'n' (skip), 'd' (diff). */
    defaultChoice:"y"|"n"|"d"
  }

  function conflict(dest:string, opts?:Partial<ConflictOpts>):NodeJS.ReadWriteStream;
  export = conflict;
}

declare module "gulp-install" {
  interface CommandMap {[name:string]: string}

  function install(commands?:CommandMap, callback?:Function):NodeJS.ReadWriteStream;
  export = install;
}

declare module "package-merge" {
  export function merge(dest:Buffer, src:Buffer):string;
  export default merge;

  export type Handler<T> = (a:T|undefined, b:T|undefined) => T|undefined;
  export function customize(extraHandlers:{[key:string]: Handler<unknown>}): typeof merge;
  export let builtins:{[name:string]: Handler<any>};
}
