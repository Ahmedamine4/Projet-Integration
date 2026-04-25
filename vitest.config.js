import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        //  Permet d'utiliser 'describe', 'it', 'expect' sans les importer à chaque fois
        globals: true,

        //  Indique où se trouvent tes fichiers de tests
        include: ['tests/**/*.test.js'],

        //  Pour le développement : s'arrête dès qu'un test échoue (optionnel)
        bail: 1,

        //  Environnement de test (node est parfait pour le backend)
        environment: 'node',
    },
});