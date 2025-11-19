# Git Workflow Guide - Moodlyst

> **Mission**: Never lose work again! Commit early, commit often, push regularly.

## 🎯 The Golden Rules

### Rule #1: Commit Every 30-60 Minutes
Set a timer! Even if the feature isn't done, commit your progress.

### Rule #2: Push After Every Commit (or at least every hour)
GitHub is your backup. Think of it as hitting Ctrl+S.

### Rule #3: Working Code = Immediate Commit
If something works, commit it NOW before breaking it.

### Rule #4: End of Day = Always Commit & Push
Never leave uncommitted work overnight.

## 🔄 Daily Workflow

### 🌅 Starting Your Work Session

```bash
# 1. Make sure you're on the right branch
git branch --show-current

# 2. Pull latest changes
git pull origin working-with-events

# 3. Check status (should be clean)
git status

# 4. Start dev server
npm run dev
```

### 💻 During Development (Every 30-60 minutes)

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with a descriptive message
git commit -m "Add: Event filtering by category"

# 4. Push to remote (IMPORTANT!)
git push origin working-with-events
```

#### Good Commit Message Examples:
- ✅ `"Add: EventsWidget component with Ticketmaster API"`
- ✅ `"Fix: MoodTimeline not showing last 7 days correctly"`
- ✅ `"Update: Dashboard layout with responsive grid"`
- ✅ `"Refactor: Extract event card into separate component"`
- ✅ `"WIP: Event filtering (not working yet)"`

#### Bad Commit Messages:
- ❌ `"update"`
- ❌ `"fix stuff"`
- ❌ `"changes"`
- ❌ `"asdfjkl"`

### 🌙 Ending Your Work Session

```bash
# 1. Save everything
git add .

# 2. Commit with end-of-day summary
git commit -m "End of session: Completed EventsWidget integration and fixed mood timeline bugs"

# 3. Push to remote
git push origin working-with-events

# 4. Verify on GitHub (open browser, check your repo)
# URL: https://github.com/prabesh2004/Moodlyst
```

## 🚀 Feature Development Workflow

### Creating a New Feature

```bash
# 1. Start from a clean working-with-events branch
git checkout working-with-events
git pull origin working-with-events

# 2. Create feature branch
git checkout -b feature/event-filtering

# 3. Work on feature (commit every 30-60 min)
git add .
git commit -m "Add: Event category filter UI"
git push origin feature/event-filtering

# 4. Continue working and committing
# ... repeat commits ...

# 5. When feature is complete
git checkout working-with-events
git merge feature/event-filtering

# 6. Push merged changes
git push origin working-with-events

# 7. Delete feature branch (optional)
git branch -d feature/event-filtering
git push origin --delete feature/event-filtering
```

## 🔧 Commit Strategies

### Small Feature Commits (30-60 min)
```bash
# Example timeline:
10:00 AM - Start feature
10:30 AM - git commit -m "WIP: Add event filter dropdown"
11:00 AM - git commit -m "Complete: Event filter dropdown with categories"
11:30 AM - git commit -m "Add: Filter logic to EventsWidget"
12:00 PM - git commit -m "Test: Verify filtering works for all categories"
```

### Working Feature Checkpoint
```bash
# When something works, commit immediately!
git add .
git commit -m "✨ Working: Events now filter by mood score"
git push
```

### Before Trying Something Risky
```bash
# Create a backup commit before major changes
git add .
git commit -m "Checkpoint: Before refactoring EventsWidget"
git push

# Now you can experiment safely!
# If it breaks, you can:
git reset --hard HEAD~1  # Go back to checkpoint
```

## 🆘 Recovery Commands

### Oops, I Forgot to Commit Yesterday!
```bash
# Check reflog (git's time machine)
git reflog

# Find your lost work
git log --all --oneline --graph -20

# If found, checkout that commit
git checkout <commit-hash>

# Create a branch to save it
git checkout -b recovered-work

# Merge back when ready
git checkout working-with-events
git merge recovered-work
```

### I Broke Everything, Go Back!
```bash
# See recent commits
git log --oneline -5

# Go back to a working commit (keeps your changes)
git reset --soft <commit-hash>

# Or go back completely (DELETES your changes)
git reset --hard <commit-hash>

# If pushed already, force push (be careful!)
git push origin working-with-events --force
```

### File Got Corrupted (�� characters)
```bash
# Don't try to fix it, restore from git!
Remove-Item path/to/corrupted/file.js -Force

# Restore clean version from a commit
git checkout <commit-hash> -- path/to/file.js

# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite

# Restart dev server
npm run dev
```

### Check What I Did Today
```bash
# See today's commits
git log --since="6am" --oneline

# See detailed changes
git log --since="6am" --stat

# See actual code changes
git log -p --since="6am"
```

## ⏰ Commit Timer Setup

### Option 1: Windows Task Scheduler
Create a reminder that pops up every 30 minutes during work hours.

### Option 2: Physical Timer
Set a 30-minute timer on your phone. When it rings, commit!

### Option 3: VS Code Extension
Install: "Git Commit Timer" or "Commit Reminder"

## 📋 Pre-Commit Checklist

Before committing, quickly verify:

- [ ] Did I test that this code works?
- [ ] Are there any console errors?
- [ ] Did I remove console.log() statements?
- [ ] Is the commit message descriptive?
- [ ] Am I on the correct branch?

## 🎪 Branch Management

### Current Branch Structure:
- `main` → Stable, production-ready
- `working-with-events` → Your main development branch
- `feature/*` → Individual features

### Branch Naming:
- `feature/event-filtering` - New features
- `fix/dashboard-crash` - Bug fixes
- `refactor/services` - Code improvements
- `test/mood-tracking` - Testing changes

## 🔍 Useful Git Commands

```bash
# What branch am I on?
git branch --show-current

# What changed?
git status
git diff

# Show recent commits
git log --oneline --graph -10

# Show all branches (including remote)
git branch -a

# See what's on remote
git fetch
git log origin/working-with-events --oneline -5

# Create a tag (version marker)
git tag v1.0.0
git push origin v1.0.0

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See file history
git log --follow -- path/to/file.js

# Who changed this line?
git blame path/to/file.js
```

## 🎓 Lessons Learned

### November 7-8, 2025 Incident:
**What happened**: Lost entire day's work (EventsWidget improvements, MoodTimeline enhancements) because work wasn't committed.

**Root causes**:
1. No regular commit habit
2. Didn't push to remote
3. Assumed git would have the changes somehow

**Prevention**:
- ✅ Commit every 30-60 minutes
- ✅ Push after every commit
- ✅ Verify on GitHub before ending session
- ✅ Use `git status` frequently

**Key takeaway**: "If it's not committed and pushed to GitHub, it doesn't exist."

---

## 📝 Quick Reference Card

**Print this and keep it on your desk!**

```
╔═══════════════════════════════════════════╗
║       COMMIT EVERY 30-60 MINUTES          ║
╠═══════════════════════════════════════════╣
║ 1. git add .                              ║
║ 2. git commit -m "Descriptive message"    ║
║ 3. git push                               ║
║ 4. Verify on GitHub                       ║
╠═══════════════════════════════════════════╣
║ BEFORE ENDING SESSION:                    ║
║ - Commit all changes                      ║
║ - Push to remote                          ║
║ - Check GitHub web interface              ║
╠═══════════════════════════════════════════╣
║ IF SOMETHING BREAKS:                      ║
║ - git status (what changed?)              ║
║ - git log (recent commits?)               ║
║ - git reset --hard HEAD~1 (go back)       ║
╚═══════════════════════════════════════════╝
```

---

**Remember**: GitHub is not just for sharing code. It's your backup, your time machine, and your safety net. Use it!

**Last Updated**: November 8, 2025
