import typescript from "@rollup/plugin-typescript";

export default {
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
};
