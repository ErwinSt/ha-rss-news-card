# RSS News Card pour Home Assistant

Une carte personnalisée pour Home Assistant qui affiche les nouvelles d'un flux RSS de manière élégante et moderne.

## Installation

1. Installez la carte via HACS
2. Ajoutez la carte à votre interface Lovelace

### Installation du composant Proxy RSS (recommandé)

Pour éviter les problèmes CORS lors de la récupération des flux RSS:

1. Téléchargez ou clonez ce dépôt
2. Copiez le dossier `custom_components/rss_proxy` dans votre répertoire Home Assistant
3. Ajoutez `rss_proxy:` à votre configuration.yaml
4. Redémarrez Home Assistant

## Configuration

```yaml
type: custom:ha-rss-news-card
title: Actualités France
url: https://www.lemonde.fr/rss/une.xml
max_items: 5
show_description: true
relative_time: true
show_images: true
use_proxy: true
```

## Fonctionnalités

- Affichage des dernières nouvelles à partir d'un flux RSS
- Prise en charge des formats RSS et Atom
- Affichage des images, titres, descriptions et dates de publication
- Format de date relatif ou standard
- Support pour l'extraction d'URL à partir d'entités Home Assistant
- Prise en charge du mode sombre et clair
- Composant proxy RSS pour éviter les problèmes CORS