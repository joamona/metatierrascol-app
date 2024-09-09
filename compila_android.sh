ng build --production
export CAPACITOR_ANDROID_STUDIO_PATH="/home/joamona/desktopApps/android-studio/bin/studio.sh"
export ANDROID_SDK_ROOT="/home/joamona/Android/Sdk"
export JAVA_HOME="/home/joamona/Android/Sdk"
#export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
npx cap sync
npx cap run android