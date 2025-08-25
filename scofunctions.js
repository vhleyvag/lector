/*******************************************************************************
** 
** Filename: SCOFunctions.js
**
** File Description: This file contains several JavaScript functions that are 
**                   used by the Sample SCOs contained in the Sample Course.
**                   These functions encapsulate actions that are taken when the
**                   user navigates between SCOs, or exits the Lesson.
**
** Author: ADL Technical Team
**
** Contract Number:
** Company Name: CTC
**
** Design Issues:
**
** Implementation Issues:
** Known Problems:
** Side Effects:
**
** References: ADL SCORM
**
********************************************************************************
**
** Concurrent Technologies Corporation (CTC) grants you ("Licensee") a non-
** exclusive, royalty free, license to use, modify and redistribute this
** software in source and binary code form, provided that i) this copyright
** notice and license appear on all copies of the software; and ii) Licensee
** does not utilize the software in a manner which is disparaging to CTC.
**
** This software is provided "AS IS," without a warranty of any kind.  ALL
** EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
** IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-
** INFRINGEMENT, ARE HEREBY EXCLUDED.  CTC AND ITS LICENSORS SHALL NOT BE LIABLE
** FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING OR
** DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES.  IN NO EVENT WILL CTC  OR ITS
** LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
** INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
** CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
** OR INABILITY TO USE SOFTWARE, EVEN IF CTC  HAS BEEN ADVISED OF THE
** POSSIBILITY OF SUCH DAMAGES.
**
*******************************************************************************/

/* ======= SCORM PATCH v2: stub en memoria (sin tracking) =======
   - Reemplaza SIEMPRE las funciones LMS* para uso fuera de LMS.
   - Mantiene calificación y estado consultables por el curso.
================================================================ */
(function(){
  var __initialized = false;
  var __scorm = {
    // SCORM 1.2
    "cmi.core.lesson_status": "incomplete",
    "cmi.core.lesson_mode": "normal",
    "cmi.core.credit": "credit",
    "cmi.core.score.raw": "0",
    "cmi.core.score.max": "100",
    "cmi.core.score.min": "0",
    "cmi.core.session_time": "00:00:00",
    // SCORM 2004
    "cmi.completion_status": "incomplete",
    "cmi.success_status": "unknown",
    "cmi.mode": "normal",
    "cmi.credit": "credit",
    "cmi.score.raw": "0",
    "cmi.score.max": "100",
    "cmi.score.min": "0",
    "cmi.score.scaled": "",
    // Interactions
    "cmi.interactions._count": "0"
  };

  function _toNumber(v, fallback){
    var n = parseFloat(v);
    return isNaN(n) ? (fallback if fallback is not None else 0) : n;
  }

  function _pad(n){ n = parseInt(n,10); return (n<10?'0':'') + n; }

  function _mirrorStatus12to2004(val){
    var s = (val||"").toLowerCase();
    __scorm["cmi.core.lesson_status"] = val;
    if (s === "completed") __scorm["cmi.completion_status"] = "completed";
    else if (s === "incomplete") __scorm["cmi.completion_status"] = "incomplete";
    else if (s === "passed") { __scorm["cmi.completion_status"] = "completed"; __scorm["cmi.success_status"] = "passed"; }
    else if (s === "failed") { __scorm["cmi.completion_status"] = "completed"; __scorm["cmi.success_status"] = "failed"; }
    else if (s === "not attempted") __scorm["cmi.completion_status"] = "not attempted";
    else if (s === "browsed") __scorm["cmi.completion_status"] = "completed";
  }

  function _mirrorStatus2004to12(val){
    var s = (val||"").toLowerCase();
    __scorm["cmi.completion_status"] = val;
    if (s === "completed") __scorm["cmi.core.lesson_status"] = "completed";
    else if (s === "incomplete") __scorm["cmi.core.lesson_status"] = "incomplete";
    else if (s === "not attempted") __scorm["cmi.core.lesson_status"] = "not attempted";
  }

  function _updateScaled(){
    var raw = parseFloat(__scorm["cmi.core.score.raw"] || __scorm["cmi.score.raw"] || "0");
    var max = parseFloat(__scorm["cmi.core.score.max"] || __scorm["cmi.score.max"] || "100");
    if (max && !isNaN(raw) && !isNaN(max)) {
      __scorm["cmi.score.scaled"] = String(raw / max);
    }
  }

  function _updateCoreFromObjectives(key, value){
    // Si viene como cmi.objectives.n.score.raw -> reflejar en core
    var m = key.match(/^cmi\.objectives\.(\d+)\.score\.(raw|max|min)$/);
    if (m) {
      var which = m[1];
      var kind = m[2];
      var v = String(value);
      __scorm["cmi.core.score."+kind] = v;
      __scorm["cmi.score."+kind] = v;
      _updateScaled();
    }
  }

  // -------- Implementación de API SCORM 1.2 (funciones sueltas) --------
  window.LMSInitialize = function(){ __initialized = true; return "true"; };
  window.LMSIsInitialized = function(){ return __initialized; };
  window.LMSFinish = function(){ 
    // Si nunca se cambió, marcamos como completed al salir
    var st = (__scorm["cmi.core.lesson_status"]||"").toLowerCase();
    if (st === "not attempted" || st === "incomplete" || st === "") {
      _mirrorStatus12to2004("completed");
    }
    return "true"; 
  };
  window.LMSCommit = function(){ return "true"; };
  window.LMSGetLastError = function(){ return "0"; };
  window.LMSGetErrorString = function(){ return "No error"; };
  window.LMSGetDiagnostic = function(){ return "SCORM patched stub"; };

  window.LMSGetValue = function(element){
    if (element === "cmi.score.raw") return __scorm["cmi.score.raw"];
    if (element === "cmi.score.max") return __scorm["cmi.score.max"];
    if (element === "cmi.score.min") return __scorm["cmi.score.min"];
    // fallback general
    return (__scorm.hasOwnProperty(element)) ? __scorm[element] : "";
  };

  window.LMSSetValue = function(element, value){
    var key = String(element);
    var val = String(value);

    // Espejo para score (1.2 <-> 2004)
    if (key === "cmi.core.score.raw" || key === "cmi.score.raw") {
      __scorm["cmi.core.score.raw"] = val; __scorm["cmi.score.raw"] = val; _updateScaled(); return "true";
    }
    if (key === "cmi.core.score.max" || key === "cmi.score.max") {
      __scorm["cmi.core.score.max"] = val; __scorm["cmi.score.max"] = val; _updateScaled(); return "true";
    }
    if (key === "cmi.core.score.min" || key === "cmi.score.min") {
      __scorm["cmi.core.score.min"] = val; __scorm["cmi.score.min"] = val; return "true";
    }
    if (key === "cmi.score.scaled") {
      // Si nos mandan scaled, derivamos raw con max
      var max = parseFloat(__scorm["cmi.core.score.max"] || __scorm["cmi.score.max"] || "100");
      var scaled = parseFloat(val);
      if (!isNaN(scaled) && !isNaN(max)) {
        var raw = String(Math.round(scaled * max));
        __scorm["cmi.core.score.raw"] = raw;
        __scorm["cmi.score.raw"] = raw;
        __scorm["cmi.score.scaled"] = val;
      } else {
        __scorm["cmi.score.scaled"] = val;
      }
      return "true";
    }

    // Estado (1.2) y su espejo 2004
    if (key === "cmi.core.lesson_status") { _mirrorStatus12to2004(val); return "true"; }
    if (key === "cmi.completion_status") { _mirrorStatus2004to12(val); return "true"; }
    if (key === "cmi.success_status") { __scorm["cmi.success_status"] = val; return "true"; }

    // Interactions: mantener el count mínimo si escriben índices
    if (/^cmi\.interactions\.\d+\./.test(key)) {
      var m = key.match(/^cmi\.interactions\.(\d+)\./);
      if (m) {
        var idx = parseInt(m[1], 10);
        var cnt = parseInt(__scorm["cmi.interactions._count"] || "0", 10);
        if (idx + 1 > cnt) __scorm["cmi.interactions._count"] = String(idx + 1);
      }
      __scorm[key] = val;
      _updateCoreFromObjectives(key, val);
      return "true";
    }

    // Guardar cualquier otra clave
    __scorm[key] = val;
    return "true";
  };

  // -------- Exponer objetos API comunes para buscadores de API --------
  window.API = {
    LMSInitialize: window.LMSInitialize,
    LMSFinish: window.LMSFinish,
    LMSGetValue: window.LMSGetValue,
    LMSSetValue: window.LMSSetValue,
    LMSCommit: window.LMSCommit,
    LMSGetLastError: window.LMSGetLastError,
    LMSGetErrorString: window.LMSGetErrorString,
    LMSGetDiagnostic: window.LMSGetDiagnostic
  };

  window.API_1484_11 = {
    Initialize: function(){ __initialized = true; return "true"; },
    Terminate: function(){ 
      var st = (__scorm["cmi.completion_status"]||"").toLowerCase();
      if (st === "not attempted" || st === "incomplete" || st === "") {
        _mirrorStatus12to2004("completed");
      }
      return "true"; 
    },
    GetValue: function(e){ 
      if (e === "cmi.score.raw") return __scorm["cmi.score.raw"];
      if (e === "cmi.score.max") return __scorm["cmi.score.max"];
      if (e === "cmi.score.min") return __scorm["cmi.score.min"];
      return (__scorm.hasOwnProperty(e)) ? __scorm[e] : ""; 
    },
    SetValue: function(e,v){ return window.LMSSetValue(e,v); },
    Commit: function(){ return "true"; },
    GetLastError: function(){ return "0"; },
    GetErrorString: function(){ return "No error"; },
    GetDiagnostic: function(){ return "SCORM patched stub"; }
  };

  // Utilidades del runtime que a veces se esperan
  if (typeof window.readVariable !== "function") window.readVariable = function(n, d){ return d; };
  if (typeof window.saveVariable !== "function") window.saveVariable = function(n, v){};
  if (typeof window.getTitleMgrHandle !== "function") window.getTitleMgrHandle = function(){ return null; };
})(); 
/* ======= FIN SCORM PATCH v2 ======= */


var finishCalled = false;
var autoCommit = false;

function MySetValue( lmsVar, lmsVal ) {
  try { return LMSSetValue(lmsVar, lmsVal); } catch(e) { return "true"; }
}

function loadPage() {
  var startDate = readVariable('TrivantisSCORMTimer', 0);
  saveVariable('TrivantisEPS', 'F');
  if( startDate == 0 || !LMSIsInitialized() ) {
    var result = LMSInitialize();
    var status = new String( LMSGetValue( "cmi.core.lesson_status" ) );
    status = status.toLowerCase();
    if (status == "not attempted") 
    {
        MySetValue( "cmi.core.lesson_status", "incomplete" );
        LMSCommit();
    }
    startTimer();
    return true;
  }
  else return false;
}

function startTimer() {
  var startDate = new Date().getTime();
  saveVariable('TrivantisSCORMTimer',startDate)
}

function computeTime() {
  var startDate = readVariable( 'TrivantisSCORMTimer', 0 )
  if ( startDate != 0 ) {
    var currentDate = new Date().getTime();
    var elapsedMills = currentDate - startDate;
    var formattedTime = convertTotalMills( elapsedMills );
  }
  else formattedTime = "00:00:00.0";
  MySetValue( "cmi.core.session_time", formattedTime );
}

function doBack() {
  MySetValue( "cmi.core.exit", "suspend" );
  computeTime();
  saveVariable( 'TrivantisEPS', 'T' );
  var result;
  result = LMSCommit();
  finishCalled = true;
  result = LMSFinish();
  saveVariable( 'TrivantisSCORMTimer', 0 );
}

function doContinue( status ) {
  MySetValue( "cmi.core.exit", "" );
  var mode = new String( LMSGetValue( "cmi.core.lesson_mode" ) );
  mode = mode.toLowerCase()
  if ( mode != "review"  &&  mode != "browse" ) MySetValue( "cmi.core.lesson_status", status );
  computeTime();
  saveVariable( 'TrivantisEPS', 'T' );
  var result;
  result = LMSCommit();
  finishCalled = true;
  result = LMSFinish();
  saveVariable( 'TrivantisSCORMTimer', 0 );
}

function doQuit(bForce, notPageUnload){
  //MySetValue( "cmi.core.exit", "logout" );
  computeTime();
  saveVariable( 'TrivantisEPS', 'T' );
  var result;
  result = LMSCommit();
  finishCalled = true;
  result = LMSFinish();
  saveVariable( 'TrivantisSCORMTimer', 0 );
    if (bForce && window.myTop &&
        (typeof (notPageUnload) != "boolean" || notPageUnload === true)) // if this is from our exit action see trivantis-cookie.js
        window.myTop.close()
}

function unloadPage(bForce, titleName) {
  var exitPageStatus = readVariable( 'TrivantisEPS', 'F' );
  if (exitPageStatus != 'T') {
    if( window.name.length > 0 && window.name.indexOf( 'Trivantis_' ) == -1 )
      trivScormQuit(bForce, titleName, false);
  }
  else if( finishCalled != true && autoCommit == true ) {
    computeTime();
    LMSCommit();
  }
  saveVariable('TrivantisEPS', 'F');
  
}

function convertTotalMills(ts) {
  var Sec  = 0;
  var Min  = 0;
  var Hour = 0;
  while( ts >= 3600000 ) {
    Hour += 1;
    ts -= 3600000;
  }
  while( ts >= 60000 ){
    Min += 1;
    ts -= 60000;
  }
  while ( ts >= 1000 ){
    Sec += 1;
    ts -= 1000;
  }
  if (Hour < 10) Hour = "0"+Hour;
  if (Min < 10) Min = "0"+Min;
  if (Sec < 10) Sec = "0"+Sec;
  var rtnVal = Hour+":"+Min+":"+Sec;
  return rtnVal;
}

function putSCORMInteractions(id,obj,tim,typ,crsp,wgt,srsp,res,lat,txt) {
  var nextInt = parseInt( LMSGetValue( 'cmi.interactions._count' ), 10 )
  var root    = 'cmi.interactions.' + nextInt
  if(id)   LMSSetValue( root + '.id', id )
  if(obj)  LMSSetValue( root + '.objectives.0.id', obj )
  if(tim)  LMSSetValue( root + '.time', tim )
  if(typ)  LMSSetValue( root + '.type', typ )
  if(crsp) LMSSetValue( root + '.correct_responses.0.pattern', crsp )
  LMSSetValue( root + '.weighting', wgt )
  if(srsp) LMSSetValue( root + '.student_response', srsp )
  if(res)  LMSSetValue( root + '.result', res )
  if(lat)  LMSSetValue( root + '.latency', lat )
  if(txt)  LMSSetValue( root + '.text', txt )
}

