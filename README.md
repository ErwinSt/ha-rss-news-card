# Home Assistant RSS News Card

[![HACS Default][hacs-shield]][hacs]
[![GitHub Release][releases-shield]][releases]
[![License][license-shield]][license]

Une carte personnalisée pour Home Assistant qui affiche les nouvelles d'un flux RSS de manière élégante et moderne.

![screenshot](https://raw.githubusercontent.com/username/ha-rss-news-card/main/screenshot.png)

## Fonctionnalités

- Affichage des dernières nouvelles à partir d'un flux RSS
- Prise en charge des formats RSS et Atom
- Affichage des images, titres, descriptions et dates de publication
- Format de date relatif ou standard
- Configuration simple via l'interface utilisateur de Home Assistant
- Responsive design, s'adapte à tous les écrans
- Support pour l'extraction d'URL à partir d'entités Home Assistant
- Prise en charge du mode sombre et clair
- Composant proxy RSS pour éviter les problèmes CORS

## Installation

### Option 1: HACS (recommandée)

1. Assurez-vous d'avoir [HACS](https://hacs.xyz/) installé
2. Allez dans HACS > Frontends > Menu à trois points > Dépôts personnalisés
3. Ajoutez l'URL de ce dépôt: `https://github.com/username/ha-rss-news-card`
4. Catégorie: Lovelace
5. Cliquez sur "Ajouter"
6. Recherchez "RSS News Card" dans la liste des cartes HACS
7. Cliquez sur "Installer"
8. Redémarrez Home Assistant

### Installation du composant Proxy RSS (recommandé)

Pour éviter les problèmes CORS lors de la récupération des flux RSS:

1. Copiez le dossier `custom_components/rss_proxy` dans votre répertoire Home Assistant
2. Ajoutez `rss_proxy:` à votre configuration.yaml
3. Redémarrez Home Assistant

### Option 2: Installation manuelle

1. Téléchargez les fichiers `ha-rss-news-card.js` et `ha-rss-news-card-editor.js`
2. Créez un dossier `www/community/rss-news-card/` dans votre répertoire Home Assistant
3. Copiez les fichiers dans ce dossier
4. Ajoutez la ressource suivante dans votre configuration Home Assistant:

```yaml
lovelace:
  resources:
    - url: /local/community/rss-news-card/ha-rss-news-card.js
      type: module
```

## Utilisation

1. Ajoutez une nouvelle carte à votre interface Lovelace
2. Sélectionnez "RSS News Card" dans la liste des cartes
3. Configurez la carte avec l'URL de votre flux RSS ou une entité contenant l'URL

### Options de configuration

| Option | Type | Par défaut | Description |
|--------|------|------------|-------------|
| type | string | **Requis** | `custom:ha-rss-news-card` |
| title | string | `Actualités` | Titre de la carte |
| url | string | `null` | URL du flux RSS/Atom |
| entity | string | `null` | Entité HA contenant l'URL du flux |
| max_items | number | `5` | Nombre maximum d'articles à afficher |
| show_description | boolean | `true` | Afficher les descriptions |
| relative_time | boolean | `true` | Utiliser le format de date relatif |
| use_proxy | boolean | `true` | Utiliser le proxy RSS pour éviter les problèmes CORS |
| show_images | boolean | `true` | Afficher les images des articles |
| date_format | string | `DD/MM/YYYY HH:mm` | Format de date personnalisé |

### Exemple de configuration

```yaml
type: custom:ha-rss-news-card
title: Actualités France
url: https://www.lemonde.fr/rss/une.xml
max_items: 5
show_description: true
relative_time: true
show_images: true
```

## Dépannage

Si vous rencontrez des problèmes pour charger les flux RSS, assurez-vous que:

1. Vous avez installé le composant `rss_proxy` et ajouté `rss_proxy:` à votre configuration.yaml
2. Vous avez activé l'option `use_proxy: true` dans la configuration de la carte
3. Le flux RSS est accessible et valide

## Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT.

---

[hacs-shield]: https://img.shields.io/badge/HACS-Default-orange.svg
[hacs]: https://github.com/hacs/integration
[releases-shield]: https://img.shields.io/github/release/username/ha-rss-news-card.svg
[releases]: https://github.com/username/ha-rss-news-card/releases
[license-shield]: https://img.shields.io/github/license/username/ha-rss-news-card.svg
[license]: https://github.com/username/ha-rss-news-card/blob/main/LICENSE
