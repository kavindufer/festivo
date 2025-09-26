@ECHO OFF
setlocal
set MVNW_DIR=%~dp0
set WRAPPER_JAR=%MVNW_DIR%\.mvn\wrapper\maven-wrapper.jar
IF NOT EXIST "%WRAPPER_JAR%" (
  echo Downloading Maven Wrapper...
  mkdir "%MVNW_DIR%\.mvn\wrapper" >NUL 2>&1
  powershell -Command "Invoke-WebRequest https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar -OutFile '%WRAPPER_JAR%'"
)
"%JAVA_HOME%\bin\java" -Dmaven.multiModuleProjectDirectory=%MVNW_DIR% -cp %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
