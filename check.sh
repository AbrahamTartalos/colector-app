#!/bin/bash
echo "🔍 Verificando estructura del proyecto..."

# Array de archivos críticos
files=(
  "App.js"
  "app.json"
  "package.json"
  "src/navigation/AppNavigator.js"
  "src/screens/MapScreen.js"
  "src/screens/ScheduleScreen.js"
  "src/components/TruckMarker.js"
  "src/components/ZoneCard.js"
  "src/hooks/useTrucks.js"
  "src/hooks/useUserLocation.js"
  "src/hooks/useZones.js"
  "src/services/DataService.js"
  "src/services/SimulatedDataSource.js"
  "src/data/zones.js"
  "src/data/routes.js"
  "assets/icon.png"
  "assets/splash.png"
)

missing_files=0

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Falta: $file"
    missing_files=$((missing_files + 1))
  else
    echo "✅ Existe: $file"
  fi
done

if [ $missing_files -eq 0 ]; then
  echo ""
  echo "🎉 ¡Todos los archivos están en su lugar!"
else
  echo ""
  echo "⚠️  Faltan $missing_files archivo(s)"
fi