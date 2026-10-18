# Alco'rope — site vitrine et back-office

React 19 · Vite · CSS classique (BEM) · fonctions Vercel pour le back-office.

## Démarrer

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:5173, le back-office sur http://localhost:5173/admin.

Pour se connecter en local, il faut un compte dans `.env.local` (cf. « Comptes » plus bas) :

```bash
cp .env.example .env.local
node scripts/creer-compte-admin.mjs   # puis coller l'entrée dans ADMIN_COMPTES
```

## Structure

```
contenu/            Contenu éditable du site (un fichier JSON par zone)
public/images/      Images du site ; uploads/ reçoit celles du back-office
shared/schema.js    Schéma du contenu : formulaires du back-office ET validation serveur
api/                Fonctions serverless (Vercel) : connexion, lecture, publication, images
server/             Code serveur partagé par api/ : dépôt GitHub, stockage, session
scripts/            creer-compte-admin.mjs
src/
  cms/              Lien entre le site et le contenu : ContentProvider, Editable, RichText, Bridge
  admin/            Back-office (chargé à part, uniquement sur /admin)
  components/       Blocs réutilisés (en-tête, pied de page, FAQ, avis…)
  pages/            Pages du site
```

## Back-office (`/admin`)

Même principe que château-l-arc : **il n'y a pas de base de données**, le dépôt GitHub
du site sert de stockage.

### Ce qu'on peut faire

- **Pages** : chaque page s'ouvre dans un aperçu. Un clic sur un texte ou une image ouvre
  le champ correspondant, et la saisie s'applique en direct dans l'aperçu. Le design n'est
  jamais modifiable, seulement les textes et les images.
- **Réalisations** : ajouter, modifier, réordonner, mettre en brouillon ou supprimer les
  projets (photos, défi, solution, chiffres, galerie, résultats, fiche technique), avec
  l'aperçu de la fiche en direct.
- **Publier** : toutes les modifications en cours, sur toutes les pages, partent ensemble
  en une seule publication. « Annuler » revient à la version en ligne.

Dans les titres, `*mot*` met le mot en couleur et un retour à la ligne crée un saut de
ligne (sur ordinateur uniquement).

### Fonctionnement

| Fichier | Contenu |
| --- | --- |
| `contenu/general.json` | Coordonnées, avis clients, rayon d'intervention, bandeau d'appel, pied de page |
| `contenu/accueil.json` | Page d'accueil |
| `contenu/services.json` | Les 6 pages services |
| `contenu/realisations.json` | Page Réalisations, textes des fiches, catégories et projets |
| `contenu/contact.json` | Page Contact |
| `public/images/uploads/` | Images envoyées depuis le back-office |

- Le site **embarque** ces fichiers au build (`src/cms/ContentProvider.jsx`).
- Chaque publication est **un commit** sur la branche du site, fait par l'API REST de
  GitHub (`server/depot.js`). Plusieurs fichiers et les nouvelles images partent dans le
  même commit. Vercel reconstruit ensuite le site, qui est à jour en ligne une à deux minutes plus tard.
- Une image choisie dans le back-office est réduite par le navigateur (2 000 px max),
  puis déposée sur GitHub sans commit. Elle n'est reliée au site qu'à la publication.
- Avant d'écrire, le serveur valide le contenu avec `shared/schema.js` : aucun champ
  inconnu ni chemin d'image hors de `/images/` ne peut être enregistré.
- Si quelqu'un a publié entre-temps (autre onglet, autre personne), la publication est
  refusée au lieu d'écraser son travail : il suffit de recharger la page.
- L'historique Git garde toutes les versions : une erreur se corrige en revenant au commit précédent.

**En local, sans `GITHUB_DEPOT`**, le back-office écrit directement dans les fichiers du
projet (mode « local », signalé sur le tableau de bord). C'est pratique pour essayer
l'outil. Avec `GITHUB_DEPOT` renseigné, il publie sur le dépôt, même en local.

### Ajouter un texte modifiable

1. Ajouter la valeur dans le fichier de `contenu/` concerné.
2. Déclarer le champ dans `shared/schema.js`, avec son libellé et son type.
3. Dans le composant, lire la valeur avec `useContenu('…')` et l'entourer d'un
   `<Editable path="fichier.chemin.du.champ">` pour la rendre cliquable dans l'aperçu.

### Comptes

Les comptes sont déclarés dans la variable `ADMIN_COMPTES` : une entrée par compte,
séparées par des virgules, au format `email:scrypt:<sel>:<empreinte>`. Le mot de passe
n'est jamais stocké, seulement son empreinte. Pour créer une entrée :

```bash
node scripts/creer-compte-admin.mjs
```

La session est un cookie signé (HMAC-SHA256, 7 jours, `HttpOnly`, `SameSite=Lax`).
Retirer une entrée d'`ADMIN_COMPTES` coupe l'accès, y compris aux sessions ouvertes ;
changer `ADMIN_SECRET_SESSION` déconnecte tout le monde. Les écritures venant d'un autre
site sont refusées.

### Mise en ligne (Vercel → Settings → Environment Variables)

| Variable | Rôle |
| --- | --- |
| `GITHUB_DEPOT` | `propriétaire/dépôt` du site (ex. `OrionStudioSAS/alcorope`) |
| `GITHUB_TOKEN` | Jeton *fine-grained* limité au dépôt, permission **Contents : Read and write** |
| `ADMIN_COMPTES` | Comptes du back-office (cf. ci-dessus) |
| `ADMIN_SECRET_SESSION` | Clé aléatoire d'au moins 32 caractères (`openssl rand -base64 32`) |
| `GITHUB_BRANCHE` | Facultative : `main` par défaut |

`vercel.json` renvoie toutes les adresses du site vers l'application, sauf `/api/`.
Le dépôt doit être relié au projet Vercel pour que chaque publication déclenche un
déploiement.
