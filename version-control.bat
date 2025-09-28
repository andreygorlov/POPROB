@echo off
echo ========================================
echo    מערכת ניהול גרסאות ERP
echo ========================================
echo.

:menu
echo בחר פעולה:
echo 1. ממשק משתמש מלא
echo 2. יצירת נקודת שחזור מהירה
echo 3. הצגת נקודות שחזור
echo 4. שחזור מהיר
echo 5. יצירת גיבוי
echo 6. ניטור שינויים
echo 7. סטטיסטיקות
echo 8. התקנת תלויות
echo 9. יציאה
echo.
set /p choice="הכנס בחירה (1-9): "

if "%choice%"=="1" goto full_ui
if "%choice%"=="2" goto quick_checkpoint
if "%choice%"=="3" goto show_checkpoints
if "%choice%"=="4" goto quick_restore
if "%choice%"=="5" goto create_backup
if "%choice%"=="6" goto start_monitoring
if "%choice%"=="7" goto show_stats
if "%choice%"=="8" goto install_deps
if "%choice%"=="9" goto exit
goto menu

:full_ui
echo.
echo מפעיל ממשק משתמש מלא...
npm run version:ui
pause
goto menu

:quick_checkpoint
echo.
set /p description="הכנס תיאור נקודת השחזור: "
echo יוצר נקודת שחזור...
npm run version:checkpoint "%description%"
echo נקודת שחזור נוצרה בהצלחה!
echo.
pause
goto menu

:show_checkpoints
echo.
echo נקודות שחזור זמינות:
echo ========================================
npm run version:list
echo.
pause
goto menu

:quick_restore
echo.
echo נקודות שחזור זמינות:
npm run version:list
echo.
set /p version="הכנס גרסה לשחזור (למשל: v1.2.3): "
echo משחזר לגרסה %version%...
npm run version:restore %version%
echo שחזור הושלם!
echo.
pause
goto menu

:create_backup
echo.
set /p backup_name="הכנס שם הגיבוי: "
echo יוצר גיבוי...
npm run backup:create %backup_name%
echo גיבוי נוצר בהצלחה!
echo.
pause
goto menu

:start_monitoring
echo.
echo מתחיל ניטור שינויים...
npm run monitor:start
echo ניטור פעיל! לחץ Ctrl+C לעצירה
echo.
pause
goto menu

:show_stats
echo.
echo סטטיסטיקות מערכת:
echo ========================================
npm run version:status
echo.
echo סטטיסטיקות גיבויים:
npm run backup:stats
echo.
pause
goto menu

:install_deps
echo.
echo מתקין תלויות...
npm install
echo התקנה הושלמה!
echo.
pause
goto menu

:exit
echo.
echo תודה שהשתמשת במערכת ניהול הגרסאות!
exit
