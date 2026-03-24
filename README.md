# cmux for Raycast

Raycast extension for [cmux](https://cmuxterm.app) — browse workspaces and open directories directly from Raycast.

## Requirements

- [cmux](https://cmuxterm.app) installed at `/Applications/cmux.app`
- cmux **Socket Control** set to **Automation mode** (Settings → Socket Control)

## Commands

### List cmux Workspaces

Browse and switch between your cmux workspaces.

- **Enter** — switch to workspace (launches cmux if not running)
- **⌘O** — open workspace directory as a new workspace
- **⌘C** — copy directory path to clipboard
- **⌘⌫** — close workspace

The list stays cached when cmux is off and refreshes automatically every 2 seconds when cmux is running.

### Open in cmux

Opens the currently selected folder (or file's parent folder) in Finder as a new cmux workspace.

Invoke via Raycast with a Finder window open. Works whether cmux is running or not.

## Setup

1. Open cmux → Settings → Socket Control → set to **Automation mode**
2. Install this extension and assign hotkeys as needed

## Preferences

| Preference | Default | Description |
|---|---|---|
| cmux CLI Path | `/opt/homebrew/bin/cmux` | Path to the cmux CLI binary |
