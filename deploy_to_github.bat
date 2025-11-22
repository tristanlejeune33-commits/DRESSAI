@echo off
echo Initialisation de Git...
"C:\Program Files\Git\bin\git.exe" init
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "Mise a jour Application DressAi"
"C:\Program Files\Git\bin\git.exe" branch -M main
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/tristanlejeune33-commits/DRESSAI.git
"C:\Program Files\Git\bin\git.exe" remote set-url origin https://github.com/tristanlejeune33-commits/DRESSAI.git
echo.
echo Envoi vers GitHub...
"C:\Program Files\Git\bin\git.exe" push -u origin main
echo.
echo Termine !
pause