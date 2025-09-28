#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class VersionControlUI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
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

  async showMainMenu() {
    console.clear();
    console.log('🔄 מערכת ניהול גרסאות ERP');
    console.log('========================================');
    console.log('1. יצירת נקודת שחזור');
    console.log('2. הצגת נקודות שחזור');
    console.log('3. שחזור לגרסה קודמת');
    console.log('4. השוואת גרסאות');
    console.log('5. ניהול גיבויים');
    console.log('6. יצוא גרסה');
    console.log('7. ניקוי גרסאות ישנות');
    console.log('8. סטטיסטיקות');
    console.log('9. הגדרות');
    console.log('0. יציאה');
    console.log('========================================');
    
    const choice = await this.askQuestion('בחר פעולה (0-9): ');
    return choice;
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async createCheckpoint() {
    console.log('\n🔄 יצירת נקודת שחזור');
    console.log('========================================');
    
    const description = await this.askQuestion('הכנס תיאור נקודת השחזור: ');
    if (!description) {
      console.log('❌ תיאור נדרש');
      return;
    }
    
    try {
      console.log('🔄 יוצר נקודת שחזור...');
      
      // Check for uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('📝 שינויים לא שמורים נמצאו:');
        console.log(status);
        
        const commit = await this.askQuestion('האם לשמור שינויים? (y/n): ');
        if (commit.toLowerCase() === 'y') {
          execSync('git add .', { stdio: 'inherit' });
          execSync(`git commit -m "Auto-save: ${description}"`, { stdio: 'inherit' });
        }
      }
      
      // Create tag
      const version = this.getNextVersion();
      execSync(`git tag -a v${version} -m "Version ${version}: ${description}"`, { stdio: 'inherit' });
      
      // Create backup
      this.createBackup(`checkpoint-${version}`);
      
      console.log(`✅ נקודת שחזור נוצרה: v${version}`);
      
      // Save version info
      this.saveVersionInfo(version, description);
      
    } catch (error) {
      console.error('❌ שגיאה ביצירת נקודת שחזור:', error.message);
    }
  }

  async showCheckpoints() {
    console.log('\n📋 נקודות שחזור זמינות');
    console.log('========================================');
    
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      if (tags.length === 0) {
        console.log('אין נקודות שחזור זמינות');
        return;
      }
      
      tags.forEach((tag, index) => {
        const commit = execSync(`git rev-parse ${tag}`, { encoding: 'utf8' }).trim();
        const date = execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf8' }).trim();
        const message = execSync(`git log -1 --format=%s ${tag}`, { encoding: 'utf8' }).trim();
        
        console.log(`${index + 1}. ${tag}`);
        console.log(`   תאריך: ${new Date(date).toLocaleString('he-IL')}`);
        console.log(`   תיאור: ${message}`);
        console.log(`   Hash: ${commit.substring(0, 8)}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ שגיאה בהצגת נקודות שחזור:', error.message);
    }
  }

  async restoreCheckpoint() {
    console.log('\n🔄 שחזור לגרסה קודמת');
    console.log('========================================');
    
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      if (tags.length === 0) {
        console.log('אין נקודות שחזור זמינות');
        return;
      }
      
      console.log('נקודות שחזור זמינות:');
      tags.forEach((tag, index) => {
        const date = execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf8' }).trim();
        console.log(`${index + 1}. ${tag} - ${new Date(date).toLocaleString('he-IL')}`);
      });
      
      const choice = await this.askQuestion(`בחר גרסה לשחזור (1-${tags.length}): `);
      const index = parseInt(choice) - 1;
      
      if (index < 0 || index >= tags.length) {
        console.log('❌ בחירה לא תקינה');
        return;
      }
      
      const selectedTag = tags[index];
      const confirm = await this.askQuestion(`האם לשחזר לגרסה ${selectedTag}? (y/n): `);
      
      if (confirm.toLowerCase() === 'y') {
        console.log(`🔄 משחזר לגרסה ${selectedTag}...`);
        
        // Create backup before restore
        this.createBackup(`pre-restore-${selectedTag}`);
        
        // Restore to version
        execSync(`git checkout ${selectedTag}`, { stdio: 'inherit' });
        
        console.log(`✅ שחזור הושלם לגרסה ${selectedTag}`);
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשחזור:', error.message);
    }
  }

  async compareVersions() {
    console.log('\n🔍 השוואת גרסאות');
    console.log('========================================');
    
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      if (tags.length < 2) {
        console.log('נדרשות לפחות 2 גרסאות להשוואה');
        return;
      }
      
      console.log('גרסאות זמינות:');
      tags.forEach((tag, index) => {
        console.log(`${index + 1}. ${tag}`);
      });
      
      const choice1 = await this.askQuestion('בחר גרסה ראשונה: ');
      const choice2 = await this.askQuestion('בחר גרסה שנייה: ');
      
      const index1 = parseInt(choice1) - 1;
      const index2 = parseInt(choice2) - 1;
      
      if (index1 < 0 || index1 >= tags.length || index2 < 0 || index2 >= tags.length) {
        console.log('❌ בחירה לא תקינה');
        return;
      }
      
      const version1 = tags[index1];
      const version2 = tags[index2];
      
      console.log(`\n🔍 משווה בין ${version1} ל-${version2}...`);
      execSync(`git diff ${version1} ${version2}`, { stdio: 'inherit' });
      
    } catch (error) {
      console.error('❌ שגיאה בהשוואת גרסאות:', error.message);
    }
  }

  async manageBackups() {
    console.log('\n💾 ניהול גיבויים');
    console.log('========================================');
    console.log('1. יצירת גיבוי');
    console.log('2. הצגת גיבויים');
    console.log('3. שחזור מגיבוי');
    console.log('4. ניקוי גיבויים ישנים');
    console.log('0. חזרה');
    
    const choice = await this.askQuestion('בחר פעולה: ');
    
    switch (choice) {
      case '1':
        await this.createBackup();
        break;
      case '2':
        await this.listBackups();
        break;
      case '3':
        await this.restoreBackup();
        break;
      case '4':
        await this.cleanupBackups();
        break;
    }
  }

  async createBackup() {
    const name = await this.askQuestion('הכנס שם הגיבוי: ');
    this.createBackup(name);
    console.log(`✅ גיבוי נוצר: ${name}`);
  }

  async listBackups() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.bundle'))
        .map(file => {
          const stats = fs.statSync(path.join(this.backupDir, file));
          return {
            name: file,
            size: stats.size,
            date: stats.mtime
          };
        })
        .sort((a, b) => b.date - a.date);
      
      console.log('📋 גיבויים זמינים:');
      backupFiles.forEach((backup, index) => {
        const size = this.formatFileSize(backup.size);
        const date = backup.date.toLocaleString('he-IL');
        console.log(`${index + 1}. ${backup.name} - ${size} - ${date}`);
      });
      
    } catch (error) {
      console.error('❌ שגיאה בהצגת גיבויים:', error.message);
    }
  }

  async restoreBackup() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.bundle'));
      
      if (backupFiles.length === 0) {
        console.log('אין גיבויים זמינים');
        return;
      }
      
      console.log('גיבויים זמינים:');
      backupFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
      
      const choice = await this.askQuestion('בחר גיבוי לשחזור: ');
      const index = parseInt(choice) - 1;
      
      if (index < 0 || index >= backupFiles.length) {
        console.log('❌ בחירה לא תקינה');
        return;
      }
      
      const backupFile = backupFiles[index];
      const confirm = await this.askQuestion(`האם לשחזר מגיבוי ${backupFile}? (y/n): `);
      
      if (confirm.toLowerCase() === 'y') {
        console.log(`🔄 משחזר מגיבוי ${backupFile}...`);
        execSync(`git clone "${path.join(this.backupDir, backupFile)}" temp_restore`, { stdio: 'inherit' });
        console.log('✅ שחזור הושלם בתיקייה temp_restore');
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשחזור:', error.message);
    }
  }

  async cleanupBackups() {
    const days = await this.askQuestion('הכנס מספר ימים לשמירה (ברירת מחדל: 30): ');
    const retentionDays = parseInt(days) || 30;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.bundle'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .filter(backup => backup.stats.mtime < cutoffDate);
      
      if (backupFiles.length === 0) {
        console.log('אין גיבויים ישנים למחיקה');
        return;
      }
      
      console.log(`נמצאו ${backupFiles.length} גיבויים ישנים למחיקה:`);
      backupFiles.forEach(backup => {
        console.log(`- ${backup.name}`);
      });
      
      const confirm = await this.askQuestion('האם למחוק? (y/n): ');
      if (confirm.toLowerCase() === 'y') {
        backupFiles.forEach(backup => {
          fs.unlinkSync(backup.path);
          console.log(`🗑️ נמחק: ${backup.name}`);
        });
        console.log('✅ ניקוי הושלם');
      }
      
    } catch (error) {
      console.error('❌ שגיאה בניקוי:', error.message);
    }
  }

  async exportVersion() {
    console.log('\n📦 יצוא גרסה');
    console.log('========================================');
    
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      if (tags.length === 0) {
        console.log('אין גרסאות זמינות ליצוא');
        return;
      }
      
      console.log('גרסאות זמינות:');
      tags.forEach((tag, index) => {
        console.log(`${index + 1}. ${tag}`);
      });
      
      const choice = await this.askQuestion('בחר גרסה ליצוא: ');
      const index = parseInt(choice) - 1;
      
      if (index < 0 || index >= tags.length) {
        console.log('❌ בחירה לא תקינה');
        return;
      }
      
      const selectedTag = tags[index];
      const format = await this.askQuestion('פורמט יצוא (zip/tar): ') || 'zip';
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportName = `export-${selectedTag}-${timestamp}`;
      const exportPath = path.join(this.exportDir, `${exportName}.${format}`);
      
      console.log(`🔄 יוצר יצוא: ${exportName}.${format}`);
      
      if (format === 'zip') {
        execSync(`git archive --format=zip --output="${exportPath}" ${selectedTag}`, { stdio: 'inherit' });
      } else if (format === 'tar') {
        execSync(`git archive --format=tar --output="${exportPath}" ${selectedTag}`, { stdio: 'inherit' });
      }
      
      console.log(`✅ יצוא הושלם: ${exportPath}`);
      
    } catch (error) {
      console.error('❌ שגיאה ביצוא:', error.message);
    }
  }

  async showStats() {
    console.log('\n📊 סטטיסטיקות');
    console.log('========================================');
    
    try {
      // Git stats
      const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
      const branchCount = execSync('git branch -r | wc -l', { encoding: 'utf8' }).trim();
      const tagCount = execSync('git tag | wc -l', { encoding: 'utf8' }).trim();
      
      console.log(`מספר commits: ${commitCount}`);
      console.log(`מספר branches: ${branchCount}`);
      console.log(`מספר tags: ${tagCount}`);
      
      // Backup stats
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.bundle'));
      
      const totalBackupSize = backupFiles.reduce((total, file) => {
        return total + fs.statSync(path.join(this.backupDir, file)).size;
      }, 0);
      
      console.log(`מספר גיבויים: ${backupFiles.length}`);
      console.log(`גודל כולל גיבויים: ${this.formatFileSize(totalBackupSize)}`);
      
      // Recent activity
      const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' }).trim();
      console.log('\nפעילות אחרונה:');
      console.log(recentCommits);
      
    } catch (error) {
      console.error('❌ שגיאה בהצגת סטטיסטיקות:', error.message);
    }
  }

  async showSettings() {
    console.log('\n⚙️ הגדרות');
    console.log('========================================');
    console.log('1. הגדרות גיבוי');
    console.log('2. הגדרות יצוא');
    console.log('3. הגדרות ניקוי');
    console.log('0. חזרה');
    
    const choice = await this.askQuestion('בחר הגדרה: ');
    
    switch (choice) {
      case '1':
        await this.backupSettings();
        break;
      case '2':
        await this.exportSettings();
        break;
      case '3':
        await this.cleanupSettings();
        break;
    }
  }

  async backupSettings() {
    console.log('\n💾 הגדרות גיבוי');
    console.log('========================================');
    
    const retentionDays = await this.askQuestion('מספר ימים לשמירת גיבויים (ברירת מחדל: 30): ');
    const maxBackups = await this.askQuestion('מספר מקסימלי של גיבויים (ברירת מחדל: 10): ');
    
    // Save settings to config file
    const config = {
      retentionDays: parseInt(retentionDays) || 30,
      maxBackups: parseInt(maxBackups) || 10,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync('backup-config.json', JSON.stringify(config, null, 2));
    console.log('✅ הגדרות גיבוי נשמרו');
  }

  async exportSettings() {
    console.log('\n📦 הגדרות יצוא');
    console.log('========================================');
    
    const defaultFormat = await this.askQuestion('פורמט ברירת מחדל (zip/tar): ');
    const includeNodeModules = await this.askQuestion('הכלל node_modules? (y/n): ');
    
    const config = {
      defaultFormat: defaultFormat || 'zip',
      includeNodeModules: includeNodeModules.toLowerCase() === 'y',
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync('export-config.json', JSON.stringify(config, null, 2));
    console.log('✅ הגדרות יצוא נשמרו');
  }

  async cleanupSettings() {
    console.log('\n🧹 הגדרות ניקוי');
    console.log('========================================');
    
    const autoCleanup = await this.askQuestion('ניקוי אוטומטי? (y/n): ');
    const cleanupDays = await this.askQuestion('מספר ימים לניקוי אוטומטי (ברירת מחדל: 7): ');
    
    const config = {
      autoCleanup: autoCleanup.toLowerCase() === 'y',
      cleanupDays: parseInt(cleanupDays) || 7,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync('cleanup-config.json', JSON.stringify(config, null, 2));
    console.log('✅ הגדרות ניקוי נשמרו');
  }

  // Helper methods
  getNextVersion() {
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.startsWith('v'));
      
      if (tags.length === 0) {
        return '1.0.0';
      }
      
      const latestTag = tags[0];
      const version = latestTag.substring(1); // Remove 'v' prefix
      const [major, minor, patch] = version.split('.').map(Number);
      
      return `${major}.${minor}.${patch + 1}`;
    } catch {
      return '1.0.0';
    }
  }

  saveVersionInfo(version, description) {
    const versionInfo = {
      version,
      description,
      timestamp: new Date().toISOString(),
      gitHash: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    };
    
    fs.writeFileSync(this.versionFile, JSON.stringify(versionInfo, null, 2));
  }

  createBackup(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${name}-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.bundle`);
      
      execSync(`git bundle create "${backupPath}" --all`, { stdio: 'inherit' });
      
      const metadata = {
        name: backupName,
        timestamp: new Date().toISOString(),
        gitHash: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      };
      
      fs.writeFileSync(
        path.join(this.backupDir, `${backupName}.json`),
        JSON.stringify(metadata, null, 2)
      );
      
      return backupName;
    } catch (error) {
      console.error('❌ שגיאה ביצירת גיבוי:', error.message);
    }
  }

  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  async run() {
    try {
      while (true) {
        const choice = await this.showMainMenu();
        
        switch (choice) {
          case '1':
            await this.createCheckpoint();
            break;
          case '2':
            await this.showCheckpoints();
            break;
          case '3':
            await this.restoreCheckpoint();
            break;
          case '4':
            await this.compareVersions();
            break;
          case '5':
            await this.manageBackups();
            break;
          case '6':
            await this.exportVersion();
            break;
          case '7':
            await this.cleanupBackups();
            break;
          case '8':
            await this.showStats();
            break;
          case '9':
            await this.showSettings();
            break;
          case '0':
            console.log('👋 תודה שהשתמשת במערכת ניהול הגרסאות!');
            this.rl.close();
            return;
          default:
            console.log('❌ בחירה לא תקינה');
        }
        
        await this.askQuestion('\nלחץ Enter להמשך...');
      }
    } catch (error) {
      console.error('❌ שגיאה:', error.message);
      this.rl.close();
    }
  }
}

// Run the UI
if (require.main === module) {
  const ui = new VersionControlUI();
  ui.run();
}

module.exports = VersionControlUI;
