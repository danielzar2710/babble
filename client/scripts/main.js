window.Babble={};
window.Babble.register=register;
window.Babble.getMessages=getMessages;
window.Babble.getStats=getStats;
window.Babble.postMessage=postMessage;
window.Babble.deleteMessage=deleteMessage;
	window.onbeforeunload = function(event) {
	var xhttp = new XMLHttpRequest();
		xhttp.open("DELETE", "http://localhost:9000/user", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({id:JSON.parse(localStorage.getItem('babble')).userInfo.email}));
};
	window.onload=function() { 
		if(localStorage.getItem('babble') === null){
			var div=document.createElement("div");
			var div_shady=document.createElement("div");
			var body = document.getElementsByTagName("body")[0]; 
			body.appendChild(div_shady);
			body.appendChild(div);
			div.className="register_div";
			div_shady.className="shadyBackground";
			div.innerHTML = `
			<div class="register_div">
				<h2>Who are you?</h2>
				<form class="register_form">
					<label for="fullnameID" class="registerText registerText--fullName">Full Name:</label>
							<input id="fullnameID" type="text" class="registerTextInput registerTextInput--top" >
							<label for="emailID" class="registerText registerText--email">Email:</label> 
							<input id="emailID" type="text" class="registerTextInput registerTextInput--bottom" >
							<input type="button" class="registerButton registerButton--anonimus" value="Stay Anonymus" onclick="anonimusRegister()">
							<input type="button" class="registerButton registerButton--save" value="Save" onclick="getRegisterFormData()">
				</form>
			</div>
		  `; 					
		}
		else
		{
			var babble=JSON.parse(localStorage.getItem("babble"));
			if(babble)
			{
				register(babble.userInfo);
				getMessages(parseFloat(babble),getMessageCallBack);
				getStats(getStatsCallBack);
			}
		}	
}; 
window.onresize=changeFormArea;
	function getMessages(counter,getMessageCallBack)
	{
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(xhttp.readyState === 4 && xhttp.status === 200) 
				getMessageCallBack(JSON.parse(xhttp.responseText));
		}
		xhttp.ontimeout=function(){
			var babble=JSON.parse(localStorage.getItem("babble"));
			getMessages(parseFloat(babble.currentMessage),getMessageCallBack);
		}
		xhttp.timeout = 12000;
		var uri="http://localhost:9000/messages?counter="+counter;
		xhttp.open("GET",uri, true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send();
	}
	function getMessageCallBack(responseText)
	{
			var updates=(responseText);
			var babble=JSON.parse(localStorage.getItem("babble"));
			if(Array.isArray(updates))
			{
				for(i=0;i<updates.length;i++)
					createMessageDOM(updates[i]);
				babble.currentMessage=''+updates[updates.length-1].id;
			}
			else{
				createMessageDOM(updates);
				babble.currentMessage=''+updates.id;
			}
			localStorage.setItem("babble",JSON.stringify(babble));

			getMessages(parseFloat(babble.currentMessage),getMessageCallBack);
		
	};

	function sendFunction()
	{
		var user1=JSON.parse(localStorage.getItem('babble')).userInfo;
		var textbox=document.getElementsByTagName('TEXTAREA');
		var textmessage = document.createTextNode(textbox[0].value);
		var date=new Date();
		var timeNow=""+date.getHours()+":";
		var minutes=date.getMinutes();
		if(minutes<10)
			timeNow+="0"+minutes;
		else
			timeNow+=""+minutes;
		if(textbox[0].value.length>0)
		{	
			var mes={
				name:user1.name,
				email:user1.email,
			 	message: textbox[0].value,
				timestamp:timeNow
			};

			textbox[0].value="";
			growableChangeDom();
			postMessage(mes,postMessageCallBack);
		}
	}
	function createMessageDOM(message)
	{
		if(document.getElementById(message.id)==null)
		{
			var d = new Date();
			var p=document.createElement("p");
			p.className="messageContent";
			var textmessage = document.createTextNode(message.message.message);
			p.appendChild(textmessage);
			var username=message.message.name;
			var art=document.createElement("ARTICLE");
			var timeSent=document.createElement("TIME");
			timeSent.setAttribute("datetime", Date.now());
			var timeNow=message.message.timestamp;
			timeSent.innerHTML = timeNow;
			var headingCite=document.createElement("CITE");
			if(username=="")
				username="Anonymus"
			var userNickname = document.createTextNode(username);
			headingCite.appendChild(userNickname);
			art.appendChild(headingCite);
			art.appendChild(timeSent);
			if(message.message.name==JSON.parse(localStorage.getItem("babble")).userInfo.name)
			{
				var btn=document.createElement("BUTTON");
				btn.className ="x_button";
				btn.innerHTML="x";
				btn.setAttribute( "onClick", "deleteMessage(this.parentNode.parentNode.id,deleteMessageCallBack);" );
				btn.style.visibility="hidden";
				btn.tabIndex="0";
				art.appendChild(btn);
			}
			art.appendChild(p);
			var img=document.createElement("IMG");			
			if(message.message.email=="")
				img.src="images/anon.png";
			else
				img.src="https://s.gravatar.com/avatar/"+MD5(""+message.message.email);
			img.className="profile_Pic";
			img.alt="";
			var listItem=document.createElement("LI");
			listItem.appendChild(img);
			listItem.appendChild(art);
			listItem.id=message.id;
			listItem.tabIndex="0";
			listItem.addEventListener("focus",  function(){messageHover(idNum)}, true);
			var idNum=listItem.id;
			art.addEventListener("mouseover", function(){messageHover(idNum)});
			art.addEventListener("mouseout", function(){messageNoHover(idNum)});
			
			var orderedList = document.getElementsByTagName("OL")[0];
			if(orderedList)
				orderedList.appendChild(listItem);
		}
	}
	function postMessage(message,postMessageCallBack)
	{
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "http://localhost:9000/messages", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.onreadystatechange=function(){
			if (this.readyState == 4 && this.status == 200) {
				postMessageCallBack(JSON.parse(xhttp.response));
			}
		};
		xhttp.send(JSON.stringify(message));
	}
	function postMessageCallBack(xhttp){return 0;}

	function deleteMessage(id,deleteMessageCallBack)
	{
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				deleteMessageCallBack(JSON.parse(xhttp.response));
			}
		};
		var uri="http://localhost:9000/messages/"+id;
		xhttp.open("DELETE", uri, true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send();
	}
	
	function deleteMessageCallBack(response)
	{ 
		var id=response.id;
		var x=document.getElementById(id);
		x.parentNode.removeChild(x);
	}
	function messageHover(id)
	{
		var message=document.getElementById(id);
		message.getElementsByTagName("ARTICLE")[0].style.backgroundColor= "#ECEEED";
		if(message.getElementsByTagName("BUTTON").length>0)
			message.getElementsByTagName("BUTTON")[0].style.visibility="visible";
	}

	function messageNoHover(id)
	{
		var message=document.getElementById(id);
		message.getElementsByTagName("ARTICLE")[0].style.backgroundColor= "white";
		if(message.getElementsByTagName("BUTTON").length>0)
			message.getElementsByTagName("BUTTON")[0].style.visibility="hidden";
	}
	function getRegisterFormData()
	{
		var y = document.getElementsByClassName("register_form")[0].elements;
		if(y[0].value.length>0 && y[1].value.length>0)
		{
			var userInfo={
				name: y[0].value,
				email: y[1].value
			}
			register(userInfo);
		}	
	}
	function anonimusRegister()
	{
		var userInfo={
			name: "",
			email: ""
		}
		register(userInfo);
	}
	function register(user)
	{
		var babble;
		if(user&&user.name&&user.email)
		{
			babble= { 
				currentMessage:'0',
				userInfo:{ 
					name: user.name,
					email: user.email
					} 
				};
		}
		else{
			babble= { 
				currentMessage:'0',
				userInfo:{ 
					name: '',
					email: ''
					} 
				};
		 }
		
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			localStorage.setItem('babble',JSON.stringify(babble));
			if (this.readyState == 4 && this.status == 200) {
				var dat=JSON.parse(xhttp.responseText);
				var x = document.getElementsByClassName('register_div')[0];
				var x_shady=document.getElementsByClassName('shadyBackground')[0];
				if(x)
					x.parentNode.removeChild(x);
				if(x_shady)
					x_shady.parentNode.removeChild(x_shady);
				var pData=document.getElementsByClassName("statData");
					pData[1].innerHTML=dat.messages;
					pData[0].innerHTML=dat.users;
				
				getMessages(JSON.parse(localStorage.getItem('babble')).currentMessage ,getMessageCallBack);
				getStats(getStatsCallBack);
			}
		};
		xhttp.open("POST", "http://localhost:9000/user", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify(user));
		
	}
	function getStats(getStatsCallBack)
	{
		var xhttp=new XMLHttpRequest();
		xhttp.onreadystatechange=function(){
			if (this.readyState == 4 && this.status == 200) 
				getStatsCallBack(JSON.parse(xhttp.response));
		}
		xhttp.timeout=120000;
		xhttp.ontimeout=function()
		{
			getStats(getStatsCallBack);
		}
		xhttp.open("GET","http://localhost:9000/stats", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send();
	}
	function getStatsCallBack(xhttp)
	{
		var data=xhttp;
		var pData=document.getElementsByClassName("statData");
		if(pData&&data&&pData[1])
		{
			pData[1].innerHTML=data.messages;
			pData[0].innerHTML=data.users;
		}
		getStats(getStatsCallBack);
	}
	makeGrowable();
	function makeGrowable() {
		
		var area = document.getElementsByTagName('textarea')[0];
		if(area)
			area.addEventListener('input', function(e) {
				growableChangeDom();
			
			});
	}
	function growableChangeDom()
	{
		var area = document.getElementsByTagName('textarea')[0];
		var clone = document.getElementsByTagName('span')[0];
		clone.textContent = area.value;
		var ol=document.getElementsByTagName('OL')[0];
		var main=document.getElementsByTagName('MAIN')[0];
		var dl=document.getElementsByTagName('DL')[0];
		var h1=main.childNodes[1];
		var textarea=document.getElementsByTagName('DIV')[1];
		var height1=main.clientHeight-textarea.clientHeight-h1.clientHeight;
		var pixVal=(textarea.clientHeight-0.135*(main.clientHeight*1.0));
		if(pixVal<0)
			pixVal=0;
		var olPixVal=main.clientHeight*0.11+pixVal;
		h1.style.top=""+pixVal+"px";
		ol.style.top="calc("+pixVal+"px + 11%)";
		dl.style.top=""+pixVal+"px";
		var specialDiv=document.getElementsByClassName("backgroundInstall")[0];
		specialDiv.style.minHeight=''+textarea.clientHeight+'px';
	}
	function changeFormArea()
	{
		var div = document.getElementsByClassName("Growable")[0];
		var button = document.getElementsByClassName("send")[0];
		var main=document.getElementsByTagName('MAIN')[0];
		var width = div.offsetWidth;
		var width1 = button.offsetWidth;
		var width2=main.offsetWidth;
		var res=((width1*1.0)/width2)*100.0+8;
		div.style.marginRight=res+"%";

	}
///////////////////////////////////////////////
///////////////md5
	 function MD5 (string) {
		
		   function RotateLeft(lValue, iShiftBits) {
				   return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		   }
		   function AddUnsigned(lX,lY) {
				   var lX4,lY4,lX8,lY8,lResult;
				   lX8 = (lX & 0x80000000);
				   lY8 = (lY & 0x80000000);
				   lX4 = (lX & 0x40000000);
				   lY4 = (lY & 0x40000000);
				   lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
				   if (lX4 & lY4) {
						   return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
				   }
				   if (lX4 | lY4) {
						   if (lResult & 0x40000000) {
								   return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
						   } else {
								   return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
						   }
				   } else {
						   return (lResult ^ lX8 ^ lY8);
				   }
		   }
		
		   function F(x,y,z) { return (x & y) | ((~x) & z); }
		   function G(x,y,z) { return (x & z) | (y & (~z)); }
		   function H(x,y,z) { return (x ^ y ^ z); }
		   function I(x,y,z) { return (y ^ (x | (~z))); }
		
		   function FF(a,b,c,d,x,s,ac) {
				   a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
				   return AddUnsigned(RotateLeft(a, s), b);
		   };
		
		   function GG(a,b,c,d,x,s,ac) {
				   a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
				   return AddUnsigned(RotateLeft(a, s), b);
		   };
		
		   function HH(a,b,c,d,x,s,ac) {
				   a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
				   return AddUnsigned(RotateLeft(a, s), b);
		   };
		
		   function II(a,b,c,d,x,s,ac) {
				   a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
				   return AddUnsigned(RotateLeft(a, s), b);
		   };
		
		   function ConvertToWordArray(string) {
				   var lWordCount;
				   var lMessageLength = string.length;
				   var lNumberOfWords_temp1=lMessageLength + 8;
				   var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
				   var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
				   var lWordArray=Array(lNumberOfWords-1);
				   var lBytePosition = 0;
				   var lByteCount = 0;
				   while ( lByteCount < lMessageLength ) {
						   lWordCount = (lByteCount-(lByteCount % 4))/4;
						   lBytePosition = (lByteCount % 4)*8;
						   lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
						   lByteCount++;
				   }
				   lWordCount = (lByteCount-(lByteCount % 4))/4;
				   lBytePosition = (lByteCount % 4)*8;
				   lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
				   lWordArray[lNumberOfWords-2] = lMessageLength<<3;
				   lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
				   return lWordArray;
		   };
		
		   function WordToHex(lValue) {
				   var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
				   for (lCount = 0;lCount<=3;lCount++) {
						   lByte = (lValue>>>(lCount*8)) & 255;
						   WordToHexValue_temp = "0" + lByte.toString(16);
						   WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
				   }
				   return WordToHexValue;
		   };
		
		   function Utf8Encode(string) {
				   string = string.replace(/\r\n/g,"\n");
				   var utftext = "";
		
				   for (var n = 0; n < string.length; n++) {
		
						   var c = string.charCodeAt(n);
		
						   if (c < 128) {
								   utftext += String.fromCharCode(c);
						   }
						   else if((c > 127) && (c < 2048)) {
								   utftext += String.fromCharCode((c >> 6) | 192);
								   utftext += String.fromCharCode((c & 63) | 128);
						   }
						   else {
								   utftext += String.fromCharCode((c >> 12) | 224);
								   utftext += String.fromCharCode(((c >> 6) & 63) | 128);
								   utftext += String.fromCharCode((c & 63) | 128);
						   }
		
				   }
		
				   return utftext;
		   };
		
		   var x=Array();
		   var k,AA,BB,CC,DD,a,b,c,d;
		   var S11=7, S12=12, S13=17, S14=22;
		   var S21=5, S22=9 , S23=14, S24=20;
		   var S31=4, S32=11, S33=16, S34=23;
		   var S41=6, S42=10, S43=15, S44=21;
		
		   string = Utf8Encode(string);
		
		   x = ConvertToWordArray(string);
		
		   a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
		
		   for (k=0;k<x.length;k+=16) {
				   AA=a; BB=b; CC=c; DD=d;
				   a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
				   d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
				   c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
				   b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
				   a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
				   d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
				   c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
				   b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
				   a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
				   d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
				   c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
				   b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
				   a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
				   d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
				   c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
				   b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
				   a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
				   d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
				   c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
				   b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
				   a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
				   d=GG(d,a,b,c,x[k+10],S22,0x2441453);
				   c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
				   b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
				   a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
				   d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
				   c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
				   b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
				   a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
				   d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
				   c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
				   b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
				   a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
				   d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
				   c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
				   b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
				   a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
				   d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
				   c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
				   b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
				   a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
				   d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
				   c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
				   b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
				   a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
				   d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
				   c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
				   b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
				   a=II(a,b,c,d,x[k+0], S41,0xF4292244);
				   d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
				   c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
				   b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
				   a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
				   d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
				   c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
				   b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
				   a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
				   d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
				   c=II(c,d,a,b,x[k+6], S43,0xA3014314);
				   b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
				   a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
				   d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
				   c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
				   b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
				   a=AddUnsigned(a,AA);
				   b=AddUnsigned(b,BB);
				   c=AddUnsigned(c,CC);
				   d=AddUnsigned(d,DD);
				   }
		
			   var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
		
			   return temp.toLowerCase();
		}