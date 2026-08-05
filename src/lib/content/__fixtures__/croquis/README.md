# Fixtures invalides — garde des croquis

Chaque fichier porte **un seul défaut**, et il est nommé d'après lui.

Ces fixtures existent pour une raison précise : une garde qu'on n'a jamais vue
échouer n'est pas une garde, c'est une décoration. Les tests de
`croquis-garde.test.ts` exigent que chacune tombe **sur sa règle**, et pas
seulement qu'elle tombe — une fixture qui échouerait pour une autre raison
prouverait le contraire de ce qu'elle prétend.

Elles ne sont **pas** des dégradations temporaires d'un fichier de production :
ce sont des fichiers dédiés, hors de `content/`, que rien ne rend et que rien
n'indexe.
