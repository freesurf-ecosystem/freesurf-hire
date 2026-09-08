# Metro Start

## Free 
USB: Metro logs + hot reload
npx expo run:android

npx expo start -c [for clearing bundles]

## Start the dev server
```powershell
cd C:\[your mobile folder]

npx expo start --dev-client --clear 

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



# Expo Builds

## Free Builds
## Android development
Android dev + release	

npx expo run:android / eas build --local on your Windows machine (needs Android Studio/SDK)

Or drive route from github to download to phone  — no cable needed

## Android production
Production (Android) via gradlew assembleRelease locally, or GitHub Actions
## iOS Dev / productions
iOS dev + TestFlight with GitHub Actions (public repo = free macOS runners)


## Build a new dev APK (if code changes need a rebuild)
```powershell
cd [mobile folder]
npx eas build --profile development --platform android
```


## Production builds

android:
npx eas build --platform android --profile production

apple:
```powershell
cd [mobile folder]
npx eas build --platform ios --profile production
```

# To submit to TestFlight

eas submit --platform ios


# AI Pod Rebuild & Redeploy

## 1. Rebuild + run the volume (model downloader)

```powershell
cd "C:\Code\freesurf workspace\freesurf-hire\infra\ai\volume"
docker build -t plantingmoon/freesurf-ai-volume:v5 .
docker push plantingmoon/freesurf-ai-volume:v5
```

## 2. Rebuild the pod (runtime)

```powershell
cd "C:\Code\freesurf workspace\freesurf-hire\infra\ai\pod"
docker build -t plantingmoon/freesurf-ai-pod:v10 .
docker push plantingmoon/freesurf-ai-pod:v10
```

## Clearing the vhdx

### Kill all Docker processes
Get-Process | Where-Object {$_.Name -like "*docker*"} | Stop-Process -Force
Start-Sleep -Seconds 5

### Delete the vhdx
Remove-Item "C:\Users\$env:USERNAME\AppData\Local\Docker\wsl\disk\docker_data.vhdx" -Force

### Restart Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"



# Cloudflare wrangler

cd "C:\Code\freesurf workspace\freesurf-calorie-tracker\worker"
npx wrangler secret put POD_URL
https://9ney4znzh3zvbq-8000.proxy.runpod.net

cd "C:\Code\freesurf workspace\freesurf-reader\worker"
npx wrangler secret put POD_URL

cd "C:\Code\freesurf workspace\freesurf-transcriber\worker"
npx wrangler secret put POD_URL

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


