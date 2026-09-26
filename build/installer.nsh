!ifndef SHCNE_ASSOCCHANGED
  !define SHCNE_ASSOCCHANGED 0x08000000
!endif
!ifndef SHCNF_FLUSH
  !define SHCNF_FLUSH 0x1000
!endif

!macro customInstall
  ; Register in RegisteredApplications for Windows Default Apps (Settings -> Default apps)
  WriteRegStr SHELL_CONTEXT "Software\RegisteredApplications" "Sonora" "Software\Sonora\Capabilities"

  ; Register Sonora Capabilities
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities" "ApplicationName" "Sonora"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities" "ApplicationDescription" "Sonora Music Player"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities" "ApplicationIcon" "$appExe,0"

  ; Register FileAssociations under Capabilities
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".mp3" "Sonora.mp3"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".flac" "Sonora.flac"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".wav" "Sonora.wav"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".m4a" "Sonora.m4a"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".aac" "Sonora.aac"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".ogg" "Sonora.ogg"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".opus" "Sonora.opus"
  WriteRegStr SHELL_CONTEXT "Software\Sonora\Capabilities\FileAssociations" ".wma" "Sonora.wma"

  ; Register under Applications for Open With
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}" "FriendlyAppName" "Sonora"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}" "ApplicationCompany" "Sonora"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\DefaultIcon" "" "$appExe,0"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\shell\open\command" "" '"$appExe" "%1"'

  ; Register SupportedTypes under Applications
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".mp3" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".flac" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".wav" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".m4a" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".aac" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".ogg" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".opus" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".wma" ""

  ; Ensure AppUserModelID, FriendlyTypeName, and Content Type are set on ProgIDs
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.mp3" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.mp3" "FriendlyTypeName" "MP3 Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.mp3" "Content Type" "audio/mpeg"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.flac" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.flac" "FriendlyTypeName" "FLAC Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.flac" "Content Type" "audio/flac"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.wav" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.wav" "FriendlyTypeName" "WAV Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.wav" "Content Type" "audio/wav"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.m4a" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.m4a" "FriendlyTypeName" "M4A Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.m4a" "Content Type" "audio/mp4"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.aac" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.aac" "FriendlyTypeName" "AAC Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.aac" "Content Type" "audio/aac"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.ogg" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.ogg" "FriendlyTypeName" "OGG Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.ogg" "Content Type" "audio/ogg"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.opus" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.opus" "FriendlyTypeName" "OPUS Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.opus" "Content Type" "audio/opus"

  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.wma" "AppUserModelID" "com.sonora.player"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.wma" "FriendlyTypeName" "WMA Audio File"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Sonora.wma" "Content Type" "audio/x-ms-wma"

  ; Notify Windows shell that associations and icons have changed
  System::Call "shell32::SHChangeNotify(i,i,i,i) (${SHCNE_ASSOCCHANGED}, ${SHCNF_FLUSH}, 0, 0)"
!macroend

!macro customUnInstall
  DeleteRegValue SHELL_CONTEXT "Software\RegisteredApplications" "Sonora"
  DeleteRegKey SHELL_CONTEXT "Software\Sonora\Capabilities"
  DeleteRegKey SHELL_CONTEXT "Software\Sonora"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}"

  ; Notify Windows shell
  System::Call "shell32::SHChangeNotify(i,i,i,i) (${SHCNE_ASSOCCHANGED}, ${SHCNF_FLUSH}, 0, 0)"
!macroend
