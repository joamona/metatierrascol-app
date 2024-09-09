export CAPACITOR_ANDROID_STUDIO_PATH="/home/joamona/desktopApps/android-studio/bin/studio.sh"
#ionic cap add android
ionic cap build android
npx cap sync
npx cap open android
