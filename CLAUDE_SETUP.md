# CLAUDE_SETUP.md — Vorlage in ein echtes Projekt verwandeln

> **An Claude Code:** Diese Datei ist die Arbeitsanweisung, wenn aus dieser
> Vorlage (`template`) ein konkretes, benanntes Projekt erstellt werden soll.
> Arbeite die Schritte **in dieser Reihenfolge** ab und hake die Checkliste am
> Ende ab. Lösche diese Datei (und passe die README an), wenn alles erledigt ist.

---

## 0. Den Projektnamen festlegen

Frag (oder leite ab) **einen** Projektnamen und bilde daraus die **vier
Schreibweisen**. Beispiel anhand `zahnarzt_kirchlindach`:

| Platzhalter            | Schreibweise        | Beispiel                  | Verwendung |
|------------------------|---------------------|---------------------------|------------|
| `<project_name>`       | snake_case          | `zahnarzt_kirchlindach`   | Verzeichnis, DB-Namen, devcontainer-Name, DATABASE_URL, channel_prefix |
| `<ProjectName>`        | PascalCase          | `ZahnarztKirchlindach`    | Ruby-Modul in `config/application.rb` |
| `<PROJECT_NAME>`       | SCREAMING_SNAKE     | `ZAHNARZT_KIRCHLINDACH`   | ENV-Variable für DB-Passwort (Production) |
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

- `config/application.rb`            → `module Template`
- `config/database.yml`             → DB-Namen `template_*`, `username`, `ENV["TEMPLATE_DATABASE_PASSWORD"]`
- `config/cable.yml`                → `channel_prefix: template_production`
- `config/environments/production.rb`→ Kommentar `queue_name_prefix = "template_production"`
- `docker-compose.yml`              → `DATABASE_URL ...template_development`
- `.devcontainer/compose.yaml`      → `name: template`, `DATABASE_URL`
- `.devcontainer/devcontainer.json` → `"name"`, Port-`label`
- `.devcontainer/Dockerfile`        → Kommentar

Ein-Schritt-Ersetzung (Reihenfolge der Casings beachten!):

```bash
FILES="config/application.rb config/database.yml config/cable.yml \
config/environments/production.rb docker-compose.yml \
.devcontainer/compose.yaml .devcontainer/devcontainer.json .devcontainer/Dockerfile"
for f in $FILES; do
  sed -i \
    -e 's/TEMPLATE/<PROJECT_NAME>/g' \
    -e 's/Template/<ProjectName>/g' \
    -e 's/template/<project_name>/g' \
    "$f"
done
# Kontrolle – darf nichts mehr ausgeben:
grep -rinE "template" config docker-compose.yml .devcontainer
```

---

## 3. Sichtbaren Inhalt + Branding anpassen

Diese Dateien enthalten **Platzhalter-Text/Branding** und sind pro Projekt
inhaltlich neu zu schreiben (nicht nur sed):

- `app/views/layouts/application.html.erb` — `<title>`, `<meta description>`,
  Navi-Logo-Text, Footer, Kontakt-E-Mail (`info@example.com`)
- `README.md` — Projektname/Beschreibung
- `app/assets/tailwind/application.css` — `@theme`-Farben (`--color-brand*`)
  auf die Markenfarben des Projekts setzen

Routen/Seiten nach Bedarf ändern: `config/routes.rb` + `app/controllers/pages_controller.rb`
(Standard: `home`, `leistungen`, `team`, `kontakt` + `contact_submit`).

---

## 4. Ports (nur falls parallel zu anderen Projekten)

Default ist `3000:3000` (Web) und `5432:5432` (DB) in `docker-compose.yml` und
`.devcontainer/compose.yaml`. Läuft schon etwas auf diesen Host-Ports,
eindeutige Host-Ports vergeben, z. B.:

```bash
sed -i -e 's/"3000:3000"/"3001:3000"/' -e 's/"5432:5432"/"5433:5432"/' \
  docker-compose.yml .devcontainer/compose.yaml
```

Bereits vergeben in dieser Umgebung: garage_hofwil 3002/5433 · zahnarzt_kirchlindach 3003/5434.

---

## 5. Rails-Credentials neu erzeugen

Die Vorlage enthält **bewusst keine** `config/master.key` / `credentials.yml.enc`,
damit keine fremden Secrets übernommen werden. Im laufenden Container neu erzeugen:

```bash
docker compose up -d
docker compose exec web bin/rails credentials:edit   # erzeugt master.key + credentials.yml.enc
```

`config/master.key` ist via `.gitignore` ausgeschlossen — **niemals committen**.

---

## 6. Build prüfen (lokal verifizieren)

```bash
docker compose up -d --build
docker compose exec -T web bin/rails tailwindcss:build   # Build-Artefakt erzeugen
# Erwartung: alle 200
for p in / /leistungen /team /kontakt /up; do
  printf "%-12s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"
done
docker compose down
```

`app/assets/builds/tailwind.css` ist gitignored; im Dev-Container baut `bin/dev`
es automatisch (Procfile.dev → `tailwindcss:watch`).

---

## 7. Git & GitHub

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

## 8. Abschluss-Checkliste

- [ ] Verzeichnis umbenannt (`<project_name>`)
- [ ] `grep -rinE "template" .` (ohne `.git/`) liefert nichts mehr
- [ ] Modulname `<ProjectName>` in `config/application.rb`
- [ ] DB-Namen + ENV-Var in `config/database.yml` angepasst
- [ ] Sichtbarer Inhalt + Tailwind-Markenfarben gesetzt
- [ ] Ports eindeutig (falls nötig)
- [ ] Credentials neu erzeugt (`master.key` nicht committet)
- [ ] Build verifiziert (alle Seiten 200)
- [ ] GitHub-Repo + Branches `main`/`staging`/`workingbranch` gepusht
- [ ] **Diese Datei (`CLAUDE_SETUP.md`) gelöscht** und README finalisiert
