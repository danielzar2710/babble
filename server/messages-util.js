var messages = [];
var imessages=[];
var idTemp;
var nameTemp;
var currentId=0;
function printAll()
{
    var text='';
    var text1='';
    for(i=0;i<messages.length;i++)
    {
        text1+=','+JSON.stringify(imessages[i]);
        text+=','+JSON.stringify(messages[i]);
    }
    console.log(text);
}
 function addMessage(message)
 {
     currentId++;
     imessage={'id':currentId,'message':message};
     imessages.push(imessage);
     messages.push(message);
     return currentId;
 }
 function deleteMessage(id)
 {
    var length=imessages.length;
    for(i=0;i<length;i++)
        if(imessages[i].id==id)
        {
            imessages.splice(i,1);
            messages.splice(i,1);
            break;
        }    
 }
 function getMessages(counter)
 {
    return messages.slice(counter, messages.length);               
 }
 function getMessages1(counter)
 {
        var length=imessages.length;
        while((length--) > -1)
            if(length < 0|| imessages[length].id <= counter)
                return imessages.slice(length+1, imessages.length);      
 }
 function getNumOfMessages()
 {
     return messages.length;
 }
 module.exports = {
     'addMessage': addMessage,
     'getMessages': getMessages,
     'deleteMessage': deleteMessage,
     'getNumOfMessages':getNumOfMessages,
     'getMessages1':getMessages1,
 };
