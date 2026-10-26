# Portfolio — Antoine Wexsteen-Bézu

Ouvrir `index.html` ou servir ce dossier avec un serveur statique. Aucun build requis.

## Projets

- Station Interne : démonstration autonome dans `demos/intranet/`. Feuille de style et composants HTML issus du projet original, identité neutralisée. Le PHP et la base de données sont remplacés par un moteur navigateur : revue de presse, publication fictive, agenda, annuaire, organismes, documents, espace personnel et gestion des fonctions. Aucun fichier de contacts, photographie, compte, configuration ou document interne réel n’est importé. Les modifications restent dans la session et peuvent être réinitialisées.
- Weazel News, station interne : véritables fichiers frontend fournis dans `station-interne-weazel-news-main.zip`. L’adaptateur `demos/weazel-station/portfolio-demo.js` remplace les API par des données fictives dans la session du navigateur. Planning, panneaux, archives et catalogue de facturation sont explorables. Le bouton « Réinitialiser la démo » réinitialise le planning et les archives.
- Weazel News, site public : véritables fichiers frontend fournis dans `weazel-news-main.zip`. Les actions Discord, formulaires et services externes sont désactivés pour cet aperçu.
- IA et actualité : projet en cours, workflow de démonstration préécrit pour explorer rédaction, adaptation au réseau, validation et publication simulée. Aucun appel IA ou réseau social.
- Simpson RolePlay : présentation du projet en cours, mapping et développement de scripts par Antoine. Aucun script de jeu ni contenu de l’archive d’un autre compte n’est intégré.

Les factures et montants de la démonstration Weazel concernent l’univers roleplay. Ne pas y saisir de données personnelles réelles. L’interface originale peut conserver un brouillon localement dans le navigateur.

Fire Production figure uniquement dans le parcours, comme expérience terminée en août 2026.

Les six visuels de Simpson RolePlay se trouvent dans `assets/images/simpson-roleplay/`. La page projets présente les étapes du travail et une galerie avec agrandissement, navigation et commandes clavier.

## Vérifications

Syntaxe JavaScript, existence des liens et ressources locales, ancres, identifiants HTML, opérations locales de planning et d’archives, compteur de facturation et blocage des requêtes externes de l’adaptateur contrôlés. Le rendu navigateur reste à vérifier : l’aperçu local était inaccessible dans l’environnement d’exécution.

## Organisation des fichiers

```text
index.html                   Accueil et point d’entrée
pages/                       Projets, parcours et contact
assets/
  css/                       Feuille de style du portfolio
  js/                        Navigation, pop-up et interactions
  images/                    Photos personnelles
  icons/                     Favicon
documents/
  cv/                        CV téléchargeable
  certifications/            Diplômes, attestations et certifications
demos/
  intranet/                  Intranet anonymisé et interactions locales
  weazel-site/               Site public autonome
  weazel-station/            Station interne autonome et adaptateur local
README.md                    Documentation
```

Les démonstrations conservent leurs fichiers à l’intérieur de leur propre dossier pour rester autonomes. Les documents utilisent des noms sans espaces ni accents. Tous les liens sont relatifs : le portfolio peut être placé dans un sous-dossier d’hébergement. Pour le consulter, ouvrir `index.html` à la racine.
