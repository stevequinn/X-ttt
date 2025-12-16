const crypto = require("crypto");

// ----	--------------------------------------------	--------------------------------------------
// ----	--------------------------------------------	--------------------------------------------

// Construct a message object
// @param text:string - message text
// @param from:string - sender name
// @param from_uuid:string - sender uuid
// @returns {{text:string, date:number, from:string, from_uuid:string}}
function msg(text, from, from_uuid) {
  return {
    date: Date.now(),
    text: text,
    from: from,
    from_uuid: from_uuid
  };
}

// New player has joined
function onNewPlayer(data) {

	util.log("New player has joined: "+data.name);

	// Create a new player
	var newPlayer = new Player(crypto.randomUUID(), data.name, "looking");
	newPlayer.sockid = this.id;

	this.player = newPlayer;

	// Add new player to the players array
	players.push(newPlayer);
	players_avail.push(newPlayer);

	// util.log("looking for pair - uid:"+newPlayer.uid + " ("+newPlayer.name + ")");

	pair_avail_players();

	// updAdmin("looking for pair - uid:"+p.uid + " ("+p.name + ")");

	// updAdmin("new player connected - uid:"+data.uid + " - "+data.name);

};

// ----	--------------------------------------------	--------------------------------------------	

function pair_avail_players() {

	if (players_avail.length < 2)
		return;


	var p1 = players_avail.shift();
	var p2 = players_avail.shift();

	p1.mode = 'm';
	p2.mode = 's';
	p1.status = 'paired';
	p2.status = 'paired';
	p1.opp = p2;
	p2.opp = p1;

	//util.log("connect_new_players p1: "+util.inspect(p1, { showHidden: true, depth: 3, colors: true }));

	// io.sockets.connected[p1.sockid].emit("pair_players", {opp: {name:p2.name, uid:p2.uid}, mode:'m'});
	// io.sockets.connected[p2.sockid].emit("pair_players", {opp: {name:p1.name, uid:p1.uid}, mode:'s'});
	io.to(p1.sockid).emit("pair_players", {opp: {name:p2.name, uid:p2.uid}, mode:'m'});
	io.to(p2.sockid).emit("pair_players", {opp: {name:p1.name, uid:p1.uid}, mode:'s'});

	util.log("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");
	// updAdmin("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");

	// Welcome messages
	io.to(p1.sockid).emit("opp_msg", { ...msg(p2.name + " entered the chat", "System", "system"), is_mine: false });
	io.to(p2.sockid).emit("opp_msg", { ...msg(p1.name + " entered the chat", "System", "system"), is_mine: false });
};

// ----	--------------------------------------------	--------------------------------------------	

function onTurn(data) {
	//util.log("onGameLoadedS with qgid: "+data.qgid);

	io.to(this.player.opp.sockid).emit("opp_turn", {cell_id: data.cell_id});

	util.log("turn  --  usr:"+this.player.mode + " - :"+this.player.name + "  --  cell_id:"+data.cell_id);
	// updAdmin("Q answer - game - qgid:"+data.qgid + "  --  usr:"+this.player.mode + " - uid:"+this.player.uid + "  --  qnum:"+data.qnum + "  --  ans:"+data.ansnum);
};

function onMsg(data) {
  const msgData = msg(data.msg, this.player.name, this.player.uid);
  // Send message to opponent but also self to confirm sending
  if (this.player.opp){
    io.to(this.player.opp.sockid).emit("opp_msg", { ...msgData, is_mine: false });
  }
  io.to(this.player.sockid).emit("opp_msg", { ...msgData, is_mine: true });
  util.log("msg --  usr:" + this.player.mode + " - :" + this.player.name + "  --  msg:" + msgData.text);
}

// Socket client has disconnected
function onClientDisconnect() {
	// util.log("onClientDisconnect: "+this.id);


	var removePlayer = this.player;
	players.splice(players.indexOf(removePlayer), 1);
	players_avail.splice(players_avail.indexOf(removePlayer), 1);


	if (this.status == "admin") {
		util.log("Admin has disconnected: "+this.uid);
//		updAdmin("Admin has disconnected - uid:"+this.uid + "  --  "+this.name);
	} else {
		util.log("Player has disconnected: "+this.id);
		
		// Alert the other player that his opponent has disconnected by sending them a message.
		if (this.player.opp) {
		  const goodbyeMsg = msg(this.player.name + " has disconnected.", "System", "system");
			io.to(this.player.opp.sockid).emit("opp_msg", goodbyeMsg);
		}
//		updAdmin("player disconnected - uid:"+removePlayer.uid + "  --  "+removePlayer.name);
	}

};

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

set_game_sock_handlers = function (socket) {

	// util.log("New game player has connected: "+socket.id);

	socket.on("new player", onNewPlayer);

	socket.on("ply_turn", onTurn);
	
	socket.on("ply_msg", onMsg);

	socket.on("disconnect", onClientDisconnect);

};
