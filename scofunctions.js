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

/* ======= SCORM PATCH: lightweight in-memory stub (no tracking) =======
   Objetivo: ejecutar como HTML normal y permitir lectura/escritura de score.
   - Sólo se define si NO existen funciones LMS* reales.
   - No persiste datos (sin localStorage/cookies).
======================================================================= */
(function(){
  if (typeof window.LMSInitialize !== "function") {
    var __scormInitialized = false;
    var __scorm = {
      // Valores por defecto útiles para muchos cursos
      "cmi.core.lesson_status": "not attempted",
      "cmi.core.lesson_mode": "normal",
      "cmi.core.credit": "credit",
      "cmi.core.score.raw": "",
      "cmi.core.score.max": "",
      "cmi.core.score.min": "",
      "cmi.interactions._count": "0",
      // SCORM 2004 mirrors (por si el contenido los usa)
      "cmi.completion_status": "unknown",
      "cmi.mode": "normal",
      "cmi.credit": "credit",
      "cmi.score.raw": "",
      "cmi.score.max": "",
      "cmi.score.min": ""
    };

    function updateInteractionsCount(key){
      var m = key && key.match(/^cmi\.interactions\.(\d+)\./);
      if (m) {
        var idx = parseInt(m[1], 10);
        var cnt = parseInt(__scorm["cmi.interactions._count"] || "0", 10);
        if (idx + 1 > cnt) __scorm["cmi.interactions._count"] = String(idx + 1);
      }
    }

    window.LMSInitialize = function(){ __scormInitialized = true; return "true"; };
    window.LMSIsInitialized = function(){ return __scormInitialized; };
    window.LMSFinish = function(){ __scormInitialized = false; return "true"; };
    window.LMSCommit = function(){ return "true"; };
    window.LMSGetLastError = function(){ return "0"; };
    window.LMSGetErrorString = function(){ return "No error"; };
    window.LMSGetDiagnostic = function(){ return "SCORM patched: in-memory stub"; };

    window.LMSGetValue = function(element){
      // Soporta tanto 1.2 como 2004 para score
      if (element === "cmi.score.raw") return __scorm["cmi.score.raw"];
      if (element === "cmi.score.max") return __scorm["cmi.score.max"];
      if (element === "cmi.score.min") return __scorm["cmi.score.min"];
      return (element in __scorm) ? __scorm[element] : "";
    };

    window.LMSSetValue = function(element, value){
      // Espejo de score 1.2 <-> 2004
      if (element === "cmi.score.raw") { __scorm["cmi.score.raw"] = String(value); __scorm["cmi.core.score.raw"] = String(value); return "true"; }
      if (element === "cmi.score.max") { __scorm["cmi.score.max"] = String(value); __scorm["cmi.core.score.max"] = String(value); return "true"; }
      if (element === "cmi.score.min") { __scorm["cmi.score.min"] = String(value); __scorm["cmi.core.score.min"] = String(value); return "true"; }
      __scorm[element] = String(value);
      updateInteractionsCount(element);
      return "true";
    };
  }

  // Stubs seguros por si faltan utilidades del runtime Trivantis
  if (typeof window.readVariable !== "function") {
    window.readVariable = function(name, defaultVal){ return defaultVal; };
  }
  if (typeof window.saveVariable !== "function") {
    window.saveVariable = function(name, value){};
  }
  if (typeof window.getTitleMgrHandle !== "function") {
    window.getTitleMgrHandle = function(){ return null; };
  }
})();
/* ======= FIN SCORM PATCH ======= */


var finishCalled = false;
var autoCommit = false;

function MySetValue( lmsVar, lmsVal ) {
  // Patched: no TitleMgr writes; sólo se enruta a LMSSetValue (stub)
  try { return LMSSetValue( lmsVar, lmsVal ); } catch(e) { return "true"; }
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

