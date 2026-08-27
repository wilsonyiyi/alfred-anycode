# Alfred AnyCode

Search projects in Alfred and open them with any macOS IDE.

## Features

- Configure project directories with comma-, semicolon-, or newline-separated glob patterns.
- Use multiple IDEs at the same time, each with its own Alfred keyword.
- Start with Visual Studio Code and Cursor; Zed, WebStorm, and Codex remain available as presets.
- Add and remove editor entries dynamically.
- Click any editor icon to upload, replace, or reset its image.
- Switch the settings interface between English and Chinese.
- Reveal a project in Finder with <kbd>⌘</kbd> + <kbd>Enter</kbd>.
- Cache project discovery for fast repeated searches and refresh immediately after configuration changes.
- Search project names and paths with Unicode-aware fuzzy matching.

## Requirements

- macOS
- Alfred 5.1 or later with Powerpack
- Node.js 20 or later

## Installation

When the package is published, install or update it with:

```sh
npm install --global alfred-anycode
```

For local development, clone the repository into an Alfred workflow folder, run `npm install`, and open the workflow in Alfred Preferences.

The workflow ships its own Alfred JSON/cache runtime, Node locator, and conservative npm installer. The installer reads Alfred's active preferences path and creates one package-owned symbolic link; it never replaces an existing workflow directory or a link to another target. Install it as your macOS user, without `sudo`.

## Configuration

Type `anycode` in Alfred and press <kbd>Enter</kbd>. This standalone command takes no argument and opens a local settings interface with two separate modules:

- **Project discovery** manages the shared project directory patterns.
- **Editors** presents a compact two-column card grid. New installations contain Visual Studio Code and Cursor; add or remove entries, choose another preset or a custom application, and assign every entry its own keyword.

Use the language control in the upper-right corner to switch the settings interface between English and Chinese. AnyCode remembers the choice locally.

Editor keywords are separate Alfred commands and require a project query. All non-empty editor keywords work simultaneously. Click any editor card icon to upload a PNG, JPEG, WebP, GIF, or ICNS image and preview it before saving. VS Code, Cursor, Zed, WebStorm, and Codex use their real application artwork by default; custom applications fall back to the installed application icon when available.

One IDE can have more than one keyword by separating aliases with `||`:

```text
code||vsc
```

The settings service binds only to `127.0.0.1`, uses a random session token, and closes after inactivity. Saving validates duplicate or reserved keywords, persists configuration in Alfred's workflow data directory, and immediately updates the Script Filter keyword expression.

## Usage

Search with different IDEs directly:

```text
code project-name
cursor project-name
zed project-name
```

Append `:refresh` to any configured IDE keyword to rebuild the shared project cache, for example `code :refresh`.

## Architecture

- `index.js`: Alfred Script Filter composition root.
- `src/config`: Versioned editor configuration, migration, persistence, and Alfred keyword synchronization.
- `src/config-ui`: Local settings server and responsive grouped interface.
- `src/projects`: Project discovery and cache policy.
- `src/search`: Project ranking and Unicode-aware matching.
- `src/ides`: Keyword-to-IDE registry and per-IDE icon resolution.
- `src/actions`: Safe macOS project opening and Finder reveal actions.
- `src/alfred`: Alfred JSON item presentation.
- `src/install`: Dependency-free, non-destructive npm workflow linking.

Run the full verification suite with:

```sh
npm run check
```

## License and attribution

Alfred AnyCode is licensed under GPL-3.0-or-later. It is based on [vivaxy/alfred-open-in-vscode](https://github.com/vivaxy/alfred-open-in-vscode) and retains the original project's license.
