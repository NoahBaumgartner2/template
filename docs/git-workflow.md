# Git- & Deploy-Workflow

Drei Branches, automatisches Deployment via GitHub Actions (`.github/workflows/deploy.yml`).

| Branch          | Zweck                         | Deployment-Ziel        |
|-----------------|-------------------------------|------------------------|
| `workingbranch` | aktive Entwicklung            | — (kein Auto-Deploy)   |
| `staging`       | Vorschau / Test               | Staging (Push → Deploy)|
| `main`          | Produktion                    | Production (Push → Deploy)|

## Ablauf

```bash
# 1. Auf workingbranch entwickeln
git checkout workingbranch
# ... arbeiten, committen ...
git push

# 2. Auf Staging testen
git checkout staging
git merge workingbranch
git push                 # → deployt automatisch auf Staging

# 3. Auf Production veröffentlichen
git checkout main
git merge staging
git push                 # → deployt automatisch auf Production
```

## Wichtig

- **Erstes Deployment** (Staging wie Production) muss einmal **manuell** ausgeführt
  werden, danach läuft alles über die Pipeline. Siehe `docs/staging-setup.md`.
- Auto-Deploy greift **nur** auf `main` (Production) und `staging` (Staging).
- Voraussetzung: alle GitHub Secrets sind gesetzt (siehe `docs/deploy-ssh-key-setup.md`)
  und in `config/deploy.yml` / `config/deploy.staging.yml` ist `TBD_DOMAIN` /
  `TBD_STAGING_DOMAIN` durch echte Domains ersetzt.
