//Party Handler
var group = ["Woodro", "Heawon", "Leslie"];

setInterval(function () {
    if (character.name == group[0]) {
        for (let i = 1; i < group.length; i++) {
            let name = group[i];
            send_party_invite(name);
        }
    } else {
        if (character.party) {
            if (character.party != group[0]) {
                parent.socket.emit("party", {event: "leave"})
            }
        } else {
            send_party_request(group[0]);
        }
    }
}, 1000 * 10);

function on_party_request(name) {
    console.log("Party Request");
    if (group.indexOf(name) != -1) {
        accept_party_request(name);
    }
}
function on_party_invite(name) {
    console.log("Party Invite");
    if (group.indexOf(name) != -1) {
        accept_party_invite(name);
    }
}

//Send Items to merchant if in range of character
setInterval(function ()
{
    let items = parent.character.items
    let player = get_player("Woegraf");
    if (player == null) return;
    if (player.visible == null) return;
    for(let i = 2; i < 40; i++) {
        if ((items[i]) != null) {
			      send_item(player, i, 1);
            send_gold(player, 10000000);
        }
    }
}, 1000);

//Party Handler
setInterval(function() {
	accept_party_invite("Woodro");
	send_party_invite("Woodro");
}, 1000*60);

//Toggle for allowing the combat part of the code to execute whilst running.
var attack_mode = true
function combatScript(){
  var Woodro = get_player("Woodro");
	var Leslie = get_player("Leslie");
	if (character.hp / character.max_hp < 0.70 || character.mp / character.max_mp < 0.50)  {
		heal(character)
	    }
	loot();

	//Healing the party
	var WoodCHP = (get_player("Woodro").hp);
	var WoodMHP = (get_player("Woodro").max_hp);
  var LesCHP = (get_player("Leslie").hp);
	var LesMHP = (get_player("Leslie").max_hp);
	    if (WoodCHP / WoodMHP < 0.90) {
		   heal(Woodro);
	    }
	    else if (LesCHP / LesMHP < 0.90) {
		   heal(Leslie);
	    }

	/*
	If you are moving, dead or not attacking don't execute the rest of the
	script.
	*/
	if (is_moving(character) || character.rip || !attack_mode) return;
//Declare your current target
	var target = get_targeted_monster();
//If you currently have no target.
	if (!target) {
//Aquire a new target and output it to the console.
		set_message("Targeting monster!");
		target = get_target_of(Woodro);
		if (is_monster(target)) {
		   if (target) change_target(target);
		}
		else {
			//If there are no targets available output it to the console.
			set_message("Nothing to target!");
			move(
			character.x + ((Woodro.x - character.x) - 0),
			character.y + ((Woodro.y - character.y) - 30)
			);
			return;
		}
	}

	//If not in attack range of current target.
	if (!in_attack_range(target)) {
		move(
			character.x + ((target.x - character.x) / 2),
			character.y + ((target.y - character.y) / 2)
			);
	}
	//If in attack range, attack and output to the console.
	else if (can_attack(target)) {
    set_message("Attacking");
		attack(target);
	}
}
var cycleTime = (1000/4);
setInterval(combatScript, cycleTime);
