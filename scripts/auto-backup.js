#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cron = require('node-cron');

class AutoBackup {
  constructor() {
    this.backupDir = 'backups';
    this.configFile = 'backup-config.json';
    this.config = this.loadConfig();
    this.ensureDirectories();
  }

  loadConfig() {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
    }
    
    return {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retentionDays: 30,
      maxBackups: 10,
      includeDatabase: true,
      includeNodeModules: false,
      compression: true,
      notifications: true
    };
  }

  saveConfig() {
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
  }

  ensureDirectories() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(type = 'manual') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${type}-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.bundle`);
      
      console.log(`🔄 יוצר גיבוי: ${backupName}`);
      
      // Create git bundle
      execSync(`git bundle create "${backupPath}" --all`, { stdio: 'inherit' });
      
      // Create metadata
      const metadata = {
        name: backupName,
        type: type,
        timestamp: new Date().toISOString(),
        gitHash: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        size: fs.statSync(backupPath).size,
        config: this.config
      };
      
      fs.writeFileSync(
        path.join(this.backupDir, `${backupName}.json`),
        JSON.stringify(metadata, null, 2)
      );
      
      // Compress if enabled
      if (this.config.compression) {
        this.compressBackup(backupPath);
      }
      
      // Cleanup old backups
      this.cleanupOldBackups();
      
      console.log(`✅ גיבוי נוצר בהצלחה: ${backupName}`);
      return backupName;
    } catch (error) {
      console.error('❌ שגיאה ביצירת גיבוי:', error.message);
      throw error;
    }
  }

  compressBackup(backupPath) {
    try {
      const compressedPath = `${backupPath}.gz`;
      execSync(`gzip -c "${backupPath}" > "${compressedPath}"`, { stdio: 'inherit' });
      fs.unlinkSync(backupPath); // Remove original
      console.log(`🗜️ גיבוי דחוס: ${compressedPath}`);
    } catch (error) {
      console.error('⚠️ שגיאה בדחיסה:', error.message);
    }
  }

  cleanupOldBackups() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.bundle') || file.endsWith('.bundle.gz'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      // Remove old backups based on retention policy
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const oldBackups = backupFiles.filter(backup => backup.stats.mtime < cutoffDate);
      oldBackups.forEach(backup => {
        fs.unlinkSync(backup.path);
        const metadataFile = backup.path.replace(/\.(bundle|bundle\.gz)$/, '.json');
        if (fs.existsSync(metadataFile)) {
          fs.unlinkSync(metadataFile);
        }
        console.log(`🗑️ נמחק גיבוי ישן: ${backup.name}`);
      });

      // Keep only maxBackups number of recent backups
      if (backupFiles.length > this.config.maxBackups) {
        const excessBackups = backupFiles.slice(this.config.maxBackups);
        excessBackups.forEach(backup => {
          fs.unlinkSync(backup.path);
          const metadataFile = backup.path.replace(/\.(bundle|bundle\.gz)$/, '.json');
          if (fs.existsSync(metadataFile)) {
            fs.unlinkSync(metadataFile);
          }
          console.log(`🗑️ נמחק גיבוי עודף: ${backup.name}`);
        });
      }
    } catch (error) {
      console.error('❌ שגיאה בניקוי גיבויים:', error.message);
    }
  }

  listBackups() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const metadata = JSON.parse(fs.readFileSync(path.join(this.backupDir, file), 'utf8'));
          return {
            name: metadata.name,
            type: metadata.type,
            timestamp: metadata.timestamp,
            size: metadata.size,
            gitHash: metadata.gitHash
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('📋 גיבויים זמינים:');
      console.log('========================================');
      
      backupFiles.forEach(backup => {
        const date = new Date(backup.timestamp).toLocaleString('he-IL');
        const size = this.formatFileSize(backup.size);
        console.log(`${backup.name} - ${date} - ${size} - ${backup.type}`);
      });
      
      return backupFiles;
    } catch (error) {
      console.error('❌ שגיאה בהצגת גיבויים:', error.message);
      return [];
    }
  }

  restoreBackup(backupName) {
    try {
      const backupPath = path.join(this.backupDir, `${backupName}.bundle`);
      const compressedPath = `${backupPath}.gz`;
      
      let actualPath = backupPath;
      if (fs.existsSync(compressedPath)) {
        actualPath = compressedPath;
        // Decompress if needed
        execSync(`gunzip -c "${compressedPath}" > "${backupPath}"`, { stdio: 'inherit' });
      }
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`גיבוי לא נמצא: ${backupName}`);
      }
      
      console.log(`🔄 משחזר מגיבוי: ${backupName}`);
      
      // Create restore directory
      const restoreDir = `restore-${backupName}`;
      if (fs.existsSync(restoreDir)) {
        fs.rmSync(restoreDir, { recursive: true });
      }
      
      // Clone from bundle
      execSync(`git clone "${backupPath}" "${restoreDir}"`, { stdio: 'inherit' });
      
      console.log(`✅ שחזור הושלם בתיקייה: ${restoreDir}`);
      return restoreDir;
    } catch (error) {
      console.error('❌ שגיאה בשחזור:', error.message);
      throw error;
    }
  }

  startScheduledBackups() {
    if (!this.config.enabled) {
      console.log('⚠️ גיבויים אוטומטיים מושבתים');
      return;
    }

    console.log(`⏰ מתחיל גיבויים אוטומטיים (${this.config.schedule})`);
    
    cron.schedule(this.config.schedule, () => {
      console.log('🔄 גיבוי אוטומטי מתחיל...');
      this.createBackup('scheduled');
    });
    
    console.log('✅ גיבויים אוטומטיים פעילים');
  }

  stopScheduledBackups() {
    cron.destroy();
    console.log('⏹️ גיבויים אוטומטיים הופסקו');
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    console.log('✅ הגדרות עודכנו');
  }

  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  getBackupStats() {
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.bundle') || file.endsWith('.bundle.gz'));
    
    const totalSize = backupFiles.reduce((total, file) => {
      return total + fs.statSync(path.join(this.backupDir, file)).size;
    }, 0);
    
    return {
      count: backupFiles.length,
      totalSize: totalSize,
      formattedSize: this.formatFileSize(totalSize),
      oldest: backupFiles.length > 0 ? 
        Math.min(...backupFiles.map(file => 
          fs.statSync(path.join(this.backupDir, file)).mtime
        )) : null,
      newest: backupFiles.length > 0 ? 
        Math.max(...backupFiles.map(file => 
          fs.statSync(path.join(this.backupDir, file)).mtime
        )) : null
    };
  }
}

// CLI Interface
if (require.main === module) {
  const backup = new AutoBackup();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'create':
      const type = args[0] || 'manual';
      backup.createBackup(type);
      break;
      
    case 'list':
      backup.listBackups();
      break;
      
    case 'restore':
      const backupName = args[0];
      if (!backupName) {
        console.error('❌ נדרש לציין שם גיבוי');
        process.exit(1);
      }
      backup.restoreBackup(backupName);
      break;
      
    case 'start':
      backup.startScheduledBackups();
      break;
      
    case 'stop':
      backup.stopScheduledBackups();
      break;
      
    case 'config':
      const configKey = args[0];
      const configValue = args[1];
      if (configKey && configValue) {
        backup.updateConfig({ [configKey]: configValue });
      } else {
        console.log('הגדרות נוכחיות:', backup.config);
      }
      break;
      
    case 'stats':
      const stats = backup.getBackupStats();
      console.log('📊 סטטיסטיקות גיבויים:');
      console.log('========================================');
      console.log(`מספר גיבויים: ${stats.count}`);
      console.log(`גודל כולל: ${stats.formattedSize}`);
      if (stats.oldest) {
        console.log(`הגיבוי הישן ביותר: ${new Date(stats.oldest).toLocaleString('he-IL')}`);
      }
      if (stats.newest) {
        console.log(`הגיבוי החדש ביותר: ${new Date(stats.newest).toLocaleString('he-IL')}`);
      }
      break;
      
    default:
      console.log(`
🔄 מערכת גיבוי אוטומטית

שימוש:
  node scripts/auto-backup.js <command> [args]

פקודות:
  create [type]            - יצירת גיבוי
  list                     - הצגת גיבויים
  restore <name>           - שחזור מגיבוי
  start                    - התחלת גיבויים אוטומטיים
  stop                     - עצירת גיבויים אוטומטיים
  config [key] [value]      - עדכון הגדרות
  stats                    - הצגת סטטיסטיקות

דוגמאות:
  node scripts/auto-backup.js create manual
  node scripts/auto-backup.js restore manual-2024-01-15T10-30-00-000Z
  node scripts/auto-backup.js config retentionDays 60
  node scripts/auto-backup.js stats
      `);
  }
}

module.exports = AutoBackup;
