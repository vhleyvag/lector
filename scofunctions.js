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

/* ======= SCORM + TitleMgr stub v3 =======
   Objetivo:
   - Ejecutar fuera de un LMS como HTML normal.
   - No persistir progreso.
   - Permitir que el SCO escriba/lea calificación (score) y estado
     y que las lecturas (LMSGetValue / getTitleMgrHandle) devuelvan esos valores.
   - Actualizar TitleMgr si existe (o usar stub interno) para que la UI de Trivantis muestre valores.
======================================================================= */
(function(){
  // almacenamiento interno
  var __scorm = {
    "cmi.core.lesson_status": "not attempted",
    "cmi.core.lesson_mode": "normal",
    "cmi.core.credit": "credit",
    "cmi.core.score.raw": "",
    "cmi.core.score.max": "100",
    "cmi.core.score.min": "0",
    "cmi.core.session_time": "00:00:00",
    "cmi.interactions._count": "0",
    "cmi.completion_status": "not attempted",
    "cmi.success_status": "unknown",
    "cmi.score.raw": "",
    "cmi.score.max": "100",
    "cmi.score.min": "0",
    "cmi.score.scaled": ""
  };
  var __initialized = false;

  function _updateScaled() {
    var raw = parseFloat(__scorm["cmi.core.score.raw"] || __scorm["cmi.score.raw"] || "0");
    var max = parseFloat(__scorm["cmi.core.score.max"] || __scorm["cmi.score.max"] || "100");
    if (!isNaN(raw) && !isNaN(max) && max != 0) {
      __scorm["cmi.score.scaled"] = String(raw / max);
    } else {
      __scorm["cmi.score.scaled"] = "";
    }
  }

  function _mirrorStatus12to2004(val){
    var s = (val||"").toLowerCase();
    __scorm["cmi.core.lesson_status"] = val;
    if (s === "completed" || s === "passed") {
      __scorm["cmi.completion_status"] = "completed";
      if (s === "passed") __scorm["cmi.success_status"] = "passed";
      if (s === "failed") __scorm["cmi.success_status"] = "failed";
    } else if (s === "incomplete") {
      __scorm["cmi.completion_status"] = "incomplete";
    } else if (s === "not attempted") {
      __scorm["cmi.completion_status"] = "not attempted";
    } else {
      __scorm["cmi.completion_status"] = val;
    }
  }

  function _mirrorStatus2004to12(val){
    var s = (val||"").toLowerCase();
    __scorm["cmi.completion_status"] = val;
    if (s === "completed") {
      __scorm["cmi.core.lesson_status"] = "completed";
    } else if (s === "incomplete") {
      __scorm["cmi.core.lesson_status"] = "incomplete";
    } else if (s === "not attempted") {
      __scorm["cmi.core.lesson_status"] = "not attempted";
    } else {
      __scorm["cmi.core.lesson_status"] = val;
    }
  }

  // TitleMgr stub interno (si no hay uno real)
  var __titleVars = {};
  var __titleMgrStub = {
    setVariable: function(name, value, nd) {
      try { __titleVars[name] = String(value); } catch(e) {}
    },
    getVariable: function(name, defaultVal) {
      if (typeof __titleVars[name] !== 'undefined') return __titleVars[name];
      return typeof defaultVal !== 'undefined' ? defaultVal : "";
    }
  };

  function _maybeUpdateTitleMgr(key, value) {
    try {
      if (typeof getTitleMgrHandle === 'function') {
        var t = getTitleMgrHandle();
        if (t && typeof t.setVariable === 'function') {
          try { t.setVariable(key, value, 0); return; } catch(e) {}
        }
      }
    } catch(e){}
    // si llegamos aquí, actualizamos el stub
    try { __titleMgrStub.setVariable(key, value, 0); } catch(e) {}
  }

  // Definición de funciones LMS 1.2
  window.LMSInitialize = function(){ __initialized = true; return "true"; };
  window.LMSIsInitialized = function(){ return __initialized; };
  window.LMSFinish = function(){ __initialized = false; return "true"; };
  window.LMSCommit = function(){ return "true"; };
  window.LMSGetLastError = function(){ return "0"; };
  window.LMSGetErrorString = function(){ return "No error"; };
  window.LMSGetDiagnostic = function(){ return "SCORM patched stub"; };

  window.LMSGetValue = function(element) {
    try {
      if (!element) return "";
      // allow both 1.2 and 2004 names
      if (element === "cmi.core.score.raw" || element === "cmi.score.raw") return __scorm["cmi.core.score.raw"] || __scorm["cmi.score.raw"] || "";
      if (element === "cmi.core.score.max" || element === "cmi.score.max") return __scorm["cmi.core.score.max"] || __scorm["cmi.score.max"] || "";
      if (element === "cmi.core.score.min" || element === "cmi.score.min") return __scorm["cmi.core.score.min"] || __scorm["cmi.score.min"] || "";
      if (element === "cmi.score.scaled") return __scorm["cmi.score.scaled"] || "";
      if (element === "cmi.core.lesson_status") return __scorm["cmi.core.lesson_status"] || "";
      if (element === "cmi.completion_status") return __scorm["cmi.completion_status"] || "";
      if (element === "cmi.success_status") return __scorm["cmi.success_status"] || "";
      if (element === "cmi.core.session_time") return __scorm["cmi.core.session_time"] || "";
      if (typeof __scorm[element] !== 'undefined') return __scorm[element];
      // fallback to TitleMgr stub if variable stored there
      try {
        if (typeof getTitleMgrHandle === 'function') {
          var t = getTitleMgrHandle();
          if (t && typeof t.getVariable === 'function') return t.getVariable(element, "");
        } else {
          return __titleMgrStub.getVariable(element, "");
        }
      } catch(e){}
      return "";
    } catch(e) { return ""; }
  };

  window.LMSSetValue = function(element, value) {
    try {
      var key = String(element);
      var val = (typeof value === 'undefined' || value === null) ? "" : String(value);

      // score mirrored
      if (key === "cmi.core.score.raw" || key === "cmi.score.raw") {
        __scorm["cmi.core.score.raw"] = val; __scorm["cmi.score.raw"] = val; _updateScaled();
        _maybeUpdateTitleMgr("cmi.core.score.raw", val);
        _maybeUpdateTitleMgr("cmi.score.raw", val);
        return "true";
      }
      if (key === "cmi.core.score.max" || key === "cmi.score.max") {
        __scorm["cmi.core.score.max"] = val; __scorm["cmi.score.max"] = val; _updateScaled();
        _maybeUpdateTitleMgr("cmi.core.score.max", val);
        _maybeUpdateTitleMgr("cmi.score.max", val);
        return "true";
      }
      if (key === "cmi.core.score.min" || key === "cmi.score.min") {
        __scorm["cmi.core.score.min"] = val; __scorm["cmi.score.min"] = val;
        _maybeUpdateTitleMgr("cmi.core.score.min", val);
        _maybeUpdateTitleMgr("cmi.score.min", val);
        return "true";
      }
      if (key === "cmi.score.scaled") {
        __scorm["cmi.score.scaled"] = val;
        // try derive raw using max if possible
        var max = parseFloat(__scorm["cmi.core.score.max"] || __scorm["cmi.score.max"] || "100");
        var scaled = parseFloat(val);
        if (!isNaN(scaled) && !isNaN(max) && max != 0) {
          var raw = String(Math.round(scaled * max));
          __scorm["cmi.core.score.raw"] = raw; __scorm["cmi.score.raw"] = raw;
          _maybeUpdateTitleMgr("cmi.core.score.raw", raw);
          _maybeUpdateTitleMgr("cmi.score.raw", raw);
        }
        _maybeUpdateTitleMgr("cmi.score.scaled", val);
        return "true";
      }

      // lesson status / completion status
      if (key === "cmi.core.lesson_status") {
        __scorm["cmi.core.lesson_status"] = val;
        _mirrorStatus12to2004(val);
        _maybeUpdateTitleMgr("cmi.core.lesson_status", val);
        _maybeUpdateTitleMgr("cmi.completion_status", __scorm["cmi.completion_status"]);
        return "true";
      }
      if (key === "cmi.completion_status") {
        __scorm["cmi.completion_status"] = val;
        _mirrorStatus2004to12(val);
        _maybeUpdateTitleMgr("cmi.completion_status", val);
        _maybeUpdateTitleMgr("cmi.core.lesson_status", __scorm["cmi.core.lesson_status"]);
        return "true";
      }
      if (key === "cmi.success_status") {
        __scorm["cmi.success_status"] = val;
        _maybeUpdateTitleMgr("cmi.success_status", val);
        return "true";
      }

      // interactions count auto-update
      if (/^cmi\.interactions\.\d+\./.test(key)) {
        var m = key.match(/^cmi\.interactions\.(\d+)\./);
        if (m) {
          var idx = parseInt(m[1],10);
          var cnt = parseInt(__scorm["cmi.interactions._count"] || "0",10);
          if (idx + 1 > cnt) __scorm["cmi.interactions._count"] = String(idx + 1);
        }
        __scorm[key] = val;
        _maybeUpdateTitleMgr(key, val);
        return "true";
      }

      // default: store and update TitleMgr
      __scorm[key] = val;
      _maybeUpdateTitleMgr(key, val);
      return "true";
    } catch(e) { return "true"; }
  };

  // Exponer API objetos clásicos
  window.API = window.API || {
    LMSInitialize: window.LMSInitialize,
    LMSFinish: window.LMSFinish,
    LMSGetValue: window.LMSGetValue,
    LMSSetValue: window.LMSSetValue,
    LMSCommit: window.LMSCommit,
    LMSGetLastError: window.LMSGetLastError,
    LMSGetErrorString: window.LMSGetErrorString,
    LMSGetDiagnostic: window.LMSGetDiagnostic
  };

  window.API_1484_11 = window.API_1484_11 || {
    Initialize: function(){ __initialized = true; return "true"; },
    Terminate: function(){ __initialized = false; return "true"; },
    GetValue: function(e){ return window.LMSGetValue(e); },
    SetValue: function(e,v){ return window.LMSSetValue(e,v); },
    Commit: function(){ return "true"; },
    GetLastError: function(){ return "0"; },
    GetErrorString: function(){ return "No error"; },
    GetDiagnostic: function(){ return "SCORM patched stub"; }
  };

  // Si no existe getTitleMgrHandle, devolver nuestro stub
  if (typeof getTitleMgrHandle !== 'function') {
    window.getTitleMgrHandle = function(){ return __titleMgrStub; };
  }
  // También exponer un pequeño getter para depuración
  window.__scorm_storage = function(){ return JSON.parse(JSON.stringify(__scorm)); };
})(); 
/* ======= FIN SCORM + TitleMgr stub v3 ======= */


var finishCalled = false;
var autoCommit = false;

function MySetValue( lmsVar, lmsVal ) {
  try {
    // primero intentar TitleMgr (si existe)
    try {
      if (typeof getTitleMgrHandle === 'function') {
        var tm = getTitleMgrHandle();
        if (tm && typeof tm.setVariable === 'function') {
          try { tm.setVariable(lmsVar, lmsVal, 0); } catch(e) {}
        }
      }
    } catch(e) {}
    // luego enrutar a la API SCORM (stub)
    try { return LMSSetValue(lmsVar, lmsVal); } catch(e) { return "true"; }
  } catch(e) { return "true"; }
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

