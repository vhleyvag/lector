/******************************************************************************
** 
** INICIO DEL PARCHE - FALSA API DE SCORM para HTML estándar
** Este bloque de código simula un LMS para que el curso funcione sin él.
** Se encarga de almacenar y recuperar datos como la puntuación localmente.
**
*******************************************************************************/

// Objeto que actuará como nuestra base de datos en memoria.
var lmsData = {
    "cmi.core.lesson_status": "not attempted",
    "cmi.core.student_name": "Usuario de Prueba",
    "cmi.core.lesson_mode": "normal",
    "cmi.core.score.raw": "0",
    "cmi.interactions._count": "0"
    // Otros valores se agregarán dinámicamente según lo necesite el curso.
};

// Variable para rastrear si la comunicación se ha "iniciado".
var lmsInitialized = false;

function LMSInitialize(param) {
    console.log("LMSInitialize: Conexión con el LMS simulado.");
    lmsInitialized = true;
    return "true";
}

function LMSFinish(param) {
    console.log("LMSFinish: Desconexión del LMS simulado.");
    lmsInitialized = false;
    return "true";
}

function LMSGetValue(variable) {
    console.log("LMSGetValue: Obteniendo '" + variable + "' = '" + lmsData[variable] + "'");
    if (lmsData[variable] !== undefined) {
        return lmsData[variable];
    }
    // SCORM espera una cadena vacía para variables no encontradas.
    return "";
}

function LMSSetValue(variable, value) {
    console.log("LMSSetValue: Estableciendo '" + variable + "' = '" + value + "'");
    lmsData[variable] = value;
    // Manejar el conteo de interacciones, que es un caso común.
    if (variable.indexOf('cmi.interactions') > -1 && variable.indexOf('id') > -1) {
        var newCount = parseInt(lmsData["cmi.interactions._count"], 10) + 1;
        lmsData["cmi.interactions._count"] = newCount.toString();
    }
    return "true";
}

function LMSCommit(param) {
    console.log("LMSCommit: Guardando datos en el LMS simulado.");
    // En un LMS real, esto guarda en el servidor. Aquí no hace nada.
    return "true";
}

function LMSGetLastError() {
    return "0";
}

function LMSGetErrorString(errorCode) {
    return "No Error";
}

function LMSGetDiagnostic(errorCode) {
    return "No Diagnostic";
}

// Función auxiliar para verificar si el LMS está "inicializado"
function LMSIsInitialized() {
    return lmsInitialized;
}


/*******************************************************************************
** 
** FIN DEL PARCHE - FALSA API DE SCORM
** -----------------------------------------------------------------------------
** INICIO DEL CÓDIGO ORIGINAL de SCOFunctions.js
** El siguiente código es el original de tu archivo y no necesita ser modificado,
** ya que ahora llamará a nuestras funciones falsas de la API de arriba.
**
*******************************************************************************/
var finishCalled = false;
var autoCommit = false;

function MySetValue( lmsVar, lmsVal ) {
  var titleMgr = getTitleMgrHandle();
  if( titleMgr ) titleMgr.setVariable(lmsVar,lmsVal,0)
  LMSSetValue( lmsVar, lmsVal )
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