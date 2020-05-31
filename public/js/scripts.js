function yourName(){
  var name = prompt("What is your name?");
  if (!name){
    alert('Anda harus mengisi nama anda!');
    return yourName();
  }
  name = name.replace(/<(.|\n)*?>/g, '').trim();
  return name;
}

$(function(){

var $server_status = $("#status");
var $notif = $("#notif");
var $myID = $("#myID");
var $connect = $("#connect");
var $send = $("#send");
var $user_id = $("#user_id");
var $msg = $("#msg");

$user_id.on('change',function(){
  $msg.focus();
})

var socket = io();

var yourID;
var userName = null;

var userNotif = '<audio src="sounds/user.mp3" style="display: none" id="userNotif"></audio>';
var msgNotif = '<audio src="sounds/msg.mp3" style="display: none" id="msgNotif"></audio>';

$("#notification").append(userNotif);
$("#notification").append(msgNotif);

$send.on('click',function(){
  var msg = $msg.val();
  msg = msg.replace(/<(.|\n)*?>/g, '').trim();
  var user = $user_id.val();
  socket.emit('send_notif', {
    user_id: user,
    msg: msg
  });
  $msg.val('');
  $msg.focus();
  $notif.scrollTop($notif.prop("scrollHeight"));
})

$msg.on('keyup',function(e){
  var code = e.keyCode || e.which;
   if(code == 13) {
     var msg = $msg.val();
     var user = $user_id.val();
     socket.emit('send_notif', {
       user_id: user,
       msg: msg
     });
     $msg.val('');
     $msg.focus();
     $notif.scrollTop($notif.prop("scrollHeight"));
   }
})

socket.on('connect',(data)=>{
  if (userName==null) {
    userName = yourName();
  }
  socket.emit('changeID', userName);
  $server_status.html('<span style="color: green;font-size: 0.8em">Terhubung!</span>');
});

socket.on('disconnect',(data)=>{
  $server_status.html('<span style="color: red;font-size: 0.8em">Tidak Terhubung!</span>');
});

socket.on('user_join',(data)=>{
  $notif.append('<p class="user-status"><em>'+data+' sedang bergabung</em></p>');
  $("#userNotif").trigger('pause');
  $("#userNotif").trigger('play');
  $notif.scrollTop($notif.prop("scrollHeight"));
});

socket.on('user_leave',(data)=>{
  if (data.name!='') {
    $notif.append('<p class="user-status"><em>'+data.name+' meninggalkan obrolan</em></p>');
    $notif.scrollTop($notif.prop("scrollHeight"));
  }
});

socket.on('getID',(data)=>{
  yourID = data;
});
socket.on('id_changed',(data)=>{
  $("#username").text('Selamat Datang, '+data);
});

socket.on('list_user',(data)=>{
  var opt='<option value="">Semua User</option>';
  data.forEach(function(v){
    if (v.id!=yourID && v.name!='') {
      opt+='<option value="'+v.id+'">'+v.name+'</option>';
    }
  });

  $user_id.html(opt);
});

socket.on('msg',(data)=>{
  if (yourID == data.id) {
    if (data.user_id!='') {
      var msg = '<p style="text-align: right; color: blue">Anda ke '+data.user_id.name+': '+data.msg+'</p>';
    } else {
      var msg = '<p style="text-align: right; color: blue">Anda: '+data.msg+'</p>';
    }
  }else{
    var msg = '<p style="color: green">'+data.name+': '+data.msg+'</p>';
    $("#msgNotif").trigger('pause');
    $("#msgNotif").trigger('play');
  }
  $notif.append(msg);
  $notif.scrollTop($notif.prop("scrollHeight"));
});

})
