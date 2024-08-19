import serviceURL from 'mcutils/api/serviceURL';

export default {
	mestat: 'Mes statistiques',
	ok: 'OK',
donnees_modes: `# Méthode de classification
----------
Afin de représenter les données sur la carte, nous devons les répartir dans des **classes** sur lesquelles on pourra définir un style de représentation donné.

## Quantiles
Les quantiles sont les valeurs qui partagent un jeu de données en n parts égales.
Ainsi, si on découpe un jeu de 20 données en 4 classes, elles contiendront 5 données chacune.
## Equidistance
Une répartition par équidistance partage un jeu de données en n parts de même largeur.
Ainsi si notre jeu de données a une valeur minimale de 2 et une valeur maximale de 14 (donc une amplitude de 12) et qu'on le découpe en 4 classes, elles auront chacune une largeur de 3.
## Logarithmique
Ce mode utilise une répartition équidistante mais sur une échelle logarithmique.
## Cluster ou k-moyenne
Une répartition par cluster (ou k-moyenne) consiste à découper un jeu de données en parts, appelées clusters, de façon à minimiser une fonction de distance entre les individus. 
**Remarque**:  Cette méthode de répartition ne garantit pas d'obtenir exactement le nombre de classes demandé par l'utilisateur, car ce nombre de classes est par construction lié à la répartition des valeurs de la variable à cartographier.
## Manuelle
Vous définissez vous-même les bornes des classes.
`,
intro_loadStat: `# Carte statistique
----------
|>![](assets://img/help/france.jpg 150x)
La carte de traitement et d'analyse permet de représenter sur un fond repère une information spécifique. Cette information peut être physique, économique ou concerner la géographie humaine et la géographie générale.
Elle permet de traiter une information précise ou des phénomènes disposés dans l'espace en fonction de leurs caractéristiques, c'est-à-dire de faire des comparaisons, de créer des groupes, d'analyser les relations spatiales.
La vision fine et la vision globale sont nécessaires pour analyser l'image.

Ainsi, lorsqu'on représente des forêts ou des bois sur une carte statistique ce ne sont pas simplement les objets en eux même qui sont décrits mais on cherche à faire ressortir des informations concernant, par exemple, les types de boisements, les propriétaires ou gestionnaires, les modes d'exploitation, etc.

## Thématique et statistique
La cartographie thématique visualise les données sur la base de concepts spatiaux tels que la densité, les proportions, les pourcentages, les indices ou les tendances, des moyennes... Il est donc nécessaire d'avoir accès à de l'information et à des données chiffrées concernant la thématique abordée.
Pour cela, elle s'appuiera sur des analyses statistiques qui lui fourniront, par exemple pour décrire les forêts: les densités des boisements, la répartition des espèces, les types ou les volumes de productions, etc...

## Positionnement et géométrie
Afin de représenter un phénomène sur une carte, il est nécessaire d'avoir sa position dans l'espace.
Cette position peut être intégrée dans le fichier (GeoJSON) ou liée à un maillage existant (pays, département, commune, ...). Dans ce cas, il faudra préciser lors de l'import des données le type de maillage utilisé et l'attribut servant à coder le lien.
Pour les départements, le lien se fait sur le numéro de département (01 = département de l'Ain), pour les communes il s'agit du code INSEE de la commune (01001 = commune de L'Abergement-Clémenciat), pour les pays, on utilise le code ISO (fr = France).

Lorsqu'on n'a pas de coordonnées associées à une série de données, mais qu'on a des informations de localisation à l'adresse, à la commune ou au lieu-dit, on peut utiliser des outils de [géocodage](` + serviceURL.geocod + `) pour en déduire des coordonnées.
`,
intro_maillage: `# Positionnement et géométrie
-----------
Afin de représenter un phénomène sur une carte, il est nécessaire d'avoir sa position dans l'espace.
Cette position peut être intégrée dans le fichier géographique (GeoJSON) ou liée à un découpage existant (pays, département, commune, ...).
Dans ce cas, il faudra préciser lors de l'import des données le type de découpage utilisé et l'attibut servant à coder le lien :
* pour les départements, le lien se fait sur le numéro de département (01 = département de l'Ain), 
* pour les communes il s'agit du code INSEE de la commune (01001 = commune de L'Abergement-Clémenciat), 
* pour les pays, on utilise le code ISO (fr = France).

Vous pouvez utiliser votre propre fichier de maillage (:fi-share: importer un maillage). Dans ce cas, vous devez préciser l'attribut qui servira de clé pour retrouvé la maille au sein de vos données.

Lorsqu'on n'a pas de coordonnées associées à une série de données, mais qu'on a des informations de localisation à l'adresse, à la commune ou au lieu-dit, on peut utiliser des [outils de géocodage](https://macarte.ign.fr/geocod/) pour en déduire des coordonnées.

`,
representation_brewer:`# Couleurs et palettes
----------
Les palettes proposées sont des combinaisons de couleurs sélectionnées pour leurs propriétés perceptives dans l'optique de la visualisation de données.

Ces palettes ont été créés par [Cynthia Brewer](http://www.colorbrewer2.org/) à des fins de cartographie, mais ont également trouvé une utilisation dans bien d'autres domaines.

## Le défi
|>![](assets://img/help/france.jpg 150x)
Un choix de couleurs efficaces pour l'affichage de données statistiques (graphique de barres, camemberts, carte statistique, thématique ou de chaleur) est d'autant plus difficile que la façon dont nous choisissons la couleur ne reflète pas la façon dont la nous percevons.

Il existe de nombreux exemples de mauvaises combinaisons de couleurs publiés sur le web. Ainsi, des catégories encodées avec une combinaison de couleurs claires et sombres, donneront une préférence aux couleurs vives qui vont dominer l'attention du lecteur.
D'autre part, si deux couleurs semblent similaires, le lecteur va instinctivement les percevoir comme appartenant à un groupe et en déduire que les variables sous-jacentes sont liées.

Les couleurs avec un faible contraste (dont la luminosité est perçue similaire) ou avec un contraste simultané (couleurs pures) interfèrent également avec les mécanismes d'interprétation.

## Les différents types de Palettes
Il existe quatre types de palettes :
* coloré : ce sont des palettes séquentielles à une seule valeur, elles utilisent un dégradé à partir d'une couleur de base
* séquentiel : les couleurs ont un ordre perçu avec une différence entre couleurs successives uniformes. Elles sont adaptées pour des données ordonnées avec une variation de valeur continue (gradient).
* divergent : elles utilisent deux palettes séquentielles dos à dos à partir d'une couleur commune. Elles accordent la même importance aux différentes valeurs des données.
* qualitatif - les couleurs n'ont pas d'ordre perçu. Elles sont adaptées pour représenter des données catégorielles ou nominales.
## Personnalisation des couleurs
Afin de maximiser la différenciation des couleurs entre elles, les palettes proposées dépassent	rarement 10 classes.
Or,
* pour certains types de configuration spatiale, il peut être utile d’avoir plus de 10 classes
* pour des données catégorielles, il peut être intéressant de pouvoir choisir la couleur d'une catégorie
* pour valoriser la mise en exergue d'un phénomème on peut avoir recours à une couleur tranchée pour la classe concernée

`,
statistique_type: `# Les types de cartes
----------
## Carte dégradée ou choroplèthe
|>![choroplèthe](assets://img/type/choroplethe.png)
Une carte choroplèthe (du grec χώρος : « zone/région » et πληθαίν : « multiple ») est une carte statistique en aplat de couleur suivant un attribut de type numérique qui servira à définir une classification.
Elle est particulièrement adaptée à représenter une mesure statistique, comme la densité d'un phénomène. Ce type de carte facilite la comparaison d'une mesure statistique d'une région à l'autre, ou montre la variabilité d'un phénomène.
Les données à représenter sont plutôt de type surfacique(dans le cas de données ponctuelles, on lui préférera une carte de symbole).

## Carte par catégories
|>![choroplèthe](assets://img/type/categorie.png)
C'est une carte en aplat de couleur en fonction d’un attribut de tout type.	Dans ce cas, ce sont les valeurs d'un attribut qui serviront à coder les classes (une classe par valeur différentes, limité à 100 classes).
Elle ne peut pas représenter un phénomène statistique ordonné mais peut indiquer la répartition spatiale d'un phénomène.

## Carte de symboles
|>![choroplèthe](assets://img/type/symbol.png)
Ce type de carte permet affichage d’un symbole suivant un attribut numérique qui code la classe et la grosseur du point affiché.
Il est particulièrement indiqué pour représenter un phénomène impliquant une quantité. La taille du cercle peut être répartie entre deux valeurs ou proportionnelle à la quantité.

## Carte sectorielle
|>![choroplèthe](assets://img/type/sectoriel.png)
Ce type de carte représente sous forme de diagramme statistique (camembert, barres) un phénomène localisé sur un point.
Il permet donc de représenter plusieurs variables (attributs) en même temps,et est recommandé pour visualiser un phénomène impliquant plusieurs candidats (résultat d'élection par exemple).
La taile du graphique correspond à la valeur totale des variables représentées. On peut le conditionner entre deux valeurs ou l'afficher de manière proportionnelle.

## Carte d'activité ou carte de chaleur
|>![choroplèthe](assets://img/type/heatmap.png)
Une carte de chaleur est une rerésentation cartographique qui à la grandeur d'une variable fait correspondre une teinte donnée dans une palette de couleurs.
C'est une carte d'accumulation et deux phénomènes proches spatialement vont s'additionner sur la carte.
Elle nécessite d'avoir des données ponctuelles pour fonctionner. Par défaut, seule la position du point est utilisé mais en choisissant un attribut numérique, on va pouvoir donner un poids au point représentant le phénomène.

`,
help_visuel: `# Technique cartographique
----------
La carte statistique utilise les variables de la sémiologie classique pour représenter l'information,c'est à dire la forme, la texture-structure, la taille, l'orientation, la couleur, la valeur et la dynamique.

## Les variables visuelles

### La taille

La variable visuelle taille permet de représenter des quantités (nombre d'habitants), un ordre (grandes, moyennes et petites agglomérations) et permet éventuellement de signaler des différences.
La taille de l'objet à représenter n'est pas forcément assujettie à la géométrie de l'objet qu'elle représente. Le choix de la taille des signes se fera soit en fonction de la vraie grandeur de l'objet à représenter, de l'importance relative attribuée à l'objet par rapport aux autres détails de la carte, ou alors de la densité des signes à mettre en place en fonction de l'échelle.

### La couleur

En sémiologie, la couleur permet de différencier des entités géographiques (départements par exemple). Ainsi, en s'appuyant sur les propriétés (teinte, saturation, luminance) et les contrastes (complémentaires, clair - obscur, couleur en soi, chaud - froid, quantité ou qualité) des couleurs, il est possible de mettre en évidence des informations de natures différentes (densités, opposition entre thèmes, thème dominant…).

### La valeur

Il s'agit de la progression continue du blanc au noir jusqu'à la saturation complète d'une teinte. Cela permet de conserver l'associativité d'un ensemble d'objets (tous les départements d'une même région dans la même couleur) tout en créant une différenciation par la valeur.
En cartographie statistique, on pourra utiliser la valeur pour créer un classement ordonné (l'objet le plus clair étant considéré comme le moins important). L'utilisation de cette variable est limitée : 6 à 7 paliers différentiables selon les teintes utilisées.

## Propriétés des variables visuelles

Les variables visuelles vont se caractériser par leur aptitude à mettre en évidence des différences entre entités représentées, une progression ordonnée de valeurs relatives (densité par exemple), des quantités ou des similitudes.

### La quantité

La quantité permet de définir la valeur absolue d'un élément géographique (précipitations annuelles, nombre de touristes dans une ville,...).
Seule la variable visuelle taille est quantitative, et est souvent utilisée sous forme de cercles de tailles proportionnelles à des quantités.
On peut également utiliser des cartes d'accumulation ou de chaleur (heatmap) pour visualiser la quantité.

### L'ordre

L'ordre permet de pouvoir appréhender une hiérarchie : une série ordonnée de valeurs relatives (densités de populations) pourra être utilement représentée par des densités graphiques ordonnées (valeurs de gris du blanc au noir). Cette propriété concerne la valeur et, à un moindre degré, la taille.

### La différenciation

Le caractère différentiel de certaines variables doit permettre d'identifier sans ambiguïté les signes se reportant à des thématiques différentes ou à mettre en exergue un élément dans un groupe. Cette propriété concerne toutes les variables visuelles avec une plus grande efficacité pour la couleur.

### L'associativité

L'associativité permet d'associer des éléments de nature différente. Cette propriété permet de regrouper en un seul grand ensemble les différents objets d'un thème. La valeur et la couleur sont associatives.

`,
statistique_attr: `# Attribut à afficher
---------
C'est l'attribut qui représente le phénomène à représenter.
C'est généralement un attribut numérique, sauf pour l'affichage par catégorie.

`
}