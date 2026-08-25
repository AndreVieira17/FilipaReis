@echo off
cd /d "C:\Users\Andre\filipa-reis"
echo. >> "produtos\importacao-automatica.log"
echo ==== %date% %time% ==== >> "produtos\importacao-automatica.log"
call npm run importar-produtos >> "produtos\importacao-automatica.log" 2>&1
