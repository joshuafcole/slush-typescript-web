import * as fs from "fs";
import * as path from "path";
import * as through2 from "through2";
import * as VinylFile from "vinyl";
import mergePackageBuffers = require("package-merge");
import * as gutil from "gulp-util";

export function mergePackage(root:string = ".", opts:{cwd?:string}&object = {}) {
  return through2.obj(function(file:VinylFile, encoding:string, next:(err?:Error, data?:any) => void) {
    let basename = path.basename(file.relative);
    if(basename !== "package.json") {
      this.push(file);
      next();
      return;
    }

    let newPath = path.resolve(opts.cwd || process.cwd(), root, file.relative);
    fs.stat(newPath, (err, stat) => {
      if(stat && !stat.isDirectory()) {
        fs.readFile(newPath, (err, contents) => {
          if(err) {
            error("Unable to read existing package for merging");
          } else if(!file.contents || !(file.contents instanceof Buffer)) {
            error("mergePackage does not support streams");
          } else {
            let neue = file.clone();
            neue.contents = new Buffer(mergePackageBuffers(contents, file.contents));
            if(neue.contents.toString("utf8") === contents.toString("utf8")) {
              log("Skipping", gutil.colors.magenta(file.relative), "(identical)");
            } else {
              this.push(neue);
            }
          }
          next();
        });
      } else {
        this.push(file);
        next();
      }
    });
  });
}

function log(...args:any[]) {
  gutil.log(`[${gutil.colors.cyan("slush-typescript-web")}]`, ...args);
}
function error(message:string) {
  throw new gutil.PluginError("slush-typescript-web", message);
}
