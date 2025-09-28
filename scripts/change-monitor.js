#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

class ChangeMonitor {
  constructor() {
    this.watchDir = process.cwd();
    this.logFile = 'change-log.json';
    this.ignorePatterns = [
      'node_modules/**',
      '.git/**',
      '.next/**',
      '*.log',
      '*.tmp',
      'backups/**',
      'exports/**'
    ];
    this.changeLog = this.loadChangeLog();
    this.isMonitoring = false;
  }

  loadChangeLog() {
    if (fs.existsSync(this.logFile)) {
      return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
    }
    return {
      changes: [],
      lastCheckpoint: null,
      totalChanges: 0
    };
  }

  saveChangeLog() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.changeLog, null, 2));
  }

  logChange(eventType, filePath, stats = null) {
    const change = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: eventType,
      file: filePath,
      size: stats ? stats.size : null,
      modified: stats ? stats.mtime : null,
      gitHash: this.getCurrentGitHash()
    };

    this.changeLog.changes.push(change);
    this.changeLog.totalChanges++;
    this.saveChangeLog();

    console.log(`📝 ${eventType}: ${filePath}`);
  }

  getCurrentGitHash() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  }

  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ ניטור כבר פעיל');
      return;
    }

    console.log('🔍 מתחיל ניטור שינויים...');
    
    const watcher = chokidar.watch(this.watchDir, {
      ignored: this.ignorePatterns,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (filePath) => {
        const stats = fs.statSync(filePath);
        this.logChange('ADDED', filePath, stats);
      })
      .on('change', (filePath) => {
        const stats = fs.statSync(filePath);
        this.logChange('MODIFIED', filePath, stats);
      })
      .on('unlink', (filePath) => {
        this.logChange('DELETED', filePath);
      })
      .on('error', (error) => {
        console.error('❌ שגיאה בניטור:', error);
      });

    this.isMonitoring = true;
    this.watcher = watcher;

    console.log('✅ ניטור פעיל');
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️ ניטור לא פעיל');
      return;
    }

    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    this.isMonitoring = false;
    console.log('⏹️ ניטור הופסק');
  }

  getChangeSummary(hours = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentChanges = this.changeLog.changes.filter(
      change => new Date(change.timestamp) > cutoffTime
    );

    const summary = {
      totalChanges: recentChanges.length,
      byType: {},
      byFile: {},
      timeline: []
    };

    recentChanges.forEach(change => {
      // Count by type
      summary.byType[change.type] = (summary.byType[change.type] || 0) + 1;
      
      // Count by file
      const fileName = path.basename(change.file);
      summary.byFile[fileName] = (summary.byFile[fileName] || 0) + 1;
      
      // Add to timeline
      summary.timeline.push({
        time: change.timestamp,
        type: change.type,
        file: change.file
      });
    });

    return summary;
  }

  generateReport() {
    const summary = this.getChangeSummary();
    
    console.log('\n📊 דוח שינויים (24 שעות אחרונות):');
    console.log('========================================');
    console.log(`סה"כ שינויים: ${summary.totalChanges}`);
    
    console.log('\n📈 לפי סוג:');
    Object.entries(summary.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n📁 קבצים שהשתנו הכי הרבה:');
    Object.entries(summary.byFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([file, count]) => {
        console.log(`  ${file}: ${count} שינויים`);
      });
    
    console.log('\n⏰ ציר זמן:');
    summary.timeline
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10)
      .forEach(change => {
        const time = new Date(change.time).toLocaleString('he-IL');
        console.log(`  ${time} - ${change.type} - ${change.file}`);
      });
  }

  createCheckpointFromChanges(description) {
    const recentChanges = this.getChangeSummary(1); // Last hour
    
    if (recentChanges.totalChanges === 0) {
      console.log('⚠️ אין שינויים ליצירת נקודת שחזור');
      return;
    }

    console.log(`🔄 יוצר נקודת שחזור עם ${recentChanges.totalChanges} שינויים...`);
    
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "Auto-checkpoint: ${description}"`, { stdio: 'inherit' });
      
      this.changeLog.lastCheckpoint = {
        timestamp: new Date().toISOString(),
        description,
        changesCount: recentChanges.totalChanges
      };
      this.saveChangeLog();
      
      console.log('✅ נקודת שחזור נוצרה בהצלחה');
    } catch (error) {
      console.error('❌ שגיאה ביצירת נקודת שחזור:', error.message);
    }
  }

  cleanupOldLogs(days = 7) {
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const originalCount = this.changeLog.changes.length;
    
    this.changeLog.changes = this.changeLog.changes.filter(
      change => new Date(change.timestamp) > cutoffTime
    );
    
    const removedCount = originalCount - this.changeLog.changes.length;
    this.saveChangeLog();
    
    console.log(`🧹 נוקו ${removedCount} רשומות ישנות`);
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new ChangeMonitor();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'start':
      monitor.startMonitoring();
      break;
      
    case 'stop':
      monitor.stopMonitoring();
      break;
      
    case 'status':
      monitor.generateReport();
      break;
      
    case 'checkpoint':
      const description = args[0] || 'נקודת שחזור אוטומטית';
      monitor.createCheckpointFromChanges(description);
      break;
      
    case 'cleanup':
      const days = parseInt(args[0]) || 7;
      monitor.cleanupOldLogs(days);
      break;
      
    default:
      console.log(`
🔍 מערכת ניטור שינויים

שימוש:
  node scripts/change-monitor.js <command> [args]

פקודות:
  start                    - התחלת ניטור
  stop                     - עצירת ניטור
  status                   - הצגת דוח שינויים
  checkpoint [description] - יצירת נקודת שחזור
  cleanup [days]           - ניקוי רשומות ישנות

דוגמאות:
  node scripts/change-monitor.js start
  node scripts/change-monitor.js status
  node scripts/change-monitor.js checkpoint "תיקון באג"
  node scripts/change-monitor.js cleanup 7
      `);
  }
}

module.exports = ChangeMonitor;
