import {join} from "path"
import {argv} from "yargs"

import {task, log} from "../task"
import {compileTypeScript} from "../compiler"
import {Linker} from "../linker"
import * as paths from "../paths"

task("scripts:compile", ["styles:compile"], async () => {
  const success = compileTypeScript(join(paths.src_dir.lib, "tsconfig.json"), {
    log,
    out_dir: {js: paths.build_dir.lib, dts: paths.build_dir.types},
  })

  if (argv.emitError && !success)
    process.exit(1)
})

task("scripts:bundle", [/*"scripts:compile"*/], async () => {
  const entries = [
    paths.lib.bokehjs.main,
    paths.lib.gl.main,
    paths.lib.api.main,
    paths.lib.widgets.main,
    paths.lib.tables.main,
  ]
  const bases = [paths.build_dir.lib, './node_modules']

  const linker = new Linker({entries, bases}) //, minify: false})

  const modules = linker.resolve(entries)

  for (const module of modules) {
    console.log(module.file)
  }
  //linker.assemble()

  const bundles = linker.link()

  const [bokehjs, api, widgets, tables, gl] = bundles

  bokehjs.write(paths.lib.bokehjs.output)
  api.write(paths.lib.api.output)
  widgets.write(paths.lib.widgets.output)
  tables.write(paths.lib.tables.output)
  gl.write(paths.lib.gl.output)
})

task("scripts:build", ["scripts:bundle"])

task("scripts:minify", ["scripts:bundle"])

task("scripts", ["scripts:build", "scripts:minify"])
