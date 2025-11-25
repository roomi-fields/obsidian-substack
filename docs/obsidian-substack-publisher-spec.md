# Plugin Obsidian Substack - Spécifications

## Objectif
Créer un plugin Obsidian pour publier sur Substack en combinant:
- **Structure UI/Obsidian** → du plugin LinkedIn (TypeScript)
- **Logique API Substack** → du MCP Substack (Python/TypeScript)

## Sources à fusionner

### Source 1: obsidian-content-os (LinkedIn)
- **Repo**: https://github.com/eharris128/obsidian-content-os
- **Licence**: MIT
- **À réutiliser**:
  - `main.ts` - Structure plugin Obsidian
  - `src/linkedin/PostComposer.ts` - Modal UI
  - `manifest.json` - Configuration plugin
  - Settings panel pattern
  - Ribbon icon setup

### Source 2: substack-mcp-plus (Substack API)
- **Repo**: https://github.com/ty13r/substack-mcp-plus
- **Licence**: MIT (utilise python-substack MIT)
- **À adapter**:
  - Auth logic (session cookie)
  - API client (create/update/publish posts)
  - Markdown → Substack JSON converter
  - Error handling

### Alternative TS: substack-mcp (si disponible)
- Plus simple que substack-mcp-plus
- Déjà en TypeScript
- Vérifier la disponibilité

## Roadmap par phases

### Phase 1: Setup (1 jour)
1. Fork obsidian-content-os → `obsidian-substack-publisher`
2. Nettoyer références LinkedIn
3. Renommer fichiers: `linkedin/` → `substack/`
4. Setup licences (LICENSE, ATTRIBUTIONS.md)
5. Build basique qui compile

**Livrable**: Plugin vide qui charge dans Obsidian

### Phase 2: Auth Substack (2 jours)
1. Créer `src/substack/auth.ts`
2. Implémenter cookie auth (session token)
3. Settings panel: `SUBSTACK_SESSION_TOKEN` + `PUBLICATION_URL`
4. Validation token au démarrage

**Livrable**: Plugin avec auth fonctionnelle

### Phase 3: API Client (2 jours)
1. Créer `src/substack/api.ts`
2. Endpoints essentiels:
   - `createDraft(title, content, tags)`
   - `publishPost(postId)`
   - `listDrafts()`
3. Gestion erreurs + retry logic
4. Markdown → Substack JSON conversion

**Livrable**: API client testé manuellement

### Phase 4: UI Integration (1-2 jours)
1. Adapter `PostComposer.ts` pour Substack
2. Remplacer LinkedIn limits par Substack format
3. Bouton "Create Draft" + "Publish"
4. Preview du contenu converti

**Livrable**: Plugin complet fonctionnel

### Phase 5: Polish (1 jour)
1. Error messages UX
2. Loading states
3. Success notifications
4. README + docs basiques

**Livrable**: Plugin release-ready

## Contraintes techniques

### Stack
- TypeScript
- Obsidian API v1.x
- Node.js 18+
- Build: esbuild (déjà configuré dans LinkedIn plugin)

### Architecture
```
obsidian-substack-publisher/
├── main.ts                 # Entry point (adapté de LinkedIn)
├── manifest.json           # Plugin metadata
├── src/
│   ├── substack/
│   │   ├── api.ts         # API client (nouveau, inspiré MCP)
│   │   ├── auth.ts        # Auth logic (nouveau)
│   │   ├── PostComposer.ts # Modal UI (adapté de LinkedIn)
│   │   └── converter.ts   # Markdown → Substack (adapté MCP)
│   └── utils/
│       └── logger.ts      # Logging (réutilisé LinkedIn)
├── LICENSE                # MIT + attributions
├── ATTRIBUTIONS.md        # Crédits sources
└── README.md
```

### API Substack (non-officielle)
- **Base URL**: `https://{publication}.substack.com/api/v1/`
- **Auth**: Cookie `connect.sid` ou `substack.sid`
- **Endpoints critiques**:
  - `POST /posts` - Créer draft
  - `PUT /posts/{id}` - Mettre à jour
  - `POST /posts/{id}/publish` - Publier
  - `GET /posts` - Lister

### Points d'attention
- ⚠️ API non-officielle, peut casser
- ⚠️ Cookie auth = expire régulièrement
- ⚠️ Pas de retry infini (max 3 tentatives)
- ⚠️ Conversion Markdown imparfaite (plain text fallback OK)

## Licences & Crédits

### LICENSE file
```
MIT License

Copyright (c) 2025 Romain Peyrichou

---

This project incorporates code from:

1. obsidian-content-os
   Copyright (c) eharris128
   MIT License
   https://github.com/eharris128/obsidian-content-os

2. substack-mcp-plus
   Copyright (c) ty13r
   MIT License
   https://github.com/ty13r/substack-mcp-plus
```

### Dans chaque fichier adapté
```typescript
/**
 * Adapted from [source] by [author]
 * Original: [URL]
 */
```

## Commandes utiles

```bash
# Dev
npm install
npm run dev

# Build
npm run build

# Test dans Obsidian
# Copier dist/ vers .obsidian/plugins/substack-publisher/
```

## Critères de succès

**MVP (Minimum Viable Product)**:
- ✅ Authentification Substack par cookie
- ✅ Créer un draft depuis note Obsidian
- ✅ Publier le draft
- ✅ Markdown basique converti (bold, italic, headers)

**Nice-to-have (v2)**:
- Gérer images
- Tags Substack
- Preview avant publish
- Update posts existants

## Notes pour Claude Code

1. **Commence par Phase 1** - ne saute pas d'étapes
2. **Teste après chaque phase** - valide avant de continuer
3. **Si bloqué sur Python→TS conversion**: demande de l'aide, ne devine pas
4. **Évite la sur-ingénierie**: solution simple > solution parfaite
5. **Cookie auth**: utilise le pattern le plus simple possible

## Questions à clarifier avant de coder

- [ ] Quelle version MCP Substack utiliser? (Python ou chercher TS)
- [ ] Besoin d'upload images dès v1?
- [ ] Draft only ou publish direct aussi?
- [ ] Gestion multi-publications Substack?

---

**Prêt à commencer par Phase 1?**
