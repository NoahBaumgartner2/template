# Deploy SSH Key Setup

Der SSH-Key für das Kamal-Deployment muss **ohne Passphrase** generiert werden.
GitHub Actions nutzt diesen Key, um sich auf dem Server einzuloggen.

## Neuen Key generieren (lokal ausführen)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/template_deploy
# Bei "Enter passphrase" einfach ENTER drücken (keine Passphrase!)
```

> Hinweis: `~/.ssh/template_deploy` ist auch der Key-Pfad in `config/deploy.yml`
> / `config/deploy.staging.yml`. Wird beim Projekt-Setup mit umbenannt.

## Public Key auf den Server kopieren

```bash
ssh-copy-id -i ~/.ssh/template_deploy.pub ubuntu@179.237.87.63
```

Oder manuell den Inhalt von `~/.ssh/template_deploy.pub` in
`~/.ssh/authorized_keys` auf dem Server (`ubuntu@179.237.87.63`) einfügen.

## Private Key als GitHub Secret hinterlegen

1. `cat ~/.ssh/template_deploy` → kompletten Inhalt kopieren
   (inkl. `-----BEGIN...` und `-----END...`)
2. GitHub Repo → Settings → Secrets and variables → Actions
3. Secret `DEPLOY_SSH_KEY` neu anlegen
4. Inhalt einfügen → Save

## Benötigte GitHub Secrets (Übersicht)

| Secret | Zweck |
|---|---|
| `DEPLOY_SSH_KEY` | SSH Private Key für den Server-Zugriff (`ubuntu@179.237.87.63`) |
| `KAMAL_REGISTRY_PASSWORD` | GitHub Container Registry Token (ghcr.io, Scope `write:packages`) |
| `RAILS_MASTER_KEY` | Inhalt von `config/master.key` |
| `POSTGRES_PASSWORD` | Passwort der Production-Datenbank (frei wählbar) |
| `POSTGRES_PASSWORD_STAGING` | Passwort der Staging-Datenbank (frei wählbar) |
