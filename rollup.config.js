import typescript from "@rollup/plugin-typescript";
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
	{
		input: "src/sky-reactivity.proxy.ts",
		output: [
			{
				file: "dist/sky-reactivity.proxy.esnext.mjs",
				format: "esm"
			}
		],
		plugins: [
			typescript()
		]
	},
	{
		input: "src/sky-reactivity.property.ts",
		output: [
			{
				file: "dist/sky-reactivity.property.esnext.mjs",
				format: "esm"
			}
		],
		plugins: [
			typescript()
		]
	},
	{
		input: "src/sky-reactivity.vbscript.js",
		output: [
			{
				file: "dist/sky-reactivity.vbscript.esnext.mjs",
				format: "esm"
			}
		],
		plugins: [
			typescript()
		]
	},
	{
		input: "test/vbscript/test.esm.js",
		output: [
			{
				file: "test/vbscript/test.iife.js",
				format: "iife"
			}
		],
		context: "window",
		plugins: [
			nodeResolve(),
			babel({
				babelHelpers: 'runtime',
				babelrc: false,
				compact: false,
				plugins: [
					["@babel/plugin-transform-runtime", {
						absoluteRuntime: false,
						corejs: false,
						helpers: true,
						regenerator: true,
						useESModules: true,
						version: "7.20.1"
					}],
					// ES2015
					"@babel/plugin-transform-arrow-functions",
					"@babel/plugin-transform-block-scoping",
					["@babel/plugin-transform-classes", { loose: true }],
					// ES3
					"@babel/plugin-transform-member-expression-literals",
					"@babel/plugin-transform-property-literals",
					"@babel/plugin-transform-reserved-words",
					"@babel/plugin-transform-jscript"
				]
			})
		]
	}
];
