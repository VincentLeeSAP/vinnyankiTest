sap.ui.controller("ankioverdrive.anki", {
	
	speed: 0,
	speedMod: 10,
	boost: false,
	boostTimer: 0,
	self: null,
	steeringActive: false,
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf ankicontroller.anki
	 */
	onInit: function() {
		groupID = this.checkForFieldInUri("groupID");
		self = this;
		
		setInterval(this.applySteering, 500);
		
	},

	//Prepare messages for websocket interaction with nodeJS application	
	//stop cars
	onStop: function(evt) {
		self.getView().byId("slider").setValue(0);
		
		msg = JSON.stringify({
			"msgType": "UPDATE_S",
			"macAddress": carId,
			"deviceName": carName,
			"deviceType": "AnkiCar",
			"groupId": groupID,
			"param": "command",
			"value": "e",
			"valueDimension": "na"
		});
		ws.send(msg);
	},
	
	
	// change speed / acceleration of cars
	onChangeSpeed: function(evt) {
		source = evt.getSource().getId();
		// var speed;
		//check, whether source is slider or a button to speed up/down
		if (source == "idanki2--slider") {
			this.speed = evt.getSource().getValue();
		} 
		// else {
		// 	this.speed = sap.ui.getCore().byId("idanki2--slider").getValue();
		// 	if (source == "idanki2--speedUp") {
		// 		this.speed = this.speed + 10;
		// 	} else if (source == "idanki2--speedDown") {
		// 		this.speed = this.speed - 10;
		// 	}
		// 	sap.ui.getCore().byId("idanki2--slider").setValue(this.speed);
		// }

		// this.speed = this.speed * this.speedMod;
		msg = JSON.stringify({
			"msgType": "UPDATE_S",
			"macAddress": carId,
			"deviceName": carName,
			"deviceType": "AnkiCar",
			"groupId": groupID,
			"param": "command",
			"value": "s " + this.speed * this.speedMod,
			"valueDimension": "na"
		});

		ws.send(msg);
	},
	
	changeSteering: function(evt){
		
		self.steeringActive = true;
		
		this.applySteering();
		
		setTimeout(this.applySteering, 150);

	},
	
	applySteering: function(){
		if(self.steeringActive){
			var direction = self.getView().byId("sliderSteering").getValue();
			if(direction === 1){
				if (offset >= 68) {
					offset = 67;
				} else {
					if (offset + 17 <= 68){
						offset = offset + 17;
					}else{
						offset = 67;
					}
					
				}
			}else if(direction === -1){
				if (offset <= 68) {
					offset = -67;
				} else {
					if (offset - 17 >= 68){
						offset = offset - 17;
					}else{
						offset = -67;
					}
				}
			}
			
			//send JSON strings to MQTT broker
			msg = JSON.stringify({
				"msgType": "UPDATE_S",
				"macAddress": carId,
				"deviceName": carName,
				"deviceType": "AnkiCar",
				"groupId": groupID,
				"param": "command",
				"value": "c " + offset,
				"valueDimension": "na"
			});
			console.log(msg)
			ws.send(msg);
		}
	},
	
	resetSteering: function(){
		self.steeringActive = false;
		self.getView().byId("sliderSteering").setValue(0);
	},
	
	//change the lanes of cars 
	// onChangeLane: function(evt) {
	// 	source = evt.getSource().getId();
	// 	if (source == "idanki2--right") {
	// 		if (offset <= -68) {
	// 			offset = -67;
	// 		} else {
	// 			offset = offset + 9;
	// 		}
	// 	} else {
	// 		if (offset >= 68) {
	// 			offset = 67;
	// 		} else {
	// 			offset = offset - 9;
	// 		}
	// 	}

	// 	// console.log(offset);
	// 	//send JSON strings to MQTT broker
	// 	msg = JSON.stringify({
	// 		"msgType": "UPDATE_S",
	// 		"macAddress": carId,
	// 		"deviceName": carName,
	// 		"deviceType": "AnkiCar",
	// 		"groupId": groupID,
	// 		"param": "command",
	// 		"value": "c " + offset,
	// 		"valueDimension": "na"
	// 	});
	// 	ws.send(msg);
	// },
	
	pressBoost: function(){
		
		
		msg = JSON.stringify({
			"msgType": "UPDATE_S",
			"macAddress": carId,
			"deviceName": carName,
			"deviceType": "AnkiCar",
			"groupId": groupID,
			"param": "command",
			"value": "s " + "1500",
			"valueDimension": "na"
		});

		ws.send(msg);
		
		self.getView().byId("boost").setEnabled(false);
		
		setTimeout(function(){

			msg = JSON.stringify({
				"msgType": "UPDATE_S",
				"macAddress": carId,
				"deviceName": carName,
				"deviceType": "AnkiCar",
				"groupId": groupID,
				"param": "command",
				"value": "s " + self.speed * self.speedMod,
				"valueDimension": "na"
			});
			
			ws.send(msg);
			
			setTimeout(function(){
				self.getView().byId("boost").setEnabled(true);
			}, 15000)
		}, 1000);
		
	},

	// //change layout, when slider state is changed
	// onChangeSwitch: function(evt) {
	// 	var state = evt.getSource().getState();
	// 	//enable/disable motion sensing
	// 	if (state == true) {
	// 		enableControls(false);
	// 		//enable motion events
	// 		if (window.DeviceOrientationEvent) {
	// 			window.addEventListener('deviceorientation', handleOrientation, false);
	// 		} else {
	// 			sap.ui.getCore().byId("idanki2--deviceMotion").setText("Device Orientation is not supported");
	// 		}
	// 	} else {
	// 		enableControls(true);
	// 		sap.ui.getCore().byId("idanki2--slider").setValue(45);
	// 		if (window.DeviceOrientationEvent) {
	// 			window.removeEventListener('deviceorientation', handleOrientation);
	// 		}
	// 	}
	// },

	//change view when clicking back to selection screen
	onNavBack: function(evt) {
		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: new sap.m.Text({
				text: 'Are you sure you want to exit the game?'
			}),
			beginButton: new sap.m.Button({
				text: 'Cancel',
				press: function() {
					dialog.close();
				}
			}),
			endButton: new sap.m.Button({
				text: 'Submit',
				press: function() {
					msg = JSON.stringify({
						"msgType": "UPDATE_S",
						"macAddress": carId,
						"deviceName": carName,
						"deviceType": "AnkiCar",
						"groupId": groupID,
						"param": "command",
						"value": "e",
						"valueDimension": "na"
					});
					ws.send(msg);
					// app.to(page1);
					dialog.close();
					location.reload();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});
		dialog.open();
	},

	//change displayed text
	setTextValues: function(pCarId, pCarName, pUserName) {
		carId = pCarId;
		carName = pCarName;
		sap.ui.getCore().byId("idanki2--carName").setText(pCarName);
		// sap.ui.getCore().byId("idanki2--carId").setText(pCarId);
		sap.ui.getCore().byId("idanki2--player").setText("Name: " + pUserName);
		sap.ui.getCore().byId("idanki2--groupID").setText(groupID);
		
		var tile = self.getView().byId("controllerCarImage");
		if (tile){
			tile.destroy();
		}
		tile = new sap.m.CustomTile("controllerCarImage").addStyleClass(carName);
		self.getView().byId("leftColumn").addItem(tile);
		
	},

	checkForFieldInUri: function(fieldToCheck) {
		var complete_url = window.location.href;

		if (complete_url.indexOf("groupID") == -1)
			return undefined;

		var pieces = complete_url.split("?");
		var params = pieces[1].split("&");
		var that = this;
		var result;

		$.each(params, function(key, value) {
			var param_value = value.split("=");
			if (param_value[0] === fieldToCheck)
				result = param_value[1];
		});

		return result;
	}
});

var speed = 0;
var offset = 0;
var carId, carName, groupID;

//handle orientation events for motion sensing
function handleOrientation(evt) {
	var orientation = evt.gamma; //orientation from -90 to 90 degrees
	if (orientation < 0) {
		sap.ui.getCore().byId("idanki2--deviceMotion").setText("Please turn your device by 180 degrees to enable motion control").addStyleClass(
			"red");
	} else {
		if (speed != Math.round((90 - orientation) / 9)) {
			speed = Math.round((90 - orientation) / 9);
			value = "s " + Math.round((90 - orientation) * (400 / 90) + 250);
			sap.ui.getCore().byId("idanki2--speed").setText(value);
			//sap.ui.getCore().byId("idanki1--update").setText(value);
			msg = JSON.stringify({
				"msgType": "UPDATE_S",
				"macAddress": carId,
				"deviceName": carName,
				"deviceType": "AnkiCar",
				"groupId": groupID,
				"param": "command",
				"value": value,
				"valueDimension": "na"
			});
			ws.send(msg);
		}
		//speed = Math.round((90 - orientation)/9);
		//sap.ui.getCore().byId("idanki1--orientation").setText(speed);	
		sap.ui.getCore().byId("idanki2--slider").setValue(Math.round(90 - orientation));
		//send message after rotation equals ten
	}
}

//method for enabling/disabling serveral controls
function enableControls(evt) {
	sap.ui.getCore().byId("idanki2--slider").setEnabled(evt);
	sap.ui.getCore().byId("idanki2--speedUp").setEnabled(evt);
	sap.ui.getCore().byId("idanki2--speedDown").setEnabled(evt);
}