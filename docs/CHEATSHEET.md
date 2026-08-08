# Metro Start

## Start the dev server
```powershell
cd C:\[your mobile folder]
npm start
or
npx expo start
```

Include:
--dev-client (for new dev builds to clear old ones)
--clear (helps to clear old caches)

On phone: 
## Metro keyboard shortcuts (press these in the Metro terminal)
| Key | Action |
|-----|--------|
| `a` | Open Android (builds + launches the app on connected device) |
| `r` | Reload the app |
| `m` | Toggle dev menu on device |
| `j` | Open debugger in browser |
| `?` | Show all commands |

## If Metro is already running but phone isn't connected
- Press `a` in the Metro terminal
- Or run in a separate terminal:
```powershell
cd C:\[your mobile folder]
npx expo run:android
```
On phone: exp://192.168.1.153:8081

## Restart fresh
```powershell
# Kill Metro (Ctrl+C in its terminal), then:
cd C:\[your mobile folder]
npm run dev:mobile
# Wait for QR code, then press a
```

# Builds

## Build a new dev APK (if code changes need a rebuild)
```powershell
cd C:\Code\emmaline\mobile
npx eas build --profile development --platform android
```


## Production builds

android:
npx eas build --platform android --profile production

apple:
```powershell
cd C:\Code\emmaline\mobile
npx eas build --platform ios --profile production
```

Testflight:
npx eas submit --platform ios  


# Docker Builds

Ex.
cd "C:\Code\freesurf workspace\freesurf-reader\serverless"
docker build -t plantingmoon/freesurf-reader-kokoro:v2 .
docker push plantingmoon/freesurf-reader-kokoro:v2

# Git commands

## Daily workflow
git status                          # What changed?
git add <file>                      # Stage a file
git add .                           # Stage everything
git commit -m "message"             # Commit staged changes
git push                            # Push to remote
git pull                            # Get latest from remote
## Selective staging (your question)
git add support.html                # Stage just one file
git add screens/*.tsx               # Stage all tsx in screens/
git add -p                          # Stage changes interactively (hunk by hunk)
git reset support.html              # Unstage a file
git restore support.html            # Discard local changes to a file
## Avoiding files
Add manually to .gitignore (one per line):
.env
node_modules/
*.log
## Branches
git checkout -b feature-name        # Create + switch to new branch
git branch                          # List branches
## Undo
git commit --amend -m "new msg"     # Fix last commit message
git reset --soft HEAD~1             # Undo last commit (keep changes staged)


# Shortcut keys

{
    "key": "ctrl+1",
    "command": "workbench.action.focusFirstEditorGroup",
    "when": "terminalFocus"
  },

  {
    "key": "ctrl+2",
    "command": "workbench.action.terminal.focus",
    "when": "editorTextFocus"
  },

{
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.focusTabs",
    "when": "terminalFocus || terminalProcessSupported"
  }

    {
    "key": "ctrl+alt+down",
    "command": "workbench.action.terminal.focusNext",
    "when": "terminalFocus"
  },
  {
    "key": "ctrl+alt+up",
    "command": "workbench.action.terminal.focusPrevious",
    "when": "terminalFocus"
  },
  {
    "key": "ctrl+alt+n",
    "command": "workbench.action.terminal.new",
    "when": "terminalFocus"
  }


]