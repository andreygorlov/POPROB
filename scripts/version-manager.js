#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
  constructor() {
    this.versionFile = 'VERSION.json';
    this.backupDir = 'backups';
    this.exportDir = 'exports';
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.backupDir, this.exportDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getCurrentVersion() {
    if (fs.existsSync(this.versionFile)) {
      return JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
    }
    return { version: '1.0.0', build: 1, timestamp: new Date().toISOString() };
  }

  saveVersion(version) {
    fs.writeFileSync(this.versionFile, JSON.stringify(version, null, 2));
  }

  incrementVersion(type = 'patch') {
    const current = this.getCurrentVersion();
    const [major, minor, patch] = current.version.split('.').map(Number);
    
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    return {
      version: newVersion,
      build: current.build + 1,
      timestamp: new Date().toISOString(),
      previous: current.version
    };
  }

  createCheckpoint(description) {
    try {
      const newVersion = this.incrementVersion();
      newVersion.description = description;
      
      // Git operations
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "Checkpoint v${newVersion.version}: ${description}"`, { stdio: 'inherit' });
      
      // Create tag
      execSync(`git tag -a v${newVersion.version} -m "Version ${newVersion.version}: ${description}"`, { stdio: 'inherit' });
      
      // Save version info
      this.saveVersion(newVersion);
      
      // Create backup
      this.createBackup(`checkpoint-${newVersion.version}`);
      
      console.log(`✅ נקודת שחזור נוצרה: v${newVersion.version}`);
      return newVersion;
    } catch (error) {
      console.error('❌ שגיאה ביצירת נקודת שחזור:', error.message);
      throw error;
    }
  }

  createBackup(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${name}-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.bundle`);
      
      execSync(`git bundle create "${backupPath}" --all`, { stdio: 'inherit' });
      
      // Create metadata
      const metadata = {
        name: backupName,
        timestamp: new Date().toISOString(),
        version: this.getCurrentVersion(),
        gitHash: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      };
      
      fs.writeFileSync(
        path.join(this.backupDir, `${backupName}.json`),
        JSON.stringify(metadata, null, 2)
      );
      
      console.log(`✅ גיבוי נוצר: ${backupName}`);
      return backupName;
    } catch (error) {
      console.error('❌ שגיאה ביצירת גיבוי:', error.message);
      throw error;
    }
  }

  listCheckpoints() {
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      console.log('📋 נקודות שחזור זמינות:');
      console.log('========================================');
      
      tags.forEach(tag => {
        const commit = execSync(`git rev-parse ${tag}`, { encoding: 'utf8' }).trim();
        const date = execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf8' }).trim();
        const message = execSync(`git log -1 --format=%s ${tag}`, { encoding: 'utf8' }).trim();
        
        console.log(`${tag} - ${date} - ${message}`);
      });
      
      return tags;
    } catch (error) {
      console.error('❌ שגיאה בהצגת נקודות שחזור:', error.message);
      return [];
    }
  }

  restoreCheckpoint(version) {
    try {
      console.log(`🔄 משחזר לגרסה ${version}...`);
      
      // Check if version exists
      execSync(`git tag -l ${version}`, { stdio: 'pipe' });
      
      // Create backup before restore
      this.createBackup(`pre-restore-${version}`);
      
      // Restore to version
      execSync(`git checkout ${version}`, { stdio: 'inherit' });
      
      console.log(`✅ שחזור הושלם לגרסה ${version}`);
    } catch (error) {
      console.error('❌ שגיאה בשחזור:', error.message);
      throw error;
    }
  }

  compareVersions(version1, version2) {
    try {
      console.log(`🔍 משווה בין ${version1} ל-${version2}...`);
      execSync(`git diff ${version1} ${version2}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ שגיאה בהשוואת גרסאות:', error.message);
      throw error;
    }
  }

  exportVersion(version, format = 'zip') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportName = `export-${version}-${timestamp}`;
      const exportPath = path.join(this.exportDir, `${exportName}.${format}`);
      
      if (format === 'zip') {
        execSync(`git archive --format=zip --output="${exportPath}" ${version}`, { stdio: 'inherit' });
      } else if (format === 'tar') {
        execSync(`git archive --format=tar --output="${exportPath}" ${version}`, { stdio: 'inherit' });
      }
      
      console.log(`✅ יצוא הושלם: ${exportName}.${format}`);
      return exportName;
    } catch (error) {
      console.error('❌ שגיאה ביצוא:', error.message);
      throw error;
    }
  }

  cleanupOldVersions(days = 30) {
    try {
      console.log(`🧹 מנקה גרסאות ישנות מ-${days} ימים...`);
      
      // Clean up old tags
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const tags = execSync('git tag -l', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      tags.forEach(tag => {
        const tagDate = new Date(execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf8' }).trim());
        if (tagDate < cutoffDate) {
          execSync(`git tag -d ${tag}`, { stdio: 'inherit' });
          console.log(`🗑️ נמחק תג: ${tag}`);
        }
      });
      
      // Clean up old backups
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.bundle'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .filter(backup => backup.stats.mtime < cutoffDate);
      
      backupFiles.forEach(backup => {
        fs.unlinkSync(backup.path);
        const metadataFile = backup.path.replace('.bundle', '.json');
        if (fs.existsSync(metadataFile)) {
          fs.unlinkSync(metadataFile);
        }
        console.log(`🗑️ נמחק גיבוי: ${backup.name}`);
      });
      
      console.log(`✅ ניקוי הושלם`);
    } catch (error) {
      console.error('❌ שגיאה בניקוי:', error.message);
      throw error;
    }
  }

  getStatus() {
    try {
      const current = this.getCurrentVersion();
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const hasChanges = gitStatus.trim().length > 0;
      
      console.log('📊 סטטוס המערכת:');
      console.log('========================================');
      console.log(`גרסה נוכחית: ${current.version}`);
      console.log(`בנייה: ${current.build}`);
      console.log(`תאריך: ${current.timestamp}`);
      console.log(`שינויים לא שמורים: ${hasChanges ? 'כן' : 'לא'}`);
      
      if (hasChanges) {
        console.log('\n📝 קבצים שהשתנו:');
        console.log(gitStatus);
      }
      
      return { current, hasChanges };
    } catch (error) {
      console.error('❌ שגיאה בבדיקת סטטוס:', error.message);
      throw error;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new VersionManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'checkpoint':
      const description = args[0] || 'נקודת שחזור';
      manager.createCheckpoint(description);
      break;
      
    case 'list':
      manager.listCheckpoints();
      break;
      
    case 'restore':
      const version = args[0];
      if (!version) {
        console.error('❌ נדרש לציין גרסה לשחזור');
        process.exit(1);
      }
      manager.restoreCheckpoint(version);
      break;
      
    case 'compare':
      const [v1, v2] = args;
      if (!v1 || !v2) {
        console.error('❌ נדרש לציין שתי גרסאות להשוואה');
        process.exit(1);
      }
      manager.compareVersions(v1, v2);
      break;
      
    case 'backup':
      const backupName = args[0] || 'manual-backup';
      manager.createBackup(backupName);
      break;
      
    case 'export':
      const exportVersion = args[0] || 'HEAD';
      const format = args[1] || 'zip';
      manager.exportVersion(exportVersion, format);
      break;
      
    case 'cleanup':
      const days = parseInt(args[0]) || 30;
      manager.cleanupOldVersions(days);
      break;
      
    case 'status':
      manager.getStatus();
      break;
      
    default:
      console.log(`
🔄 מערכת ניהול גרסאות ERP

שימוש:
  node scripts/version-manager.js <command> [args]

פקודות:
  checkpoint [description]  - יצירת נקודת שחזור
  list                     - הצגת נקודות שחזור
  restore <version>        - שחזור לגרסה
  compare <v1> <v2>         - השוואת גרסאות
  backup [name]            - יצירת גיבוי
  export [version] [format] - יצוא גרסה
  cleanup [days]           - ניקוי גרסאות ישנות
  status                   - הצגת סטטוס

דוגמאות:
  node scripts/version-manager.js checkpoint "תיקון באג חשוב"
  node scripts/version-manager.js restore v1.2.3
  node scripts/version-manager.js compare v1.0.0 v1.1.0
  node scripts/version-manager.js export v1.2.3 zip
  node scripts/version-manager.js cleanup 30
      `);
  }
}

module.exports = VersionManager;
