var users=[];
var idTemp=0;
function printUsers()
{
    console.log('printing users');
    for(i=0; i<users.length; i++)
        console.log(JSON.stringify(users[i]));
}
function addUser(user)
{
    iUser={id:user.email, user:user};
    users.push(iUser);
    return iUser.id;
 }
 function deleteUser(user)
 {
    for(i=0;i<users.length;i++)
        if(users[i].id==user.id)
            users.splice(i,1);
 }
 function getNumOfUsers()
 {
     return users.length;
 }
 module.exports = {
     'addUser': addUser,
     'deleteUser': deleteUser,
     'getNumOfUsers':getNumOfUsers
 };




