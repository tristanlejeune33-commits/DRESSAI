@echo off
echo Initialisation de Git...
git init
git add .
git commit -m "Premier commit : Application DressAi complète"
git branch -M main
git remote add origin https://github.com/tristanlejeune33-commits/DRESSAI.git
git remote set-url origin https://github.com/tristanlejeune33-commits/DRESSAI.git
echo.
echo Envoi vers GitHub...
git push -u origin main
echo.
echo Termine ! Si des erreurs apparaissent ci-dessus, verifiez que Git est bien installe.
pause