import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        terser({
            sourcemap: true,
            output: { comments: false },
            compress: {
                keep_infinity: true,
                pure_getters: true,
                passes: 10,
            },
            warnings: true,
            ecma: 5,
            mangle: true,
        }),
    ],
};
