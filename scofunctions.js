/*******************************************************************************
** Patched SCOFunctions.js (SCORM neutralizado para uso fuera de LMS)
**
** En esta versión TODAS las llamadas a la API SCORM son reemplazadas por
** funciones "dummy" que no hacen nada pero siempre devuelven éxito.
**
** Esto permite que el paquete se ejecute como HTML normal (en GitHub Pages,
** WordPress, etc.) sin mostrar errores "Unable to find API adapter".
**
*******************************************************************************/

// -----------------------------------------------------------------------------
// Fakes SCORM API Calls
// -----------------------------------------------------------------------------

function LMSInitialize(param) { return "true"; }
function LMSFinish(param) { return "true"; }
function LMSGetValue(element) { return ""; }
function LMSSetValue(element, value) { return "true"; }
function LMSCommit(param) { return "true"; }
function LMSGetLastError() { return "0"; }
function LMSGetErrorString(errorCode) { return "No error"; }
function LMSGetDiagnostic(errorCode) { return "No diagnostic"; }

// Variables globales
var finishCalled = false;
var autoCommit = false;

// -----------------------------------------------------------------------------
// Funciones parcheadas (ya no dependen de un LMS real)
// -----------------------------------------------------------------------------

function MySetValue(lmsVar, lmsVal) {
  // Antes: intentaba enviar a un TitleMgr y al LMS.
  // Ahora solo ignora la llamada y evita error.
  return LMSSetValue(lmsVar, lmsVal);
}

function loadPage() {
  // Inicia un "estado ficticio" sin LMS
  startTimer();
  return true;
}

function startTimer() {
  var startDate = new Date().getTime();
  // Se guarda en memoria global simple (sin LMS)
  window.TrivantisSCORMTimer = startDate;
}

function computeTime() {
  var startDate = window.TrivantisSCORMTimer || 0;
  var formattedTime = "00:00:00";
  if (startDate !== 0) {
    var currentDate = new Date().getTime();
    var elapsedMills = currentDate - startDate;
    formattedTime = convertTotalMills(elapsedMills);
  }
  MySetValue("cmi.core.session_time", formattedTime);
}

function doBack() {
  computeTime();
  finishCalled = true;
  window.TrivantisSCORMTimer = 0;
}

function doContinue(status) {
  computeTime();
  finishCalled = true;
  window.TrivantisSCORMTimer = 0;
}

function doQuit(bForce, notPageUnload) {
  computeTime();
  finishCalled = true;
  window.TrivantisSCORMTimer = 0;
  if (bForce && window.myTop &&
      (typeof(notPageUnload) != "boolean" || notPageUnload === true)) {
    window.myTop.close();
  }
}

function unloadPage(bForce, titleName) {
  if (finishCalled != true && autoCommit == true) {
    computeTime();
    LMSCommit();
  }
}

function convertTotalMills(ts) {
  var Sec  = 0, Min = 0, Hour = 0;
  while(ts >= 3600000) { Hour++; ts -= 3600000; }
  while(ts >= 60000)   { Min++;  ts -= 60000; }
  while(ts >= 1000)    { Sec++;  ts -= 1000; }

  if (Hour < 10) Hour = "0"+Hour;
  if (Min < 10)  Min  = "0"+Min;
  if (Sec < 10)  Sec  = "0"+Sec;

  return Hour+":"+Min+":"+Sec;
}

function putSCORMInteractions(id,obj,tim,typ,crsp,wgt,srsp,res,lat,txt) {
  // En SCORM real, esto registraría interacciones. Aquí lo ignoramos.
  return true;
}
