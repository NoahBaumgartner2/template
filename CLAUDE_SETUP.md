# CLAUDE_SETUP.md — Vorlage in ein echtes Projekt verwandeln

> **An Claude Code:** Diese Datei ist die Arbeitsanweisung, wenn aus dieser
> Vorlage (`template`) ein konkretes, benanntes Projekt erstellt werden soll.
> Arbeite die Schritte **in dieser Reihenfolge** ab und hake die Checkliste am
> Ende ab. Lösche diese Datei (und passe die README an), wenn alles erledigt ist.

## Was diese Vorlage mitbringt

Ein **blankes** Ruby on Rails (Docker + TailwindCSS + PostgreSQL) Setup — bewusst
ohne fertiges Branding/Layout, damit jedes Projekt frisch und eigenständig aussieht.
**Bereits vollständig vorkonfiguriert** (muss i. d. R. nicht angefasst werden):

- **Docker / devcontainer** — lokale Entwicklung
- **TailwindCSS** — neutrale Basis-Palette in `app/assets/tailwind/application.css`
- **PostgreSQL** — `config/database.yml` ist komplett ENV-getrieben
- **Kamal-Deployment** — `config/deploy.yml` (Production) + `config/deploy.staging.yml`
  (Staging), `.kamal/secrets`, GitHub-Action `.github/workflows/deploy.yml`
  - Server ist **immer derselbe**: `179.237.87.63` (User `ubuntu`) — bereits eingetragen
  - **Einziges TBD pro Projekt: die Domain(s)** + die GitHub Secrets

**Pro Projekt zu tun:** Namen ersetzen (Schritt 1–2), Inhalt/Branding aufbauen
(Schritt 3), Credentials neu erzeugen (Schritt 5), Domain + GitHub Secrets setzen
(Schritt 7), pushen (Schritt 8).

---

## 0. Den Projektnamen festlegen

Frag (oder leite ab) **einen** Projektnamen und bilde daraus die **vier
Schreibweisen**. Beispiel anhand `zahnarzt_kirchlindach`:

| Platzhalter            | Schreibweise        | Beispiel                  | Verwendung |
|------------------------|---------------------|---------------------------|------------|
| `<project_name>`       | snake_case          | `zahnarzt_kirchlindach`   | Verzeichnis, DB-Namen, devcontainer-Name, DATABASE_URL, channel_prefix, Kamal `service`/`image` |
| `<ProjectName>`        | PascalCase          | `ZahnarztKirchlindach`    | Ruby-Modul in `config/application.rb` |
| `<PROJECT_NAME>`       | SCREAMING_SNAKE     | `ZAHNARZT_KIRCHLINDACH`   | (selten) ENV-Variablen |
| `<project-name>`       | kebab-case / Domain | `zahnarzt-kirchlindach`   | Domain, E-Mail, sichtbare URLs |
| `<Project Display>`    | lesbarer Klartext   | `Zahnarzt Kirchlindach`   | Titel, Navigation, Footer, README |

⚠️ `<ProjectName>` **muss** eine gültige Ruby-Konstante sein (PascalCase, keine
Bindestriche). `<project_name>` darf nicht `template0`/`template1` heißen
(Postgres-reserviert) — sonst ist jeder Name ok.

---

## 1. Verzeichnis umbenennen

```bash
mv ~/development/template ~/development/<project_name>
cd ~/development/<project_name>
```

---

## 2. Identifier in Config/Infra ersetzen

Diese Dateien enthalten den Namen als **Identifier** (NICHT den sichtbaren Text):

- `config/application.rb`             → `module Template`
- `config/database.yml`              → DB-Namen `template_*`, `DB_USERNAME`-Default
- `config/cable.yml`                 → `channel_prefix: template_production`
- `config/environments/production.rb`→ Kommentar `queue_name_prefix = "template_production"`
- `config/deploy.yml`                → `service`, `image`, `volumes`, `DB_HOST/DB_USERNAME/DB_NAME`, DB-User, Key-Pfad
- `config/deploy.staging.yml`        → dito (Staging)
- `docs/deploy-ssh-key-setup.md`     → SSH-Key-Pfad `template_deploy`
- `docker-compose.yml`               → `DATABASE_URL ...template_development`
- `.devcontainer/compose.yaml`       → `name: template`, `DATABASE_URL`
- `.devcontainer/devcontainer.json`  → `"name"`, Port-`label`
- `.devcontainer/Dockerfile`         → Kommentar

Ein-Schritt-Ersetzung (Reihenfolge der Casings beachten!):

```bash
FILES="config/application.rb config/database.yml config/cable.yml \
config/environments/production.rb config/deploy.yml config/deploy.staging.yml \
docs/deploy-ssh-key-setup.md docs/staging-setup.md docker-compose.yml \
.devcontainer/compose.yaml .devcontainer/devcontainer.json .devcontainer/Dockerfile"
for f in $FILES; do
  sed -i \
    -e 's/TEMPLATE/<PROJECT_NAME>/g' \
    -e 's/Template/<ProjectName>/g' \
    -e 's/template/<project_name>/g' \
    "$f"
done
# Kontrolle – darf nichts mehr ausgeben (außer evtl. echte Domains):
grep -rinE "template" config docs docker-compose.yml .devcontainer
```

---

## 3. Sichtbaren Inhalt + Branding aufbauen

Die Vorlage ist **bewusst blank** (kein Header/Footer/Design). Pro Projekt frisch
aufbauen — nichts von der Vorlage „ähnlich behalten“:

- `app/views/layouts/application.html.erb` — `<title>` + `<meta description>` setzen;
  Header/Navigation und Footer an den `TBD:`-Markierungen neu aufbauen
- `app/views/pages/home.html.erb` — Startseite neu schreiben
- `config/routes.rb` + `app/controllers/pages_controller.rb` — weitere Seiten nach Bedarf
- `app/assets/tailwind/application.css` — Schriften (`--font-*`) + Markenfarben
  (`--color-brand*`) im `@theme`-Block auf die Marke des Projekts setzen
- `README.md` — Projektname/Beschreibung

---

## 4. Ports (nur falls parallel zu anderen Projekten)

Default ist `3000:3000` (Web) und `5432:5432` (DB) in `docker-compose.yml` und
`.devcontainer/compose.yaml`. Läuft schon etwas auf diesen Host-Ports,
eindeutige Host-Ports vergeben, z. B.:

```bash
sed -i -e 's/"3000:3000"/"3001:3000"/' -e 's/"5432:5432"/"5433:5432"/' \
  docker-compose.yml .devcontainer/compose.yaml
```

Vor der Vergabe belegte Ports prüfen: `docker ps --format '{{.Ports}}'`.

---

## 5. Rails-Credentials neu erzeugen

Die Vorlage enthält **bewusst keine** `config/master.key` / `credentials.yml.enc`,
damit keine fremden Secrets übernommen werden. Im laufenden Container neu erzeugen:

```bash
docker compose up -d
docker compose exec web bin/rails credentials:edit   # erzeugt master.key + credentials.yml.enc
```

`config/master.key` ist via `.gitignore` ausgeschlossen — **niemals committen**.
Den Inhalt von `config/master.key` später als GitHub Secret `RAILS_MASTER_KEY`
hinterlegen (Schritt 7).

---

## 6. Build prüfen (lokal verifizieren)

```bash
docker compose up -d --build
docker compose exec -T web bin/rails tailwindcss:build   # Build-Artefakt erzeugen
# Erwartung: beide 200
for p in / /up; do
  printf "%-6s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"
done
docker compose down
```

`app/assets/builds/tailwind.css` ist gitignored; im Dev-Container baut `bin/dev`
es automatisch (Procfile.dev → `tailwindcss:watch`).

---

## 7. Deployment scharf schalten (Domain + GitHub Secrets)

Server, Kamal-Configs und die GitHub-Action sind bereits vorhanden. Pro Projekt:

1. **Domains eintragen** (das einzige „echte“ TBD):
   - `config/deploy.yml` → `proxy.host: TBD_DOMAIN` → Production-Domain
   - `config/deploy.staging.yml` → `proxy.host: TBD_STAGING_DOMAIN` → z. B. `test.<domain>`
   - DNS-A-Records beider Domains auf `179.237.87.63` zeigen lassen
2. **SSH-Deploy-Key** erzeugen + auf Server hinterlegen → `docs/deploy-ssh-key-setup.md`
3. **GitHub Secrets** anlegen (Repo → Settings → Secrets and variables → Actions):

   | Secret | Inhalt |
   |---|---|
   | `DEPLOY_SSH_KEY` | privater SSH-Key (siehe Doku) |
   | `KAMAL_REGISTRY_PASSWORD` | ghcr.io-Token (Scope `write:packages`) |
   | `RAILS_MASTER_KEY` | Inhalt von `config/master.key` |
   | `POSTGRES_PASSWORD` | frei gewähltes Production-DB-Passwort |
   | `POSTGRES_PASSWORD_STAGING` | frei gewähltes Staging-DB-Passwort |

4. **Erstes Deployment** einmal manuell anstoßen → `docs/staging-setup.md`.
   Danach deployt jeder Push auf `main`/`staging` automatisch (`docs/git-workflow.md`).

> E-Mail-Versand (z. B. Kontaktformular)? Optionalen SMTP-Block in
> `config/environments/production.rb` aktivieren und `SMTP_USERNAME`/`SMTP_PASSWORD`
> als Secrets sowie in `deploy.yml` (`env.secret`) ergänzen.

---

## 8. Git & GitHub

```bash
rm -rf .git
git init -q && git add -A
git -c user.name="Noah Baumgartner" -c user.email="nb1track@gmail.com" \
  commit -q -m "Initial commit: <ProjectName> aus template-Vorlage"
git branch -M main
```

Repo anlegen (Token liegt in `~/.git-credentials`; `gh` ist NICHT installiert →
GitHub-REST-API via curl). `private` nach Wunsch setzen:

```bash
TOKEN=$(sed -E 's#https://[^:]+:([^@]+)@.*#\1#' ~/.git-credentials)
curl -s -X POST -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"<project_name>","private":false}'
git config credential.helper store
git remote add origin https://github.com/NoahBaumgartner2/<project_name>.git
git push -u origin main
```

**Branch-Struktur** wie in den anderen Projekten (`main`, `staging`, `workingbranch`):

```bash
git branch staging main
git branch workingbranch main
git push -u origin staging workingbranch
git checkout workingbranch     # aktiver Arbeits-Branch
```

---

## 9. Abschluss-Checkliste

- [ ] Verzeichnis umbenannt (`<project_name>`)
- [ ] `grep -rinE "template" .` (ohne `.git/`) liefert nichts mehr (außer echten Domains)
- [ ] Modulname `<ProjectName>` in `config/application.rb`
- [ ] DB-Namen in `config/database.yml` + `config/deploy*.yml` angepasst
- [ ] Sichtbarer Inhalt + Tailwind-Markenfarben frisch aufgebaut
- [ ] Ports eindeutig (falls nötig)
- [ ] Credentials neu erzeugt (`master.key` nicht committet)
- [ ] Build verifiziert (`/` und `/up` → 200)
- [ ] Domains in `deploy.yml` / `deploy.staging.yml` eingetragen (`TBD_*` ersetzt)
- [ ] GitHub Secrets gesetzt (5 Stück)
- [ ] GitHub-Repo + Branches `main`/`staging`/`workingbranch` gepusht
- [ ] **Diese Datei (`CLAUDE_SETUP.md`) gelöscht** und README finalisiert
