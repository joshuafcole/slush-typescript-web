import * as fs from "mz/fs";
import * as path from "path";
import * as through2 from "through2";
import * as VinylFile from "vinyl";
import packagemerge = require("package-merge");
import * as gutil from "gulp-util";

let mergePackageBuffers = packagemerge.customize({/*capabilities: packagemerge.builtins.unique*/});

function noop() {}

export function mergePackage(root:string = ".", opts:{cwd?:string}&object = {}) {
  let lastPackage:VinylFile|undefined;

  return through2.obj(async function(file:VinylFile, encoding:string, next:(err?:Error, data?:any) => void) {
    let bail = () => {
      this.push(file);
      next();
    }

    let basename = path.basename(file.relative);
    if(basename !== "package.json") return bail();

    if(!file.contents || !(file.contents instanceof Buffer)) {
      error("mergePackage does not support streams");
      return bail();
    }

    let contents:Buffer;
    if(lastPackage) {
      contents = lastPackage.contents as Buffer;

    } else {
      let newPath = path.resolve(opts.cwd || process.cwd(), root, file.relative);
      let stat = await fs.stat(newPath).catch(noop);
      if(!stat || stat.isDirectory()) return bail();

      let maybeContents = await fs.readFile(newPath).catch(noop);
      if(!maybeContents) return bail();

      contents = maybeContents;
    }

    let neue = file.clone();
    neue.contents = new Buffer(mergePackageBuffers(contents, file.contents));
    if(neue.contents.toString("utf8") === contents.toString("utf8")) {
      log("Skipping", gutil.colors.magenta(file.relative), "(identical)");
    } else {
      lastPackage = neue;
      this.push(neue);
      next();
    }
  });
}

function log(...args:any[]) {
  gutil.log(`[${gutil.colors.cyan("slush-typescript-web")}]`, ...args);
}
function error(message:string) {
  throw new gutil.PluginError("slush-typescript-web", message);
}
