# Script pour nettoyer le répertoire dist en fermant les processus qui verrouillent les fichiers

Write-Host "Fermeture de tous les processus Auto-Claude et Electron..." -ForegroundColor Yellow

# Arrêter tous les processus Auto-Claude
Get-Process -Name "Auto-Claude" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force

# Attendre un peu pour que les processus se terminent
Start-Sleep -Seconds 2

# Essayer de supprimer le répertoire dist
if (Test-Path "dist") {
    Write-Host "Suppression du répertoire dist..." -ForegroundColor Yellow
    try {
        Remove-Item -Path "dist" -Recurse -Force -ErrorAction Stop
        Write-Host "Répertoire dist supprimé avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "Impossible de supprimer dist complètement. Certains fichiers sont encore verrouillés." -ForegroundColor Red
        Write-Host "Erreur: $_" -ForegroundColor Red

        # Essayer de renommer le répertoire dist
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $newName = "dist_old_$timestamp"
        try {
            Rename-Item -Path "dist" -NewName $newName -Force
            Write-Host "Répertoire dist renommé en $newName" -ForegroundColor Yellow
        } catch {
            Write-Host "Impossible de renommer dist. Veuillez fermer tous les programmes et réessayer manuellement." -ForegroundColor Red
        }
    }
} else {
    Write-Host "Le répertoire dist n'existe pas." -ForegroundColor Green
}

Write-Host "`nVous pouvez maintenant relancer: npm run package:win" -ForegroundColor Cyan
