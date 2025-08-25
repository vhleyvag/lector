/*******************************************************************************
** Patched SCOFunctions.js
**
** Versión simplificada para uso fuera de LMS:
** - No guarda progreso ni estado.
** - Sí permite manejar calificación (score) y devolverla al curso.
*******************************************************************************/

// Variables globales para manejar calificación
var scoreRaw = "";
var scoreMax = "";
var scoreMin = "";

// -----------------------------------------------------------------------------
// Fakes SCORM API Calls con soporte de calificación
// -----------------------------------------------------------------------------

function LMSInitialize(param) { return "true"; }
function LMSFinish(param) { return "true"; }

function LMSGetValue(element) {
  // Manejo de score
  if (element === "cmi.core.score.raw" || element === "cmi.score.raw") {
    return scoreRaw;
  }
  if (element === "cmi.core.score.max" || element === "cmi.score.max") {
    return scoreMax;
  }
  if (element === "cmi.core.score.min" || element === "cmi.score.min") {
    return scoreMin;
  }
  // En cualquier otro caso, devolver vacío
  return "";
}

function LMSSetValue(element, value) {
  // Guardar score en variables locales
  if (element === "cmi.core.score.raw" || element === "cmi.score.raw") {
    scoreRaw = value;
    return "true";
  }
  if (element === "cmi.core.score.max" || element === "cmi.score.max") {
    scoreMax = value;
    return "true";
  }
  if (element === "cmi.core.score.min" || element === "cmi.score.min") {
    scoreMin = value;
    return "true";
  }
  // Ignorar cualquier otro valor
  return "true";
}

function LMSCommit(param) { return "true"; }
function LMSGetLastError() { return "0"; }
function LMSGetErrorString(errorCode) { return "No error"; }
function LMSGetDiagnostic(errorCode) { return "No diagnostic"; }

// Variables globales
var finishCalled = false;
var autoCommit = false;

// -----------------------------------------------------------------------------
// Funciones parcheadas (sin conexión LMS)
// -----------------------------------------------------------------------------

function MySetValue(lmsVar, lmsVal) {
  return LMSSetValue(lmsVar, lmsVal);
}

function loadPage() {
  startTimer();
  return true;
}

function startTimer() {
  var startDate = new Date().getTime();
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
  // Aquí no guardamos nada, solo ignoramos silenciosamente
  return true;
}