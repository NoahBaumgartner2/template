# Deployment in Betrieb nehmen (erstes Mal)

Der Server (`179.237.87.63`, User `ubuntu`) und die GitHub-Action sind bereits
vorkonfiguriert. Pro neuem Projekt sind nur noch diese Schritte nötig.

## 1. Voraussetzungen (einmalig pro Projekt)

1. **Domains eintragen** in `config/deploy.yml` (`TBD_DOMAIN`) und
   `config/deploy.staging.yml` (`TBD_STAGING_DOMAIN`). DNS-A-Records beider
   Domains müssen auf `179.237.87.63` zeigen.
2. **SSH-Key** erzeugen und hinterlegen → `docs/deploy-ssh-key-setup.md`.
3. **GitHub Secrets** anlegen (Repo → Settings → Secrets and variables → Actions):
   `DEPLOY_SSH_KEY`, `KAMAL_REGISTRY_PASSWORD`, `RAILS_MASTER_KEY`,
   `POSTGRES_PASSWORD`, `POSTGRES_PASSWORD_STAGING`.
4. **`RAILS_MASTER_KEY`** = Inhalt von `config/master.key` (wird beim Setup neu
   erzeugt, siehe CLAUDE_SETUP.md Schritt 5).

## 2. Erstes Deployment manuell auslösen

Kamal richtet beim ersten `kamal setup` Proxy, DB-Accessory und App auf dem Server ein.

```bash
# Production
bundle exec kamal setup

# Staging
bundle exec kamal setup -c config/deploy.staging.yml
```

> Lokal ohne Ruby? Stattdessen `bundle exec` in einem
> `ruby:3.4.4-slim`-Container ausführen, oder das erste Deployment über
> `workflow_dispatch` der GitHub-Action anstoßen (Actions → Deploy → Run workflow).

## 3. Datenbank migrieren

```bash
bundle exec kamal migrate                              # Production
bundle exec kamal migrate -c config/deploy.staging.yml # Staging
```

## 4. Danach: automatisch

Ab jetzt deployt jeder Push auf `staging` bzw. `main` automatisch (siehe
`docs/git-workflow.md`).
