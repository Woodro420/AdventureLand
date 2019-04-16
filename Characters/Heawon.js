load_code(99)
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
            send_gold(player, 10000000)
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

/*
Everything within the braces of the function combatScript() is the syntax that
will make your character do things, in this case fight.
*/
function combatScript(){
	/*
	To stop your character from using a potion everytime you lose a little bit
	of health or mana we need to make sure it only happens when you are
	below a minimum amount of health or mana. Note that once it executes it
	will always cause your character to use both HP and MP regardless of
	the amount of health or mana lost.
	*/
    var Woodro = get_player("Woodro");
	var Leslie = get_player("Leslie");

	//Current treshold for using a Health Potion
	//var useHPTreshold = character.max_hp / 2;
	//Current treshold for using a Mana Potion
	//var useMPTreshold = character.max_mp / 2;

	/*
	If your mana or health is below its treshold use a HP and MP if applicable
	*/
	if (character.hp / character.max_hp < 0.70 || character.mp / character.max_mp < 0.50)  {
		//use_hp_or_mp();
		log("Healing myself")
		heal(character)
	    }

	//Loot everything in your current proximity
	loot();

	//Healing the party
	var WoodCHP = (get_player("Woodro").hp);
	var WoodMHP = (get_player("Woodro").max_hp);
    var LesCHP = (get_player("Leslie").hp);
	var LesMHP = (get_player("Leslie").max_hp);
	    if (WoodCHP / WoodMHP < 0.90) {
		   log("Healing Woodro!");
		   heal(Woodro);
	    }
	    else if (LesCHP / LesMHP < 0.90) {
		   log("Healing Valcrum!");
		   heal(Leslie);
	    }

	/*
	If you are moving, dead or not attacking don't execute the rest of the
	script.
	*/
	if (is_moving(character) || character.rip || !attack_mode) return;

	//Declare your current target
	var target = get_targeted_monster();
    //var Woodro = get_player("Woodro");
	//var Valcrum = get_player("Valcrum");

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

		//Move half the distance towards the target.
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

/*
To prevent the communication between the server and your gameclient from
choking we need to limit how often our code runs, so the server has time to
process things. Below we will determine the amount of milliseconds that need to
pass before the script is allowed to execute again (this is called a cycletime).
*/

// Loops every 1/4 seconds a.k.a. a cycletime of 250ms
var cycleTime = (1000/4);

/*
Everything within the braces of setInterval() is executed at the chosen
interval (through the "cycletime" parameter). This is where we call the
combatScript function so it starts running.
*/
setInterval(combatScript, cycleTime);
