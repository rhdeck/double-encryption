import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "rollup-plugin-babel";
import pkg from "./package.json";
import autoExternal from "rollup-plugin-auto-external";
export default [
  {
    input: "src/index.js",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ],

    plugins: [
      autoExternal(),
      resolve(),
      babel({
        runtimeHelpers: true,
        exclude: ["node_modules/**"]
      }),
      commonjs()
    ]
  }
];
