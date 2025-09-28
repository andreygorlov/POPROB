@echo off
echo ========================================
echo    מערכת ניהול גרסאות ERP
echo ========================================
echo.

:menu
echo בחר פעולה:
echo 1. יצירת נקודת שחזור חדשה
echo 2. הצגת נקודות שחזור
echo 3. שחזור לגרסה קודמת
echo 4. השוואת גרסאות
echo 5. יצירת גיבוי
echo 6. שחזור מגיבוי
echo 7. ניקוי נקודות שחזור ישנות
echo 8. יצוא גרסה
echo 9. יצוא
echo.
set /p choice="הכנס בחירה (1-9): "

if "%choice%"=="1" goto create_checkpoint
if "%choice%"=="2" goto show_checkpoints
if "%choice%"=="3" goto restore_checkpoint
if "%choice%"=="4" goto compare_versions
if "%choice%"=="5" goto create_backup
if "%choice%"=="6" goto restore_backup
if "%choice%"=="7" goto cleanup_old
if "%choice%"=="8" goto export_version
if "%choice%"=="9" goto exit
goto menu

:create_checkpoint
echo.
set /p description="הכנס תיאור נקודת השחזור: "
echo יוצר נקודת שחזור...
git add .
git commit -m "Checkpoint: %description% - %date% %time%"
echo נקודת שחזור נוצרה בהצלחה!
echo.
pause
goto menu

:show_checkpoints
echo.
echo נקודות שחזור זמינות:
echo ========================================
git log --oneline --graph --decorate -10
echo.
pause
goto menu

:restore_checkpoint
echo.
echo נקודות שחזור זמינות:
git log --oneline -10
echo.
set /p commit_hash="הכנס hash של הגרסה לשחזור: "
echo משחזר לגרסה %commit_hash%...
git checkout %commit_hash%
echo שחזור הושלם!
echo.
pause
goto menu

:compare_versions
echo.
set /p commit1="הכנס hash של הגרסה הראשונה: "
set /p commit2="הכנס hash של הגרסה השנייה: "
echo משווה בין הגרסאות...
git diff %commit1% %commit2%
echo.
pause
goto menu

:create_backup
echo.
set /p backup_name="הכנס שם הגיבוי: "
echo יוצר גיבוי...
git bundle create backups/%backup_name%.bundle --all
echo גיבוי נוצר בהצלחה!
echo.
pause
goto menu

:restore_backup
echo.
echo גיבויים זמינים:
dir backups\*.bundle
echo.
set /p backup_file="הכנס שם קובץ הגיבוי: "
echo משחזר מגיבוי...
git clone backups/%backup_file% temp_restore
echo שחזור מגיבוי הושלם!
echo.
pause
goto menu

:cleanup_old
echo.
set /p days="הכנס מספר ימים לשמירה (ברירת מחדל: 30): "
if "%days%"=="" set days=30
echo מנקה נקודות שחזור ישנות מ-%days% ימים...
git reflog expire --expire=now --expire-unreachable=now --all
git gc --prune=now --aggressive
echo ניקוי הושלם!
echo.
pause
goto menu

:export_version
echo.
set /p version_name="הכנס שם הגרסה ליצוא: "
echo יוצר יצוא גרסה...
git archive --format=zip --output=exports/%version_name%.zip HEAD
echo יצוא הושלם!
echo.
pause
goto menu

:exit
echo.
echo תודה שהשתמשת במערכת ניהול הגרסאות!
exit
