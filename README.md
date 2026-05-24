# README — RAG Lab NestJS — Préparation entretien de naturalisation

## Objectif du projet

Ce projet implémente un système RAG (*Retrieval Augmented Generation*) en NestJS permettant de simuler un entretien de naturalisation française.

L’application :
- exploite le **Livret du citoyen** (PDF officiel),
- combine ce contexte documentaire avec un **profil candidat personnalisé**,
- puis génère des questions contextualisées via un LLM.

---

# Cas d’usage

Le système simule un agent chargé d’un entretien de naturalisation.

Le candidat fournit :
- son pays de naissance,
- sa ville de naissance,
- son genre,
- un contexte personnel libre.

L’IA :
1. recherche les passages pertinents du livret du citoyen,
2. combine ces informations avec le profil candidat,
3. génère une question réaliste et contextualisée.

---

# Architecture globale

```txt
Livret du citoyen PDF
↓
Extraction texte
↓
Cleaning
↓
Chunking
↓
Embeddings OpenAI
↓
Stockage Qdrant
↓
Recherche sémantique
↓
Injection contexte + profil candidat
↓
LLM
↓
Question personnalisée
```

---

# Technologies utilisées

## Backend
- NestJS
- TypeScript

## IA
- OpenAI API
- Embeddings `text-embedding-3-small`
- GPT-4.1-mini

## Base vectorielle
- Qdrant (Docker)

## Parsing PDF
- pdf-parse

---

# Concepts IA implémentés

## 1. RAG (Retrieval Augmented Generation)

Le modèle ne répond pas uniquement avec sa mémoire interne.

Le système :
1. récupère les documents pertinents,
2. les injecte dans le prompt,
3. puis le LLM répond avec ce contexte.

---

## 2. Embeddings

Les embeddings transforment un texte en vecteur numérique.

Exemple :

```txt
"La République française"
↓
[0.123, -0.882, 0.192, ...]
```

Ces vecteurs permettent :
- la recherche sémantique,
- la comparaison de sens,
- le retrieval intelligent.

---

## 3. Cosine Similarity

La similarité cosine compare l’orientation des vecteurs plutôt que leur taille.

Elle permet de retrouver :
- des textes proches sémantiquement,
- même si les mots exacts diffèrent.

---

## 4. Chunking

Le PDF est découpé en petits morceaux (“chunks”).

Pourquoi ?
- meilleure recherche sémantique,
- limites de contexte des LLM,
- granularité plus précise.

Le système utilise :
- chunk size : 1000 caractères
- overlap : 200 caractères

---

## 5. Cleaning

Le texte extrait du PDF est nettoyé :
- suppression des retours ligne inutiles,
- suppression des caractères parasites,
- suppression des suites de points,
- fusion des mots coupés.

Objectif :
- embeddings plus propres,
- retrieval plus fiable.

---

# Structure du projet

```txt
src/
  rag/
    dto/
      candidate-profile.dto.ts

    chunker/
      chunker.service.ts

    embeddings/
      embeddings.service.ts

    pdf-loader/
      pdf-loader.service.ts

    qdrant/
      qdrant.service.ts

    text-cleaner/
      text-cleaner.service.ts

    rag.controller.ts
    rag.service.ts
    rag.module.ts

  resources/
    livret-citoyen.pdf
```

---

# Pipeline complet

## Étape 1 — Lecture du PDF

Le livret du citoyen est chargé depuis :

```txt
src/resources/livret-citoyen.pdf
```

Le texte est extrait avec `pdf-parse`.

---

## Étape 2 — Cleaning

Le texte est nettoyé :
- suppression des caractères inutiles,
- suppression des retours ligne parasites,
- normalisation des espaces.

---

## Étape 3 — Chunking

Le texte est découpé en chunks avec overlap.

Exemple :

```txt
Chunk 1
"... la République garantit la liberté ..."

Chunk 2
"... liberté d’expression et l’égalité ..."
```

---

## Étape 4 — Embeddings

Chaque chunk est envoyé au modèle OpenAI :

```txt
text-embedding-3-small
```

Chaque chunk devient un vecteur de dimension :

```txt
1536
```

---

## Étape 5 — Stockage vectoriel

Les embeddings sont stockés dans Qdrant.

Chaque point contient :

```ts
{
  id,
  vector,
  payload: {
    text
  }
}
```

---

## Étape 6 — Recherche sémantique

Lorsqu’un utilisateur pose une question :
1. la question est embedée ;
2. Qdrant recherche les chunks les plus proches ;
3. les chunks pertinents sont récupérés.

---

## Étape 7 — Génération IA

Le prompt final contient :
- le profil candidat,
- le contexte du livret,
- les chunks pertinents.

Le LLM génère ensuite une question contextualisée.

---

# Docker — Qdrant

## docker-compose.yml

```yml
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant-rag-lab
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  qdrant_data:
```

## Lancement

```bash
docker compose up -d
```

Dashboard :

```txt
http://localhost:6333/dashboard
```

---

# Endpoints disponibles

## Health check

```http
GET /rag/health
```

---

## Aperçu du PDF

```http
GET /rag/citizen-book/text
```

---

## Aperçu nettoyage

```http
GET /rag/clean-preview
```

---

## Chunks

```http
GET /rag/chunks
```

---

## Test embeddings

```http
GET /rag/embedding-test
```

---

## Indexation Qdrant

```http
POST /rag/index
```

---

## Recherche sémantique

```http
GET /rag/search?query=...
```

---

## Génération de question

```http
POST /rag/interview/question
```

Body :

```json
{
  "birthCountry": "Maroc",
  "birthCity": "Casablanca",
  "gender": "homme",
  "personalContext": "Je vis en France depuis 8 ans..."
}
```

---

# Ce que ce projet démontre

Ce projet démontre :
- compréhension du RAG,
- architecture IA moderne,
- intégration LLM,
- recherche vectorielle,
- backend NestJS structuré,
- contextual prompting,
- retrieval sémantique,
- orchestration IA.

---

# Améliorations possibles

## Backend
- validation DTO
- logging
- monitoring
- caching

## IA
- memory conversationnelle
- multi-agent
- re-ranking
- guardrails
- feedback automatique
- scoring des réponses
- citations précises
- génération adaptive

## Produit
- frontend conversationnel
- historique candidat
- analytics
- dashboard administrateur

---

# Concepts clés à maîtriser pour un entretien IA

- RAG
- embeddings
- cosine similarity
- vector databases
- chunking
- retrieval
- hallucinations
- prompt engineering
- contextual AI
- grounding
- orchestration LLM
- scalable AI architecture
