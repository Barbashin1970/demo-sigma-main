#!/usr/bin/env bash
# Двойной клик в Finder запускает локальный dev-сервер Sigma Demo.
# Ставит зависимости при первом запуске и открывает браузер на /operator/hospital-fire.

set -euo pipefail

cd "$(dirname "$0")"

echo "=== Sigma Demo — локальный запуск ==="
echo "Рабочая директория: $(pwd)"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js не найден в PATH."
  echo "Установите Node.js 20+ с https://nodejs.org и запустите скрипт снова."
  read -n 1 -s -r -p "Нажмите любую клавишу для выхода..."
  exit 1
fi

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"
echo

if [ ! -d node_modules ]; then
  echo "Первый запуск — устанавливаю зависимости (npm install)..."
  npm install
  echo
fi

# Открываем вкладку браузера через 3 секунды после старта Vite.
(
  sleep 3
  open "http://localhost:5173/operator/hospital-fire" 2>/dev/null || true
) &

echo "Запускаю Vite dev-сервер. Для остановки — Ctrl+C или закрытие окна."
echo
exec npm run dev
