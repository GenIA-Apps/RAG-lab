# Design Spec — Application Angular Naturalisation

**Date:** 2026-05-25
**Projet:** naturalisation-app (Angular, dans le répertoire parent de RAG-lab)
**Statut:** Approuvé

---

## Contexte

Application web Angular pour les candidats à la naturalisation française. Permet de générer des questions d'entraînement personnalisées avant l'entretien, en appelant l'API NestJS RAG.

**Endpoint:** `POST https://naturalisation.thechesscrew.fr/rag/search`

---

## Architecture

### Stack
- Angular 17+ standalone (pas de NgModules)
- Pas de routing (single page)
- Angular HttpClient pour les appels HTTP
- Signals Angular natifs pour le state
- LocalStorage pour la persistance du profil

### Structure des fichiers
```
naturalisation-app/
├── src/app/
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── components/
│   │   ├── profile-form/
│   │   │   ├── profile-form.component.ts
│   │   │   ├── profile-form.component.html
│   │   │   └── profile-form.component.scss
│   │   ├── theme-form/
│   │   │   ├── theme-form.component.ts
│   │   │   ├── theme-form.component.html
│   │   │   └── theme-form.component.scss
│   │   └── questions-panel/
│   │       ├── questions-panel.component.ts
│   │       ├── questions-panel.component.html
│   │       └── questions-panel.component.scss
│   └── services/
│       ├── rag.service.ts
│       └── profile.service.ts
```

### Services

**RagService**
- Méthode `generateQuestions(payload)` : POST /rag/search
- Retourne uniquement `question: string[]`

**ProfileService**
- Clé localStorage : `candidat_profile`
- Méthodes : `save(profile)` / `load(): CandidateProfile | null`
- Auto-sauvegarde à chaque changement de champ

---

## Modèles de données

### Request
```typescript
interface ThemeRequest {
  themeExpected: string;
  numberOfQuestions: number;
  candidatProfile: CandidateProfile;
}

interface CandidateProfile {
  birthCountry: string;
  birthCity: string;
  gender: string;
  personalContext: string;
}
```

### Response (seule la partie `question` est utilisée)
```typescript
interface RagResponse {
  question: string[];
}
```

---

## Layout

### Desktop (≥768px) — deux colonnes
```
┌─────────────────────────────────────────────────┐
│  Préparez votre entretien de naturalisation      │
├────────────────────┬────────────────────────────┤
│  VOTRE PROFIL      │  QUESTIONS GÉNÉRÉES         │
│  ─────────────     │  ─────────────────          │
│  Pays naissance    │                             │
│  Ville naissance   │  1. Question personnalisée  │
│  Genre             │  2. Question personnalisée  │
│  Contexte perso    │  3. Question personnalisée  │
│                    │                             │
│  THÈME             │  ← skeleton pendant chgt   │
│  ─────────────     │                             │
│  [input thème  ]   │                             │
│  Nb questions: 5   │                             │
│  [  GÉNÉRER  ]     │                             │
└────────────────────┴────────────────────────────┘
```

### Mobile (<768px)
Stack vertical : formulaire au-dessus, questions en dessous.

---

## Design System

### Couleurs
| Rôle | Hex |
|---|---|
| Background | `#FDF2F8` |
| Card | `#FFFFFF` |
| Border | `#FCE9F2` |
| Primary | `#2563EB` |
| CTA (bouton Générer) | `#F97316` |
| Accent (badges questions) | `#F9A8D4` |
| Texte | `#1E293B` |
| Heading | `#831843` |

### Typographie
- **Heading:** EB Garamond (Google Fonts)
- **Body:** Lato (Google Fonts)
- Base : 16px, line-height 1.6

### Effets
- Focus rings : 3px solid `#2563EB`
- Transitions : 150–300ms ease-out
- Radius cartes : 12px
- Ombre légère : `0 2px 8px rgba(0,0,0,0.07)`

---

## Comportements UX

- **Profil persistant** : auto-sauvegardé dans localStorage à chaque `blur` de champ
- **Bouton Générer** : désactivé + spinner pendant l'appel HTTP
- **Questions** : skeleton loader (3 lignes grises animées) pendant le chargement
- **État vide** : message d'invite avant la première génération
- **Erreur HTTP** : message d'erreur inline sous le bouton avec option de réessayer
- **Genre** : select avec options Homme / Femme / Autre
- **Nb de questions** : input number, min 1, max 10, défaut 5

---

## Accessibilité
- Labels visibles sur tous les champs (pas de placeholder-only)
- Aria-labels sur les boutons avec icône
- Contraste ≥ 4.5:1 sur tous les textes
- Navigation clavier complète
- prefers-reduced-motion respecté

---

## Anti-patterns à éviter
- Pas d'emojis comme icônes (Lucide Angular)
- Pas de motion décoratif
- Pas de `process.cwd()` côté client (pas de Node)
- Pas de state management externe (signals suffisent)
