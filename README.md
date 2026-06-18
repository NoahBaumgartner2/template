# Template — Rails + Tailwind + PostgreSQL + Docker

Wiederverwendbare Projektvorlage. Enthält die komplette Infrastruktur eines
Rails-Projekts mit TailwindCSS, PostgreSQL und Docker / Dev-Container (inkl.
eigenem User, Git, GitHub CLI und Claude Code im Container).

> **Neues Projekt starten?** Lies zuerst **[`CLAUDE_SETUP.md`](CLAUDE_SETUP.md)** —
> dort steht Schritt für Schritt, was umbenannt/angepasst werden muss, um aus
> dieser Vorlage ein offizielles, benanntes Projekt zu machen.

## Tech-Stack

- Ruby 3.4.4 / Rails 7.1
- PostgreSQL 15
- TailwindCSS (tailwindcss-rails, v4 `@theme`)
- Hotwire (Turbo + Stimulus), Importmaps

## Entwicklung

### Variante A – Dev-Container (VS Code)

`.devcontainer/` öffnen → Container erstellt User `vscode`, installiert Ruby,
GitHub CLI, Postgres-Client und Claude Code. Danach im Container:

```bash
bin/dev        # Rails-Server + Tailwind-Watch
```

### Variante B – docker-compose

```bash
docker compose up --build
bin/rails tailwindcss:build   # einmalig, falls app/assets/builds/tailwind.css fehlt
# App: http://localhost:3000
```

## Ports (Default)

| Dienst   | Container | Host |
|----------|-----------|------|
| Rails    | 3000      | 3000 |
| Postgres | 5432      | 5432 |

> Laufen mehrere Projekte parallel, eindeutige Host-Ports vergeben
> (siehe `CLAUDE_SETUP.md`).

## Seiten

`/` Start · `/leistungen` · `/team` · `/kontakt` — alles Platzhalter.
