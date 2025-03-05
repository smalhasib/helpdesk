import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

register({
    baseUrl: resolve(__dirname, '..'),
    paths: {
        '@/*': ['src/*'],
        '@config/*': ['src/config/*'],
        '@controllers/*': ['src/controllers/*'],
        '@middleware/*': ['src/middleware/*'],
        '@models/*': ['src/models/*'],
        '@routes/*': ['src/routes/*'],
        '@services/*': ['src/services/*'],
        '@types/*': ['src/types/*'],
        '@utils/*': ['src/utils/*'],
        '@lib/*': ['src/lib/*']
    }
}); 