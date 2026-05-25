# Naturalisation Angular App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer une application Angular standalone dans `RAG-Laboratory/naturalisation-app` qui permet aux candidats à la naturalisation de générer des questions d'entraînement personnalisées via l'API RAG.

**Architecture:** Single-page app Angular 17+ standalone, deux colonnes (formulaire gauche, questions droite). Profil candidat persisté en localStorage. Appel HTTP POST vers `https://naturalisation.thechesscrew.fr/rag/search`.

**Tech Stack:** Angular 17+, Angular HttpClient, Angular Signals, FormsModule, SCSS, Lato + EB Garamond (Google Fonts)

**Répertoire cible:** `C:\Users\Albatros\Documents\projects\RAG-Laboratory\naturalisation-app\`

---

## File Map

| Fichier | Rôle |
|---|---|
| `src/app/models/rag.models.ts` | Interfaces TypeScript (CandidateProfile, ThemeRequest, RagResponse) |
| `src/app/services/profile.service.ts` | Lecture/écriture profil dans localStorage |
| `src/app/services/profile.service.spec.ts` | Tests ProfileService |
| `src/app/services/rag.service.ts` | Appel HTTP POST /rag/search |
| `src/app/services/rag.service.spec.ts` | Tests RagService |
| `src/app/components/profile-form/` | Formulaire profil candidat + auto-save |
| `src/app/components/theme-form/` | Saisie thème + bouton Générer |
| `src/app/components/questions-panel/` | Affichage questions, skeleton, empty state, erreur |
| `src/app/app.component.*` | Layout 2 colonnes, orchestration state signals |
| `src/app/app.config.ts` | provideHttpClient() |
| `src/styles.scss` | CSS variables, design system global |
| `src/index.html` | Google Fonts import |

---

## Task 1 — Scaffold du projet Angular

**Files:**
- Create: `C:\Users\Albatros\Documents\projects\RAG-Laboratory\naturalisation-app\` (via CLI)

- [ ] **Step 1 : Vérifier que Angular CLI est installé**

```bash
ng version
```
Si absent : `npm install -g @angular/cli`

- [ ] **Step 2 : Générer le projet dans le répertoire parent**

```bash
cd C:\Users\Albatros\Documents\projects\RAG-Laboratory
ng new naturalisation-app --style=scss --routing=false --skip-git --skip-tests=false
```
Répondre `N` à la question sur SSR si posée.

- [ ] **Step 3 : Vérifier que le projet démarre**

```bash
cd naturalisation-app
npm start
```
Attendu : `Application bundle generation complete.` sur `http://localhost:4200`

- [ ] **Step 4 : Commit initial**

```bash
cd C:\Users\Albatros\Documents\projects\RAG-Laboratory\naturalisation-app
git init
git add .
git commit -m "chore: scaffold Angular naturalisation app"
```

---

## Task 2 — Design system global (styles + fonts)

**Files:**
- Modify: `src/index.html`
- Modify: `src/styles.scss`

- [ ] **Step 1 : Ajouter Google Fonts dans index.html**

Remplacer le contenu de `src/index.html` :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Préparez votre naturalisation</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

- [ ] **Step 2 : Écrire les styles globaux dans src/styles.scss**

```scss
:root {
  --color-bg: #FDF2F8;
  --color-card: #FFFFFF;
  --color-border: #FCE9F2;
  --color-primary: #2563EB;
  --color-cta: #F97316;
  --color-accent: #F9A8D4;
  --color-text: #1E293B;
  --color-heading: #831843;
  --color-muted: #64748B;
  --color-error: #DC2626;
  --color-error-bg: #FEF2F2;

  --font-heading: 'EB Garamond', Georgia, serif;
  --font-body: 'Lato', system-ui, sans-serif;

  --radius: 12px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  --transition: 200ms ease-out;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--color-heading);
  margin: 0;
}

input, select, textarea, button {
  font-family: var(--font-body);
  font-size: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  input, select, textarea {
    padding: 0.625rem 0.875rem;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-card);
    color: var(--color-text);
    min-height: 44px;
    transition: border-color var(--transition), box-shadow var(--transition);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    &::placeholder { color: var(--color-muted); }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3 : Vérifier visuellement que le fond rose pâle s'affiche sur `http://localhost:4200`**

- [ ] **Step 4 : Commit**

```bash
git add src/index.html src/styles.scss
git commit -m "style: add design system — rose pâle, EB Garamond, Lato"
```

---

## Task 3 — Modèles TypeScript

**Files:**
- Create: `src/app/models/rag.models.ts`

- [ ] **Step 1 : Créer le fichier de modèles**

```typescript
// src/app/models/rag.models.ts
export interface CandidateProfile {
  birthCountry: string;
  birthCity: string;
  gender: string;
  personalContext: string;
}

export interface ThemeRequest {
  themeExpected: string;
  numberOfQuestions: number;
  candidatProfile: CandidateProfile;
}

export interface RagResponse {
  question: string[];
  retrievedChunks: Array<{ score: number; preview: string }>;
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/app/models/rag.models.ts
git commit -m "feat: add RAG domain models"
```

---

## Task 4 — ProfileService (TDD)

**Files:**
- Create: `src/app/services/profile.service.ts`
- Create: `src/app/services/profile.service.spec.ts`

- [ ] **Step 1 : Écrire les tests en premier**

```typescript
// src/app/services/profile.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
    localStorage.clear();
  });

  it('should return empty profile when nothing stored', () => {
    const profile = service.load();
    expect(profile.birthCountry).toBe('');
    expect(profile.birthCity).toBe('');
    expect(profile.gender).toBe('');
    expect(profile.personalContext).toBe('');
  });

  it('should save and reload profile correctly', () => {
    const profile = {
      birthCountry: 'Tunisie',
      birthCity: 'Tunis',
      gender: 'Femme',
      personalContext: 'Test context',
    };
    service.save(profile);
    expect(service.load()).toEqual(profile);
  });

  it('should return empty profile when stored JSON is invalid', () => {
    localStorage.setItem('candidat_profile', 'not-valid-json{{');
    const profile = service.load();
    expect(profile.birthCountry).toBe('');
  });

  it('should overwrite existing profile on save', () => {
    service.save({ birthCountry: 'Maroc', birthCity: 'Rabat', gender: 'Homme', personalContext: 'old' });
    service.save({ birthCountry: 'Tunisie', birthCity: 'Tunis', gender: 'Femme', personalContext: 'new' });
    expect(service.load().birthCountry).toBe('Tunisie');
  });
});
```

- [ ] **Step 2 : Lancer les tests — vérifier qu'ils échouent**

```bash
ng test --include=src/app/services/profile.service.spec.ts --watch=false
```
Attendu : erreur `Cannot find module './profile.service'`

- [ ] **Step 3 : Implémenter ProfileService**

```typescript
// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { CandidateProfile } from '../models/rag.models';

const STORAGE_KEY = 'candidat_profile';
const DEFAULT_PROFILE: CandidateProfile = {
  birthCountry: '',
  birthCity: '',
  gender: '',
  personalContext: '',
};

@Injectable({ providedIn: 'root' })
export class ProfileService {
  save(profile: CandidateProfile): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  load(): CandidateProfile {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PROFILE };
    try {
      return JSON.parse(stored) as CandidateProfile;
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }
}
```

- [ ] **Step 4 : Relancer les tests — vérifier qu'ils passent**

```bash
ng test --include=src/app/services/profile.service.spec.ts --watch=false
```
Attendu : `4 specs, 0 failures`

- [ ] **Step 5 : Commit**

```bash
git add src/app/services/profile.service.ts src/app/services/profile.service.spec.ts
git commit -m "feat: add ProfileService with localStorage persistence"
```

---

## Task 5 — RagService (TDD)

**Files:**
- Create: `src/app/services/rag.service.ts`
- Create: `src/app/services/rag.service.spec.ts`

- [ ] **Step 1 : Écrire les tests en premier**

```typescript
// src/app/services/rag.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RagService } from './rag.service';

const API_URL = 'https://naturalisation.thechesscrew.fr/rag/search';

describe('RagService', () => {
  let service: RagService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should POST payload and return question array', (done) => {
    const payload = {
      themeExpected: 'les valeurs de la République',
      numberOfQuestions: 3,
      candidatProfile: { birthCountry: 'Tunisie', birthCity: 'Tunis', gender: 'Femme', personalContext: 'Test' },
    };

    service.generateQuestions(payload).subscribe((questions) => {
      expect(questions).toEqual(['Q1 ?', 'Q2 ?', 'Q3 ?']);
      done();
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ question: ['Q1 ?', 'Q2 ?', 'Q3 ?'], retrievedChunks: [] });
  });

  it('should propagate HTTP errors', (done) => {
    service.generateQuestions({
      themeExpected: 'test',
      numberOfQuestions: 1,
      candidatProfile: { birthCountry: '', birthCity: '', gender: '', personalContext: '' },
    }).subscribe({
      error: (err) => {
        expect(err.status).toBe(503);
        done();
      },
    });

    httpMock.expectOne(API_URL).flush(null, { status: 503, statusText: 'Service Unavailable' });
  });
});
```

- [ ] **Step 2 : Lancer les tests — vérifier qu'ils échouent**

```bash
ng test --include=src/app/services/rag.service.spec.ts --watch=false
```
Attendu : erreur `Cannot find module './rag.service'`

- [ ] **Step 3 : Implémenter RagService**

```typescript
// src/app/services/rag.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ThemeRequest, RagResponse } from '../models/rag.models';

const API_URL = 'https://naturalisation.thechesscrew.fr/rag/search';

@Injectable({ providedIn: 'root' })
export class RagService {
  private http = inject(HttpClient);

  generateQuestions(payload: ThemeRequest): Observable<string[]> {
    return this.http
      .post<RagResponse>(API_URL, payload)
      .pipe(map((response) => response.question));
  }
}
```

- [ ] **Step 4 : Relancer les tests — vérifier qu'ils passent**

```bash
ng test --include=src/app/services/rag.service.spec.ts --watch=false
```
Attendu : `2 specs, 0 failures`

- [ ] **Step 5 : Commit**

```bash
git add src/app/services/rag.service.ts src/app/services/rag.service.spec.ts
git commit -m "feat: add RagService — POST /rag/search"
```

---

## Task 6 — Configurer HttpClient dans app.config.ts

**Files:**
- Modify: `src/app/app.config.ts`

- [ ] **Step 1 : Mettre à jour app.config.ts**

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
  ],
};
```

- [ ] **Step 2 : Commit**

```bash
git add src/app/app.config.ts
git commit -m "feat: register HttpClient provider"
```

---

## Task 7 — ProfileForm component

**Files:**
- Create: `src/app/components/profile-form/profile-form.component.ts`
- Create: `src/app/components/profile-form/profile-form.component.html`
- Create: `src/app/components/profile-form/profile-form.component.scss`

- [ ] **Step 1 : Créer le composant (TypeScript)**

```typescript
// src/app/components/profile-form/profile-form.component.ts
import { Component, OnInit, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CandidateProfile } from '../../models/rag.models';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
})
export class ProfileFormComponent implements OnInit {
  profileChange = output<CandidateProfile>();

  private profileService = inject(ProfileService);

  profile: CandidateProfile = {
    birthCountry: '',
    birthCity: '',
    gender: '',
    personalContext: '',
  };

  ngOnInit(): void {
    this.profile = this.profileService.load();
    this.profileChange.emit({ ...this.profile });
  }

  onFieldChange(): void {
    this.profileService.save(this.profile);
    this.profileChange.emit({ ...this.profile });
  }
}
```

- [ ] **Step 2 : Créer le template HTML**

```html
<!-- src/app/components/profile-form/profile-form.component.html -->
<section class="profile-form">
  <h2 class="section-title">Votre profil</h2>

  <div class="field">
    <label for="birthCountry">Pays de naissance *</label>
    <input
      id="birthCountry"
      type="text"
      [(ngModel)]="profile.birthCountry"
      (blur)="onFieldChange()"
      placeholder="Ex : Tunisie"
      autocomplete="country-name"
    />
  </div>

  <div class="field">
    <label for="birthCity">Ville de naissance *</label>
    <input
      id="birthCity"
      type="text"
      [(ngModel)]="profile.birthCity"
      (blur)="onFieldChange()"
      placeholder="Ex : Tunis"
      autocomplete="address-level2"
    />
  </div>

  <div class="field">
    <label for="gender">Genre *</label>
    <select id="gender" [(ngModel)]="profile.gender" (change)="onFieldChange()">
      <option value="">Sélectionner</option>
      <option value="Homme">Homme</option>
      <option value="Femme">Femme</option>
      <option value="Autre">Autre</option>
    </select>
  </div>

  <div class="field">
    <label for="personalContext">Contexte personnel *</label>
    <textarea
      id="personalContext"
      [(ngModel)]="profile.personalContext"
      (blur)="onFieldChange()"
      rows="4"
      placeholder="Ex : Je m'appelle Naouresse, je suis en France depuis 8 ans, je travaille dans le marketing digital…"
    ></textarea>
  </div>
</section>
```

- [ ] **Step 3 : Créer les styles**

```scss
// src/app/components/profile-form/profile-form.component.scss
.profile-form {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}
```

- [ ] **Step 4 : Commit**

```bash
git add src/app/components/profile-form/
git commit -m "feat: add ProfileForm component with auto-save"
```

---

## Task 8 — ThemeForm component

**Files:**
- Create: `src/app/components/theme-form/theme-form.component.ts`
- Create: `src/app/components/theme-form/theme-form.component.html`
- Create: `src/app/components/theme-form/theme-form.component.scss`

- [ ] **Step 1 : Créer le composant (TypeScript)**

```typescript
// src/app/components/theme-form/theme-form.component.ts
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface GenerateEvent {
  themeExpected: string;
  numberOfQuestions: number;
}

@Component({
  selector: 'app-theme-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './theme-form.component.html',
  styleUrl: './theme-form.component.scss',
})
export class ThemeFormComponent {
  loading = input<boolean>(false);
  generate = output<GenerateEvent>();

  theme = '';
  numberOfQuestions = 5;

  onSubmit(): void {
    if (!this.theme.trim() || this.loading()) return;
    this.generate.emit({
      themeExpected: this.theme.trim(),
      numberOfQuestions: this.numberOfQuestions,
    });
  }
}
```

- [ ] **Step 2 : Créer le template HTML**

```html
<!-- src/app/components/theme-form/theme-form.component.html -->
<section class="theme-form">
  <h2 class="section-title">Thème d'entraînement</h2>

  <div class="field">
    <label for="theme">Thème *</label>
    <input
      id="theme"
      type="text"
      [(ngModel)]="theme"
      placeholder="Ex : les valeurs de la République française"
    />
  </div>

  <div class="field">
    <label for="numberOfQuestions">Nombre de questions</label>
    <input
      id="numberOfQuestions"
      type="number"
      [(ngModel)]="numberOfQuestions"
      min="1"
      max="10"
    />
  </div>

  <button
    type="button"
    class="btn-generate"
    (click)="onSubmit()"
    [disabled]="!theme.trim() || loading()"
    [attr.aria-busy]="loading()"
    aria-label="Générer les questions d'entraînement"
  >
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
      Génération en cours…
    } @else {
      Générer les questions
    }
  </button>
</section>
```

- [ ] **Step 3 : Créer les styles**

```scss
// src/app/components/theme-form/theme-form.component.scss
.theme-form {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.btn-generate {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: var(--color-cta);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background var(--transition), opacity var(--transition);
  margin-top: 0.5rem;

  &:hover:not(:disabled) { background: #ea6c00; }

  &:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 4 : Commit**

```bash
git add src/app/components/theme-form/
git commit -m "feat: add ThemeForm component with loading state"
```

---

## Task 9 — QuestionsPanel component

**Files:**
- Create: `src/app/components/questions-panel/questions-panel.component.ts`
- Create: `src/app/components/questions-panel/questions-panel.component.html`
- Create: `src/app/components/questions-panel/questions-panel.component.scss`

- [ ] **Step 1 : Créer le composant (TypeScript)**

```typescript
// src/app/components/questions-panel/questions-panel.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-questions-panel',
  standalone: true,
  templateUrl: './questions-panel.component.html',
  styleUrl: './questions-panel.component.scss',
})
export class QuestionsPanelComponent {
  questions = input<string[]>([]);
  loading = input<boolean>(false);
  error = input<string | null>(null);

  get skeletonItems(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
```

- [ ] **Step 2 : Créer le template HTML**

```html
<!-- src/app/components/questions-panel/questions-panel.component.html -->
<section class="questions-panel">
  <h2 class="section-title">Questions générées</h2>

  @if (loading()) {
    <div class="skeleton-list" role="status" aria-label="Chargement des questions…">
      @for (i of skeletonItems; track i) {
        <div class="skeleton-item">
          <div class="skeleton-badge"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line long"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      }
    </div>
  } @else if (error()) {
    <div class="error-state" role="alert">
      <p class="error-message">{{ error() }}</p>
      <p class="error-hint">Vérifiez votre connexion et réessayez.</p>
    </div>
  } @else if (questions().length === 0) {
    <div class="empty-state" role="status">
      <p>
        Renseignez votre profil, choisissez un thème et cliquez sur
        <strong>Générer les questions</strong> pour commencer votre entraînement.
      </p>
    </div>
  } @else {
    <ol class="questions-list">
      @for (question of questions(); track $index) {
        <li class="question-item">
          <span class="question-badge" aria-hidden="true">{{ $index + 1 }}</span>
          <p class="question-text">{{ question }}</p>
        </li>
      }
    </ol>
  }
</section>
```

- [ ] **Step 3 : Créer les styles**

```scss
// src/app/components/questions-panel/questions-panel.component.scss
.questions-panel {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  height: 100%;
}

.questions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.question-item {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}

.question-badge {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: var(--color-accent);
  color: var(--color-heading);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  margin-top: 2px;
}

.question-text {
  margin: 0;
  line-height: 1.65;
}

// Empty state
.empty-state {
  color: var(--color-muted);
  text-align: center;
  padding: 3rem 1rem;

  p {
    margin: 0 auto;
    max-width: 320px;
  }
}

// Error state
.error-state {
  background: var(--color-error-bg);
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  color: var(--color-error);

  .error-message { margin: 0; font-weight: 600; }
  .error-hint { margin: 0.25rem 0 0; font-size: 0.875rem; opacity: 0.85; }
}

// Skeleton loader
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.skeleton-item {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}

.skeleton-badge {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(90deg, #FCE9F2 25%, #FDF2F8 50%, #FCE9F2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 4px;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #FCE9F2 25%, #FDF2F8 50%, #FCE9F2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &.long { width: 90%; }
  &.short { width: 55%; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 4 : Commit**

```bash
git add src/app/components/questions-panel/
git commit -m "feat: add QuestionsPanel with skeleton, empty state, error state"
```

---

## Task 10 — AppComponent — orchestration & layout

**Files:**
- Modify: `src/app/app.component.ts`
- Modify: `src/app/app.component.html`
- Modify: `src/app/app.component.scss`

- [ ] **Step 1 : Mettre à jour app.component.ts**

```typescript
// src/app/app.component.ts
import { Component, signal, inject } from '@angular/core';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { ThemeFormComponent, GenerateEvent } from './components/theme-form/theme-form.component';
import { QuestionsPanelComponent } from './components/questions-panel/questions-panel.component';
import { RagService } from './services/rag.service';
import { ProfileService } from './services/profile.service';
import { CandidateProfile } from './models/rag.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProfileFormComponent, ThemeFormComponent, QuestionsPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private ragService = inject(RagService);
  private profileService = inject(ProfileService);

  profile = signal<CandidateProfile>(this.profileService.load());
  questions = signal<string[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  onProfileChange(profile: CandidateProfile): void {
    this.profile.set(profile);
  }

  onGenerate(event: GenerateEvent): void {
    this.loading.set(true);
    this.error.set(null);

    this.ragService.generateQuestions({
      themeExpected: event.themeExpected,
      numberOfQuestions: event.numberOfQuestions,
      candidatProfile: this.profile(),
    }).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Une erreur est survenue lors de la génération des questions.');
        this.loading.set(false);
      },
    });
  }
}
```

- [ ] **Step 2 : Mettre à jour app.component.html**

```html
<!-- src/app/app.component.html -->
<div class="app">
  <header class="header">
    <div class="header-inner">
      <h1>Préparez votre entretien de naturalisation</h1>
      <p class="subtitle">Générez des questions personnalisées pour vous entraîner avant votre entretien</p>
    </div>
  </header>

  <main class="main">
    <div class="left-panel">
      <app-profile-form (profileChange)="onProfileChange($event)" />
      <app-theme-form [loading]="loading()" (generate)="onGenerate($event)" />
    </div>
    <div class="right-panel">
      <app-questions-panel
        [questions]="questions()"
        [loading]="loading()"
        [error]="error()"
      />
    </div>
  </main>
</div>
```

- [ ] **Step 3 : Mettre à jour app.component.scss**

```scss
// src/app/app.component.scss
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-card);
  box-shadow: 0 1px 4px rgba(131, 24, 67, 0.06);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
}

h1 {
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  margin-bottom: 0.25rem;
}

.subtitle {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.95rem;
}

.main {
  flex: 1;
  display: grid;
  grid-template-columns: 390px 1fr;
  gap: 1.5rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.right-panel {
  position: sticky;
  top: 1.5rem;
}
```

- [ ] **Step 4 : Vérifier l'application sur `http://localhost:4200`**

Checklist visuelle :
- [ ] Fond rose pâle `#FDF2F8` visible
- [ ] Deux colonnes sur desktop
- [ ] Formulaire profil pré-rempli si données en localStorage
- [ ] Bouton "Générer" désactivé si le champ thème est vide
- [ ] Spinner affiché pendant la requête
- [ ] Questions affichées avec badge rose numéroté
- [ ] Skeleton affiché pendant le chargement
- [ ] Layout mobile (stack vertical) à 768px

- [ ] **Step 5 : Commit final**

```bash
git add src/app/app.component.ts src/app/app.component.html src/app/app.component.scss
git commit -m "feat: wire up AppComponent — two-column layout, signals, HTTP orchestration"
```

---

## Checklist finale (UX Pro Max)

- [ ] Contraste texte ≥ 4.5:1 sur fond rose
- [ ] Focus rings visibles sur tous les champs (`outline: 3px solid #2563EB`)
- [ ] Touch targets ≥ 44px (inputs, bouton)
- [ ] `prefers-reduced-motion` respecté (dans styles.scss)
- [ ] Pas d'emojis comme icônes
- [ ] Labels visibles sur tous les champs
- [ ] `aria-busy` sur le bouton en cours de chargement
- [ ] `role="alert"` sur l'état d'erreur
- [ ] `role="status"` sur skeleton et empty state
