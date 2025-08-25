/**************************************************
Trivantis (http://www.trivantis.com)
**************************************************/

TTPr.StartInteractions = function( pg )
{
  var intPage = this.findTestPage( pg );
  if( intPage >= 0 && this.arRTPages[intPage].startInteractions() )
    return intPage;

  return -1;
}

TTPr.SetInteraction = function( vn, qidx )
{
  if( qidx >= 0 )
    this.arRTPages[qidx].setInteraction( vn );
}

TTPr.HandleInteractions = function( res, cid, sid, lid, sv, incqt, tmstmp, forcetf ) 
{ 
  var i;

  for( i = 0; i < this.arRTPages.length; i++ )
    this.arRTPages[i].handleInteractions( res, cid, sid, lid, sv, incqt, tmstmp, forcetf);

  return;
}

TPPr.startInteractions = function()
{
  if( this.arQues.length == 1 )
  {
    this.dateInt = new Date();
    this.lIntST = this.dateInt.getTime();
    this.lIntET = 0;
    return true;
  }
  else
  {
    this.dateInt = null;
    this.lIntST = 0;
    this.lIntET = 0;
    return false;
  }
}

TPPr.setInteraction = function( vn )
{
  if( this.lIntST > 0 )
  {
    if( this.arQues.length == 1 &&
        this.arQues[0].varName == vn )
    {
      var lEnd = new Date().getTime();

      this.lIntET += (lEnd - this.lIntST);
      this.lIntST = lEnd;
    }
  }
}

TPPr.handleInteractions = function( res, cid, sid, lid, sv, incqt, tmstmp, forcetf )
{
    var i;

    for ( i = 0; i < this.arQues.length; i++ )
    {
        this.arQues[i].handleInteractions(res, cid, sid, lid, this, sv, incqt, tmstmp, forcetf);
        this.lIntET = 0;
    }
  
    return;
}

function intDateForm( dt, sv, bUTC )
{
  var res = "";
  if( bUTC )
    res += dt.getUTCFullYear();
  else
    res += dt.getFullYear();
  var sep = sv ? "-" : "/";

  res += sep;
  var tmp;
  
  if( bUTC )
    tmp = dt.getUTCMonth() + 1;
  else
    tmp = dt.getMonth() + 1;
  if( tmp < 10 )
    res += "0";
  res += tmp + sep;

  if( bUTC )
    tmp = dt.getUTCDate();
  else
    tmp = dt.getDate();
  if( tmp < 10 )
    res += "0";
  res += tmp;
  return res;
}

function intTimeForm( dt, bDt, bUTC )
{
  var res = "";
  var sep = ":";
  var tmp;

  if( bDt )
  {
    if( bUTC )
      tmp = dt.getUTCHours();
    else
      tmp = dt.getHours();
  }
  else
  {
    tmp = parseInt(dt/3600000, 10);
    dt -= tmp * 3600000;
  }
  if( tmp < 10 )
    res += "0";
  res += tmp + sep;
  if( bDt )
  {
    if( bUTC )
      tmp = dt.getUTCMinutes();
    else
      tmp = dt.getMinutes();
  }
  else
  {
    tmp = parseInt(dt/60000, 10);
    dt -= tmp * 60000;
  }
  if( tmp < 10 )
    res += "0";
  res += tmp + sep;
  if( bDt )
  {
    if( bUTC )
      tmp = dt.getUTCSeconds();
    else
      tmp = dt.getSeconds();
  }
  else
    tmp = parseInt(dt/1000, 10);
  if( tmp < 10 )
    res += "0";
  res += tmp;
    
  if( bUTC )
    res += "Z";
  return res;
}

var letArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

TQPr.handleInteractions = function( res, cid, sid, lid, pg, sv, incqt, tmstmp, forcetf )
{
  if( this.type == jTitleManager.UNK ) return res.str;
  
  var el = ( pg ? pg.lIntET : null );
  var di = ( pg ? pg.dateInt : null );
  var strID = null;
  var strIDSave = null;
  var strTimeID	= null;
  var strType = null;
  var strCorrect = null;
  var strAnswer = null;
  var strResult = null;
  var strLatency = null;
  var dateString = null;
  var timeString = null;
  var strTempAnswer = null;
  var strLikertAns = this.strOurAns + ",";
  var strTempCorrect = null;
  var strTemp = null;
  var strTempCurr = null;
  var strTempChoice = null;
  var posStart = 0;
  var posEnd = 0;
  var bGradeable;
  var maxNum = 1;
  var numChoices = 0;
  var loc;
  var i;
  var i2;
  var numC;
  var numA;
  var bGradeInd = false;
  var iResult;
  var now = new Date();
  var lTime = now.getTime();
  var subIdx;
  var bChSel = false;
  var bChCor = false;

  if( (this.type == jTitleManager.MT || this.type == jTitleManager.DD || this.type == jTitleManager.MC || this.type == jTitleManager.HS || this.type == jTitleManager.MR || this.type == jTitleManager.OR) && this.bGradeInd )
  {
    maxNum = this.arChoices.length;

    bGradeInd = true;

    el /= maxNum;
  }
  else if( this.type == jTitleManager.LK )
  {
    maxNum = this.arStmts.length;
  }

  strID     = (this.name + "_").replace(/['" ~]/g, '_');
  strIDSave = strID;
  
  strTimeID = lTime;

  for( subIdx = 0; subIdx < maxNum; subIdx++ )
  {
    strID = strIDSave;
    bGradeable = true;

    switch( this.type )
    {
      case jTitleManager.TF:
        strType     = "true-false";
        if( forcetf )
        {
          if( this.arChoices.indexOf( this.arCorrAns.join(',') ) == 0 )
            strCorrect = "true";
          else
            strCorrect = "false";

          if( this.arChoices.indexOf( this.strOurAns ) == 0 )
            strAnswer = "true";
          else
            strAnswer = "false";
        }
        else
        {
            strCorrect = this.arCorrAns.join(',').toLowerCase();
            strAnswer = this.strOurAns.toLowerCase();
        }
        strID += this.id;
        break;

      case jTitleManager.LK:
        strType     = "likert";
        strCorrect  = "n/a";
        strAnswer   = strLikertAns;

        numChoices = this.arChoices.length;

        var strStmtPrefix = this.arStmtNms.length > subIdx ? this.arStmtNms[subIdx] : (subIdx + 1).toString();
        strStmtPrefix+="-";
        if( strLikertAns.indexOf( strStmtPrefix ) == 0 )
        {
          strLikertAns = strLikertAns.substring( strStmtPrefix.length, strLikertAns.length );
          for( j = 0; j < numChoices; j++ )
          {
            if( ( this.arChoices[j] == strLikertAns.substring( 0, this.arChoices[j].length ) ) && ( strLikertAns.charAt( this.arChoices[j].length ) == ',' ) )
            {
              strAnswer = this.arChoices[j];
              strLikertAns = strLikertAns.substring( this.arChoices[j].length + 1, strLikertAns.length );
              break;
            }
          }
        }

		if( sv == 2004 )
			strAnswer = this.strAnswer.replace(/ /g, "_");
			
        strID += this.id + "-" + ( subIdx + 1 );
        bGradeable  = false;
        break;
        
      case jTitleManager.OR:
        strType     = "sequencing";
        strCorrect  = "";
        strAnswer   = "";

        numChoices = this.arChoices.length;

        var tempStrOurAns = this.strOurAns.replace(/&#44/g,",");
        strTempAnswer  = addDelimeter( this.arChoices, tempStrOurAns, "|||");
        var tempCorrAns = this.arCorrAns.join(',');
        strTempCorrect = addDelimeter( this.arChoices, tempCorrAns, "|||");

        if( bGradeInd )
        {
          posStart = 0;
          strTempChoice = this.arChoices[subIdx];
          strTemp = "|||" + strTempChoice + "|||";
          for( j = 0; j < numChoices; j++ )
          {
            posEnd = strTempAnswer.indexOf( "|||", posStart+"|||".length );
            if( posEnd != -1 )
              strTempCurr = strTempAnswer.substring( posStart, posEnd+"|||".length );
            else
              strTempCurr = "";
            
            if( strTemp == strTempCurr )
            {
              strAnswer = letArr.charAt(j);
              break;
            }
            posStart = posEnd;
          }

          posStart = 0;
          for( j = 0; j < numChoices; j++ )
          {
            posEnd = strTempCorrect.indexOf( "|||", posStart+"|||".length );
            if( posEnd != -1 )
              strTempCurr = strTempCorrect.substring( posStart, posEnd+"|||".length );
            else
              strTempCurr = "";
            
            if( strTemp == strTempCurr )
            {
              strCorrect = letArr.charAt(j);
              break;
            }
            posStart = posEnd;
          }
        }
        else
        {
          posStart = 0;
          for( j = 0; j < numChoices; j++ )
          {
            posEnd = strTempAnswer.indexOf( "|||", posStart+"|||".length );
            if( posEnd != -1 )
              strTempCurr = strTempAnswer.substring( posStart, posEnd+"|||".length );
            else
              strTempCurr = "";
            
            for( i = 0; i < numChoices; i++ )
            {
              strTempChoice = this.arChoices[i];
              strTemp = "|||" + strTempChoice + "|||";

              if( strTemp == strTempCurr )
              {
                if( strAnswer.length > 0 )
                {
                  if( sv >= 2004 )
                    strAnswer += "[,]";
                  else
                    strAnswer += ",";
                }

                if( sv > 2004 )
                  strAnswer += strTempChoice;
                else
                  strAnswer += letArr.charAt(i);
                break;
              }
            }
            posStart = posEnd;
          }

          posStart = 0;
          for( j = 0; j < numChoices; j++ )
          {
            posEnd = strTempCorrect.indexOf( "|||", posStart+"|||".length );
            if( posEnd != -1 )
              strTempCurr = strTempCorrect.substring( posStart, posEnd+"|||".length );
            else
              strTempCurr = "";
            
            for( i = 0; i < numChoices; i++ )
            {
              strTempChoice = this.arChoices[i];
              strTemp = "|||" + strTempChoice + "|||";

              if( strTemp == strTempCurr )
              {
                if( strCorrect.length > 0 )
                {
                  if( sv >= 2004 )
                    strCorrect += "[,]";
                  else
                    strCorrect += ",";
                }

                if( sv > 2004 )
                  strCorrect += strTempChoice;
                else
                  strCorrect += letArr.charAt(i);
                break;
              }
            }
            posStart = posEnd;
          }
        }

        if( bGradeInd )
          strID += this.id + "-" + ( subIdx + 1 );
        else
          strID += this.id;
        break;
        
      case jTitleManager.MC:
      case jTitleManager.HS:
      case jTitleManager.MR:
        strType = "choice";
        strCorrect  = "";
        strAnswer   = "";

        numChoices = this.arChoices.length;

        var tempStrOurAns = this.strOurAns.replace(/&#44/g,",");
        strTempAnswer  = addDelimeter( this.arChoices, tempStrOurAns, "|||");
        var tempCorrAns = this.arCorrAns.join(',').replace(/&#44/g,",");
        strTempCorrect = addDelimeter( this.arChoices, tempCorrAns, "|||");
   
        if( bGradeInd )
        {
          bChSel = IsChoiceSelected( this.arChoices[subIdx].replace(/,/g,"&#44"), this.strOurAns );
          bChCor = this.isCorrectSub( this.arChoices[subIdx].replace(/,/g,"&#44") );
          if( bChSel )
          {
            if( sv == TINCAN )
              strAnswer += this.arChoices[subIdx];
            else
              strAnswer += letArr.charAt(subIdx);
          }
          else
            strAnswer += "";
          if( bChCor )
          {
            if( sv == TINCAN )
              strCorrect += this.arChoices[subIdx];
            else
              strCorrect += letArr.charAt(subIdx);
          }
        }
        else
        {
          for( i = 0; i < numChoices; i++ )
          {
            strTempChoice = this.arChoices[i];
            strTemp = "|||" + strTempChoice + "|||";
  
            if( strTempCorrect.indexOf( strTemp ) >= 0 )
            {
              if( strCorrect.length > 0 )
              {
                if( this.bAllowMult && sv >= 2004 )
                  strCorrect += "[,]";
                else
                  strCorrect += ",";
              }
                
              if( sv == TINCAN )
                strCorrect += strTempChoice;
              else
                strCorrect += letArr.charAt(i);
            }
  
            if( strTempAnswer.indexOf( strTemp ) >= 0 )
            {
              if( strAnswer.length > 0 )
              {
                if( ( this.bAllowMult || this.type == jTitleManager.OR ) && sv >= 2004 )
                  strAnswer += "[,]";
                else
                  strAnswer += ",";
              }
  
              if( sv == TINCAN )
                strAnswer += strTempChoice;
              else
                strAnswer += letArr.charAt(i);
            }
          }
        }

        if( ( this.bAllowMult || this.type == jTitleManager.OR ) && sv == 0)
        {
          strCorrect = "{" + strCorrect + "}";
          strAnswer  = "{" + strAnswer + "}";
        }

        if( bGradeInd && (this.type == jTitleManager.MC || this.type == jTitleManager.HS || this.type == jTitleManager.MR) )
          strID += this.id + "-" + ( subIdx + 1 );
        else
          strID += this.id;

        strAnswer = strAnswer.toLowerCase();
        strCorrect = strCorrect.toLowerCase();

        break;

      case jTitleManager.FB:
      {
        strType = "fill-in";
        
		var sepRep;
		if( this.bAnyAnswer )
			sepRep = " " + trivstrOr + " ";
		else
			sepRep = " " + trivstrAnd + " ";
		strCorrect = this.arCorrAns.join(sepRep);

        strAnswer = this.strOurAns;
        strID += this.id;
        break;
	  }
      case jTitleManager.NE:
        if( this.arRel.length == 1 && parseInt(this.arRel[0]) == this.EQU )
        {
          strType = "numeric";
          strCorrect = this.arCorrAns[0];
        }
        else
        {
          strType = "fill-in";
          strCorrect = "";
          
		  var sepRep;
		  if( this.bAnyAnswer )
		  	sepRep = " " + trivstrOr + " ";
		  else
			sepRep = " " + trivstrAnd + " ";

          for (var i = 0; i < this.arRel.length; i++) 
          {
            if( i > 0 )
              strCorrect += sepRep;
            
            strCorrect += "(";
            switch (parseInt(this.arRel[i])) 
            {
              case jTitleManager.EQU:    strCorrect += "n == " + this.arCorrAns[i]; break;
              case jTitleManager.BT_INC: strCorrect += "n >= " + this.arCorrAns[i] + " && n <= " + this.arCorrAns[i + 1]; break;
              case jTitleManager.BT_EXC: strCorrect += "n > "  + this.arCorrAns[i] + " && n < "  + this.arCorrAns[i + 1]; break;
              case jTitleManager.GRT:    strCorrect += "n > "  + this.arCorrAns[i]; break;
              case jTitleManager.GTE:    strCorrect += "n >= " + this.arCorrAns[i]; break;
              case jTitleManager.LST:    strCorrect += "n < "  + this.arCorrAns[i]; break;
              case jTitleManager.LSTE:   strCorrect += "n <= " + this.arCorrAns[i]; break;
              case jTitleManager.NEQU:   strCorrect += "n != " + this.arCorrAns[i]; break;
            }
            strCorrect += ")";
          }
        }
        
        strAnswer = this.strOurAns;
        strID += this.id;
        break;

      case jTitleManager.SA:
      case jTitleManager.ES:
        strType = "fill-in";
        strCorrect = "n/a";
        strAnswer = this.strOurAns;
        strID += this.id;
        bGradeable = false;
        break;

      case jTitleManager.MT:
      case jTitleManager.DD:
        strType   = "matching";
        strAnswer = "";
        strCorrect = "";
        var oArr  = this.strOurAns.length > 0 ? this.strOurAns.split(",") : [];
              
        if( bGradeInd )
        {
          if( this.arCorrAns.length <= subIdx && 
              oArr.length <= subIdx )
              continue;
              
          if( sv == TINCAN )
          {
            strTemp = "0-0";
            if( this.arCorrAns.length > subIdx )
				strTemp = this.arCorrAns[subIdx].join("[.]");
			strTemp = strTemp.replace( /\|/g, "[,]" );
			
            strCorrect += strTemp;
              
            strTemp = "0-0";
            if( oArr.length > subIdx )
              strTemp = oArr[subIdx];
			  
			strTemp = strTemp.replace( /-/g, "[.]" );
			strTemp = strTemp.replace( /\|/g, "[,]" );
			
            strAnswer = strTemp;
          } 
          else
          {
            if( subIdx < this.arCorrAns.length )
              strCorrect = ( subIdx + 1 );
            else
              strCorrect = "0";
              
            if( sv >= 2004 )
              strCorrect += "[.]";
            else
              strCorrect += ".";

            if( subIdx < this.arCorrAns.length )
              strCorrect += letArr.charAt(subIdx);
            else
              strCorrect += "0";

            strTemp = "";
            if( oArr.length > subIdx )
            {
              strTemp = oArr[subIdx];
              
              strAnswer = ( subIdx + 1 );
              if( sv >= 2004 )
                strAnswer += "[.]";
              else
                strAnswer += ".";
            
              loc = strTemp.indexOf('-');
              if( loc >= 0 )
              {
                strTemp = strTemp.substring( loc+1 );
              
                for( i = 0; i < this.arAddedInfo.length; i++ )
                {
                  if( this.arAddedInfo[i] == strTemp )
                  {
                    strAnswer += letArr.charAt(i);
                    break;
                  }
                }
              
                if( i >= this.arAddedInfo.length )
                  strAnswer += "0";
              }
            }
          }
          strID += this.id + "-" + ( subIdx + 1 );
        }
        else
        {
          if( sv > 0 )
          {
            strCorrect = "";
            strAnswer = "";
          }
          else
          {
            strCorrect = "{";
            strAnswer = "{";
          }

          for( i = 0; i < this.arCorrAns.length; i++ )
          {
            if( i > 0 )
            {
              if( sv >= 2004 )
                strCorrect += "[,]";
              else
                strCorrect += ",";
            }
         
            if( sv == TINCAN )
            {
              strTemp = this.arCorrAns[i].join("[.]");
			  strTemp = strTemp.replace( /\|/g, "[,]" );
			  
			  strCorrect += strTemp
            } 
            else
            {
              strTemp = ( i + 1 );
              if( sv >= 2004 )
                strTemp += "[.]";
              else
                strTemp += ".";
              
              strTemp += letArr.charAt(i);
              strCorrect += strTemp;
            }
          }

          
          for( i = 0; i < oArr.length; i++ )
          {
            if( i > 0 )
            {
              if( sv >= 2004 )
                strAnswer  += "[,]";
              else
                strAnswer += ",";
            }
         
            if( sv == TINCAN )
            {
              strTemp = oArr[i];
              strTemp = strTemp.replace( /-/g, "[.]" );
			  strTemp = strTemp.replace( /\|/g, "[,]" );
			  
			  strAnswer += strTemp;
            } 
            else
            {
              loc = oArr[i].indexOf('-');
              if( loc >= 0 )
              {
                strTempChoice = oArr[i].substring( loc+1 );
                strTemp       = oArr[i].substring( 0, loc );
              
                for( i2 = 0; i2 < this.arChoices.length; i2++ )
                {
                  if( this.arChoices[i2] == strTemp )
                  {
                    strAnswer += (i2 + 1);
                    break;
                  }
                }
                if( i2 >= this.arChoices.length )
                  strAnswer += "0";

                if( sv >= 2004 )
                  strAnswer += "[.]";
                else
                  strAnswer += ".";
                  
                for( i2 = 0; i2 < this.arAddedInfo.length; i2++ )
                {
                  if( this.arAddedInfo[i2] == strTempChoice )
                  {
                    strAnswer += letArr.charAt(i2);
                    break;
                  }
                }
                if( i2 >= this.arAddedInfo.length )
                  strAnswer += "0";
              }
            }
          }

          if( sv == 0 )
          {
            strCorrect += "}";
            strAnswer += "}";
          }
 
          strID += this.id;
        }
        break;

      default:
        strType     = "";
        strCorrect  = "";
        strAnswer   = "";
        break;
    }
    
    if( this.bSurvey )
    {
      if( this.type == jTitleManager.TF )
      {
        if( sv >= 2004 )
          strCorrect = "true";
        else
          strCorrect = "t";
      }
      else if( this.type == jTitleManager.MC || this.type == jTitleManager.HS || this.type == jTitleManager.MR )
        strCorrect = "a";
      else
        strCorrect = "n/a";
      bGradeable = false;
    }

    if ( tmstmp )
    {	
        strID += "_";
        strID += strTimeID;
    }
	
    if( bGradeable )
    {
      if( bGradeInd ) 
      {
        if( this.type == jTitleManager.MC || this.type == jTitleManager.HS || this.type == jTitleManager.MR )
        {
		
          if( (bChSel && bChCor) || (!bChSel && !bChCor) )
            iResult = 1;
          else
            iResult = 0;
        }
        else if( this.type == jTitleManager.OR )
        {
          if( strAnswer == strCorrect )
            iResult = 1;
          else
            iResult = 0;
        }
        else
        {
          var strQNum = '0-0';
          
          if( this.arCorrAns.length > subIdx )
		  {
			 if ( typeof this.arCorrAns[subIdx] == 'string' )
				strQNum = this.arCorrAns[subIdx].substring( 0, this.arCorrAns[subIdx].indexOf( '-' ) );
			 else 
				strQNum = this.arCorrAns[subIdx][0];
		  }
          strTemp = GetMatchingPairStr( strQNum, this.strOurAns );
          iResult = this.isCorrectSub( strTemp );
        }
      }
      else
        iResult = this.isCorrect();

      if( iResult != 0 )
        strResult = "correct";
      else
      {
        if( sv >= 2004 )
          strResult = "incorrect";
        else
          strResult = "wrong";
      }
    }
    else
      strResult = "neutral";

    if( di != null )
    { 
      if( sv >= 2004 )
      {
        timeString = intDateForm( di, 1, (sv == TINCAN) );
        timeString += "T";
        timeString += intTimeForm( di, 1, (sv == TINCAN) );
      }
      else
        timeString = intTimeForm( di, 1, (sv == TINCAN) );
      dateString = intDateForm( di, 0, (sv == TINCAN) );
    }
    else
    {
      var nowDateString = intDateForm( now, 0, (sv == TINCAN) );
      var nowTimeString;

      if( sv >= 2004 )
      {
        nowTimeString = intDateForm( now, 1, (sv == TINCAN) );
        nowTimeString += "T";
        nowTimeString += intTimeForm( now, 1, (sv == TINCAN) );
      }
      else
        nowTimeString = intTimeForm( now, 1, (sv == TINCAN) );
      timeString = nowTimeString;
      dateString = nowDateString;
    }

    if( di == null )
      strLatency = "";
    else
      strLatency = intTimeForm( el, 0, (sv == TINCAN) );
    
	if(bGradeInd && strCorrect.length == 0)
	  strCorrect = "";
    else if( strCorrect == null || strCorrect.length == 0 )
    {
      if( this.type == jTitleManager.MC || this.type == jTitleManager.HS || this.type == jTitleManager.MR )
            strCorrect = "a";
      else 
            strCorrect = "n/a";
    }
	
    strCorrect = convJS( strCorrect );

    
    if( strAnswer != null && strAnswer.length > 0)
    {
      strAnswer = convJS( strAnswer );
    }
    
    strQText = null;
    if( incqt )
    {
      if( this.type == jTitleManager.LK )
        strQText = this.arStmts[subIdx];
      else
        strQText = this.text;

      if( strQText != null && strQText.length > 0)
        strQText = convJS( strQText );
    }

    if( sv > 0 )
    {
      arChoicesTemp = new Array();
      if( bGradeInd )
        arChoicesTemp.push( this.arChoices[subIdx] );
      else
        arChoicesTemp = this.arChoices;

      putSCORMInteractions( strID, null, timeString, strType, strCorrect, this.weight, strAnswer, strResult, strLatency, strQText, arChoicesTemp, this.arCorrAns, this, pg );
    }
    else
    {
      if( res.str.length == 0 )
      {
        res.add( "\"course_id\",\"student_id\",\"lesson_id\",\"date\",\"time\",\"interaction_id\",\"objective_id\",\"type_interaction\",\"correct_response\",\"student_response\",\"result\",\"weighting\",\"latency\"" );
        if( incqt )
          res.add( ",\"text\"" );
        res.add( "\n" );
      }
      res.add( "\"" + cid + "\"," );
      res.add( "\"" + sid + "\"," );
      res.add( "\"" + lid + "\"," );
      res.add( "\"" + dateString + "\"," );
      res.add( "\"" + timeString + "\"," );
      res.add( "\"" + strID + "\"," );
      res.add( "\"" + "\"," );
      res.add( "\"" + strType + "\"," );
      res.add( "\"" + strCorrect + "\"," );
      res.add( "\"" + strAnswer + "\"," );
      res.add( "\"" + strResult + "\"," );
      res.add( "\"" + this.weight + "\"," );
      res.add( "\"" + strLatency + "\""  );
      if( incqt )
        res.add( ",\"" + strQText + "\"" );
      res.add( "\n" );
    }
  }

  return res.str;
}

function addDelimeter( arCh, strAns, del )
{
  var retVar = "";
  if( strAns != null && strAns != "" )
  {
    var strTmpChoice = "";
    var str = "," + strAns + ",";

    var arChOff = new Array();
    for( var i=0; i<arCh.length; i++ )
    {
      strTmpChoice = "," + arCh[i] + ",";
      loc = str.indexOf(strTmpChoice);
      arChOff.push(loc);
    }
    var arChOrder = new Array();
    var low;
    do {
      low = -1;
      for( var i=0; i<arChOff.length; i++ )
      {
        if( arChOff[i] != -1 )
        {
          if( low == -1 || arChOff[i] < arChOff[low] )
            low = i;
        }
      }
      if( low != -1 )
      {
        arChOrder.push(low);
        arChOff[low] = -1;
      }
    } while( low != -1 );
    for( var i=0; i<arChOrder.length; i++ )
    {
      retVar += del;
      retVar += arCh[arChOrder[i]];
    }
    if( arChOrder.length > 0 )
      retVar += del;
  }
  return retVar;
}
