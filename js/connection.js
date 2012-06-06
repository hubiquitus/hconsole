/*
 * Copyright (c) Novedia Group 2012.
 *
 *     This file is part of Hubiquitus.
 *
 *     Hubiquitus is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Hubiquitus is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with Hubiquitus.  If not, see <http://www.gnu.org/licenses/>.
 */
var headersPersisted = {};
var participantsPersisted = {};
var participant
var publicCounter = 0;
var participantCounter = 0;
var idRow = null;
var currentOwner = null;
var current = [];
var channels = new Channels();

var minimumRaised = false;

var idRetrived = null;
var descRetrived = null;
var priorityRetrived = null;
var priorityConverted = null; 
var locationBuilt = null;
var longRetrived = null;
var latRetrived = null;
var zipRetrived = null;
var hostRetrived = null;
var ownerRetrived = null;
var participantBuilt = [];
var activeRetrived = null;
var headerBuilt = [];
var hKeyRetrieved = null;
var hValueRetrieved = null;

var status = '';
var error = '';

var idGetChann = null;
var idCreateUpdateChann = null;

var hOptions = {
    serverHost: "localhost",
    serverPort: "",
    transport: "socketio",
    // endpoints: ["http://192.168.2.104:5280/http-bind"] BOSH
    // endpoints: ["http://hub.novediagroup.com:5280/http-bind"]
    endpoints: ["http://hub.novediagroup.com:8080/"]
    // endpoints: ["http://192.168.2.104:8080/"] 
};

setTimeout(function(){
    hClient.connect("u1@hub.novediagroup.com","u1",hCallback,hOptions);
    // hClient.connect("u1@localhost","u1",hCallback,hOptions);
},3000);

function getChannels(){
    var commandGetChann = {
        entity : 'hnode.' + hClient.domain,
        cmd : 'hgetchannels',
        params : ""
    };
    
    idGetChann = hClient.command(commandGetChann);
}

function createUpdateChannel(theChannel){
    // console.log(theChannel);
    var commandCreateUpdateChann = {
        entity : 'hnode.' + hClient.domain,
        cmd : 'hcreateupdatechannel',
        params : theChannel
    };
    
    idCreateUpdateChann = hClient.command(commandCreateUpdateChann);
}

function conversePriorityToCode(priority){
    switch(priority){
        case "trace" :
            return 0;
            break;
        case "info" :
            return 1;
            break; 
        case "warning" :
            return 2;
            break; 
        case "alert" :
            return 3;
            break; 
        case "critical" :
            return 4;
            break; 
        case "panic" :
            return 5;
            break;    
    }
}

function conversePriorityToString(priority){
    switch(priority){
        case 0 :
            return "trace";
            break;
        case 1 :
            return "info";
            break; 
        case 2 :
            return "warning";
            break; 
        case 3 :
            return "alert";
            break; 
        case 4 :
            return "critical";
            break; 
        case 5 :
            return "panic";
            break;    
    }
}

function testRadio(radio){
    for (var i=0; i<radio.length;i++) {
        if (radio[i].checked) {
            activeRetrived = radio[i].value;
        }
    }
    activeRetrived = activeRetrived == "true" ? true : false;
}

function populateForm(channelToEdit){
    console.log("Le formulaire va etre rempli avec l'objet suivant :");
    console.log(channelToEdit);

    var id = channelToEdit.chid;
    var desc = channelToEdit.chdesc;
    var priority = conversePriorityToString(channelToEdit.priority); 
    var lng = "";
    var lat = "";
    var zip = "";

    if(channelToEdit.location!="undefined"){
        lng = channelToEdit.location.lng;
        lat = channelToEdit.location.lat;
        zip = channelToEdit.location.zip;
    }

    var host = channelToEdit.host;
    var owner = channelToEdit.owner;

    /*var participants = "";
    for(var i=0; i< channelToEdit.participants.length; i++){
        channelToEdit.participants[i] = channelToEdit.participants[i].replace(/ *///g,"");
        /*participants += channelToEdit.participants[i];
        if(channelToEdit.participants[i+1])
            participants += ", ";
    }*/

    for(var i = 0; i< channelToEdit.participants.length; i++){
        if(i==(channelToEdit.participants.length-1)){
            participantPopulateForm(channelToEdit.participants[i], i+1, true);
        }else{
            participantPopulateForm(channelToEdit.participants[i], i+1, false);
        }    
    }

    var active = channelToEdit.active;

    for(var i = 0; i < channelToEdit.headers.length; i++){
        if(i==(channelToEdit.headers.length-1))
        {
            headerPopulateForm(channelToEdit.headers[i].hKey, channelToEdit.headers[i].hValue, i+1,true);
        }else{
            headerPopulateForm(channelToEdit.headers[i].hKey, channelToEdit.headers[i].hValue, i+1,false);
        }
    }

    /*console.log("ID "+id);
    console.log("DESC "+desc);
    console.log("PRIORITY " +priority);
    console.log("LONG "+lng);
    console.log("LAT "+lat);
    console.log("ZIP "+zip);
    console.log("HOST "+host);
    console.log("OWNER "+owner);
    console.log("PARTICIPANTS ")
    console.log(participants);
    console.log("ACTIVE "+active);
    console.log("HEADERS "+headers);*/


    $("#tr_id td input").attr("value", id);
    $("#tr_id td input").attr("disabled", "disabled");

    $("#tr_host td input").attr("value", host);
    $("#tr_host td input").attr("disabled", "disabled");

    $("#tr_owner td input").attr("value", owner);
    $("#tr_owner td input").attr("disabled", "disabled");

    $("#tr_desc td textarea").attr("value", desc);

    for(var i =0; i<document.getElementsByTagName("option").length; i++){
        if(document.getElementsByTagName("option")[i].value == priority){
            document.getElementsByTagName("option")[i].setAttribute("selected", true);
        }
    }

    $("#tr_location td input#longitude").attr("value", lng);
    $("#tr_location td input#latitude").attr("value", lat);
    $("#tr_location td input#zip").attr("value", zip);
    
    for(var i =0; i<document.getElementById("tr_active").getElementsByTagName("input").length; i++){
        if(document.getElementById("tr_active").getElementsByTagName("input")[i].value == ''+active){
            document.getElementById("tr_active").getElementsByTagName("input")[i].setAttribute("checked", "checked");
        }
    }   
}

function participantPopulateForm(theParticipant,index,last){
    if(index==1){
        $("#jid_participant"+index).attr("value",theParticipant);
        $("#deleteParticipant"+index).css("display","inline");
        $("#addParticipant"+index).attr("disabled","disabled");
        $("#jid_participant"+index).attr("disabled","disabled");
    }else{
        var new_div = jQuery ('<div id="participant'+index+'"></div>');
        $("#participants_input").append(new_div);

        var participantInput = document.createElement("input");
        participantInput.id = "jid_participant"+index;  
        participantInput.type = "text"; 
        participantInput.size = 22; 
        participantInput.value = theParticipant;
        $("#participant"+index).append(participantInput);
        
        $("#participant"+index).append(" ");

        var addInput = document.createElement("input"); 
        addInput.id = "addParticipant"+index;
        addInput.type = "button";
        addInput.value = "A";
        addInput.setAttribute("disabled", "disabled");
        $("#participant"+index).append(addInput); 

        $("#participant"+index).append(" ");

        var deleteInput = document.createElement("input"); 
        deleteInput.id = "deleteParticipant"+index;
        deleteInput.type = "button";
        deleteInput.value = "X";
        deleteInput.setAttribute("onClick","deleteInputs(this)");
        $("#participant"+index).append(deleteInput); 
        
        $("#participants_input input:#jid_participant"+index).attr("disabled","disabled");
        $("#participants_input input:#addParticipant"+index).attr("disabled","disabled");
    }

    if(last==true){
        addParticipantInput(index);
    }

    participantsPersisted[index] = $("#jid_participant"+index).val();
}

function headerPopulateForm(key,value,index,last){
    if(index==1){
        $("#key"+index).attr("value",key);
        $("#value"+index).attr("value",value);
        $("#deleteHeader"+index).css("display", "inline");
        $("#addHeader"+index).attr("disabled","disabled");
        $("#key"+index).attr("disabled","disabled");
        $("#value"+index).attr("disabled","disabled");
    }else{
        var new_div = jQuery ('<div id="header'+index+'"></div>');
        $("#header_inputs").append(new_div);

        var keyInput = document.createElement("input"); 
        keyInput.type = "text";
        keyInput.id = "key"+index;  
        keyInput.size = 2; 
        keyInput.value = key;
        $("#header"+index).append("hkey : ");
        $("#header"+index).append(keyInput);
        
        var valueInput = document.createElement("input"); 
        valueInput.type = "text"; 
        valueInput.id = "value"+index;
        valueInput.size = 2;  
        valueInput.value = value;
        $("#header"+index).append(" hvalue : ");
        $("#header"+index).append(valueInput);  

        $("#header"+index).append(" ");

        var addInput = document.createElement("input"); 
        addInput.id = "addHeader"+index;
        addInput.type = "button";
        addInput.value = "A";
        addInput.setAttribute("disabled", "disabled");
        $("#header"+index).append(addInput); 

        $("#header"+index).append(" ");

        var deleteInput = document.createElement("input"); 
        deleteInput.id = "deleteHeader"+index;
        deleteInput.type = "button";
        deleteInput.value = "X";
        deleteInput.setAttribute("onClick","deleteInputs(this)");
        $("#header"+index).append(deleteInput); 

        $("#header_inputs input:#key"+index).attr("disabled","disabled");
        $("#header_inputs input:#value"+index).attr("disabled","disabled");
        $("#header_inputs input:#addHeader"+index).attr("disabled","disabled");
    }
    if(last==true){
        addHeaderInputs(index);
    }

    //Persist objets into a var
    headersPersisted[index] = {
        hKey:$("#key"+index).val(),
        hValue: $("#value"+index).val()
    }
}

function addHeaderInputs(counter) {
    //Avoid the user to delete any header
    $("#deleteHeader"+counter).css("display", "inline");
    
    //Update compteurs
    if(publicCounter != counter)
        publicCounter = counter;
    publicCounter++;

    //Persist objets into a var
    headersPersisted[counter] = {
        hKey:$("#key"+counter).val(),
        hValue: $("#value"+counter).val()
    }

    //Avoid headers edition.
    $("#header_inputs input:#key"+counter).attr("disabled","disabled");
    $("#header_inputs input:#value"+counter).attr("disabled","disabled");
    $("#header_inputs input:#addHeader"+counter).attr("disabled","disabled");

    var new_div = jQuery ('<div id="header'+publicCounter+'"></div>');
    $("#header_inputs").append(new_div);

    var keyInput = document.createElement("input"); 
    keyInput.type = "text";
    keyInput.id = "key"+publicCounter;  
    keyInput.size = 2; 
    $("#header"+publicCounter).append("hkey : ");
    $("#header"+publicCounter).append(keyInput);
    
    var valueInput = document.createElement("input"); 
    valueInput.type = "text"; 
    valueInput.id = "value"+publicCounter;
    valueInput.size = 2;  
    $("#header"+publicCounter).append(" hvalue : ");
    $("#header"+publicCounter).append(valueInput);  

    $("#header"+publicCounter).append(" ");

    var addInput = document.createElement("input"); 
    addInput.id = "addHeader"+publicCounter;
    addInput.type = "button";
    addInput.value = "A";
    addInput.setAttribute("onClick","addHeaderInputs(publicCounter)")
    $("#header"+publicCounter).append(addInput); 

    $("#header"+publicCounter).append(" ");

    var deleteInput = document.createElement("input"); 
    deleteInput.id = "deleteHeader"+publicCounter;
    deleteInput.type = "button";
    deleteInput.value = "X";
    deleteInput.setAttribute("style","display:none");
    deleteInput.setAttribute("onClick","deleteInputs(this)");
    $("#header"+publicCounter).append(deleteInput); 
} 

function addParticipantInput(counter){
    $("#deleteParticipant"+counter).css("display", "inline");

    if(participantCounter != counter)
        participantCounter = counter;
    participantCounter++;

    $("#participants_input input:#jid_participant"+counter).attr("disabled","disabled");
    $("#participants_input input:#addParticipant"+counter).attr("disabled","disabled");

    var new_div = jQuery ('<div id="participant'+participantCounter+'"></div>');
    $("#participants_input").append(new_div);

    var participantInput = document.createElement("input");
    participantInput.id = "jid_participant"+participantCounter;  
    participantInput.type = "text"; 
    participantInput.size = 22; 
    $("#participant"+participantCounter).append(participantInput);
    
    $("#participant"+participantCounter).append(" ");

    var addInput = document.createElement("input"); 
    addInput.id = "addParticipant"+participantCounter;
    addInput.type = "button";
    addInput.value = "A";
    addInput.setAttribute("onClick","addParticipantInput(participantCounter)")
    $("#participant"+participantCounter).append(addInput); 

    $("#participant"+participantCounter).append(" ");

    var deleteInput = document.createElement("input"); 
    deleteInput.id = "deleteParticipant"+participantCounter;
    deleteInput.type = "button";
    deleteInput.value = "X";
    deleteInput.setAttribute("style","display:none");
    deleteInput.setAttribute("onClick","deleteInputs(this)");
    $("#participant"+participantCounter).append(deleteInput); 

    //Persist element into an object !!! TODO
    participantsPersisted[counter] = $("#jid_participant"+counter).val();
}

function deleteInputs(inputToDelete){
    var whichOne = inputToDelete.id.indexOf("deleteHeader");
    var identifier = null;
    if(whichOne != -1){
        console.log("DELETE ONE HEADER");
        identifier = inputToDelete.id.replace("deleteHeader","");

        $("#header"+identifier).remove();
        
        delete headersPersisted[identifier];
    }else if(whichOne == -1){
        console.log("DELETE ONE PARTICIPANT");
        identifier = inputToDelete.id.replace("deleteParticipant","")

        $("#participant"+identifier).remove();

        delete participantsPersisted[identifier];
    }   
}

function retrieveForm(){
    headerBuilt = [];
    participantBuilt = [];

    idRetrived = document.getElementById("chid").value;
    descRetrived = document.getElementById('chdesc').value;
    priorityRetrived = document.getElementById('priority').value; 
            
    longRetrived = document.getElementById('longitude').value;
    latRetrived = document.getElementById('latitude').value;
    zipRetrived = document.getElementById('zip').value;

    hostRetrived = document.getElementById('host').value;
    ownerRetrived = document.getElementById('owner').value;

    for(var attr in participantsPersisted){
        if(participantsPersisted.hasOwnProperty(attr))
            participantBuilt.push(participantsPersisted[attr]);
    }
    
    priorityConverted = conversePriorityToCode(priorityRetrived);
    locationBuilt = {lng:longRetrived, lat:latRetrived, zip:zipRetrived};

    for(var attr in headersPersisted){
        if(headersPersisted.hasOwnProperty(attr))
            headerBuilt.push(headersPersisted[attr]);
    }

    headersPersisted = {};
    participantsPersisted = {};
}

function editCollection(newChan){
    channels.get(newChan.id).attributes = newChan;
}

function hCallback(msg){
   // console.log(JSON.stringify(msg));
    if(msg.type == 'hStatus'){
        switch(msg.data.status){
            case hClient.status.CONNECTED:
                status = 'Connected';
                $(document).trigger('connected');
                getChannels();
                currentOwner = hClient.publisher;

                break;
            case hClient.status.CONNECTING:
                status = 'Connecting';
                break;
            case hClient.status.REATTACHING:
                status = 'Reattaching';
                break;
            case hClient.status.REATTACHED:
                status = 'Reattached';
                $(document).trigger('reattached');
                getChannels();
                currentOwner = hClient.publisher;
                break;
            case hClient.status.DISCONNECTING:
                status = 'Disconnecting';
                break;
            case hClient.status.DISCONNECTED:
                status = 'Disconnected';
                break;
        }

        switch(msg.data.errorCode){
            case hClient.errors.NO_ERROR:
                error = 'No Error Detected';
                break;
            case hClient.errors.JID_MALFORMAT:
                error = 'JID Malformat';
                break;
            case hClient.errors.CONN_TIMEOUT:
                error = 'Connection timed out';
                break;
            case hClient.errors.AUTH_FAILED:
                error = 'Authentication failed';
                break;
            case hClient.errors.ATTACH_FAILED:
                error = 'Attach failed';
                break;
            case hClient.errors.ALREADY_CONNECTED:
                error = 'A connection is already opened';
                break;
            case hClient.errors.TECH_ERROR:
                error = 'Technical Error: ';
                error += msg.data.errorMsg;
                break;
            case hClient.errors.NOT_CONNECTED:
                error = 'Not connected';
                break;
            case hClient.errors.CONN_PROGRESS:
                error = 'A connection is already in progress';
                break;
        }

        //Couleurs des status
        if(status == 'Connected' || status == 'Reattached'){
            $("#status").removeClass(function() {
              return $("#status").prev().attr('class');
            });
            $("#status").addClass("green");
            document.getElementById("status").innerHTML = JSON.stringify("Status : "+ status + ' / <span id=error>' + error + '</span>');
        }
        if(status == 'Connecting' || status == 'Reattaching' || status == 'Disconnecting'){
            $("#status").removeClass(function() {
              return $("#status").prev().attr('class');
            });
            $("#status").addClass("orange");
            document.getElementById("status").innerHTML = JSON.stringify("Status : "+ status + ' / <span id=error>' + error + '</span>');
        }
        if(status == 'Disconnected'){
            $("#status").removeClass(function() {
              return $("#status").prev().attr('class');
            });
            $("#status").addClass("red");
            document.getElementById("status").innerHTML = JSON.stringify("Status : "+ status + ' / <span id=error>' + error + '</span>');
        }
        if(error == 'No Error Detected'){
            $("#error").removeClass(function() {
              return $("#error").prev().attr('class');
            });
            $("#error").addClass("green");
        }else{
            $("#error").removeClass(function() {
              return $("#error").prev().attr('class');
            });
            $("#error").addClass("red");
        }
    }
    else if (msg.type == 'hResult'){
        if(msg.data.reqid == idGetChann){
            var result = msg.data.result;

            for(var i =0; i < result.length; i++){
                result[i].id = result[i].chid;
                channels.add(result[i]);
            }
            console.log("All Channels retrieved !");
            listChannelView.setCollection(channels);
        }else{
            if(msg.data.status == 0){
                $(document).trigger('createUpdate');
                console.log("Channel created & persisted !");
            }else{
                console.log("ERROR !!!" + msg.data.status)
            }
        }
    }
}