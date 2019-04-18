//Send Items to merchant if in range
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
if (character.hp / character.max_hp < 0.50 || character.mp /  character.max_mp < 0.25) {
    use_hp_or_mp();
    }
	loot();
	if (is_moving(character) || character.rip || !attack_mode) return;

	//Declare your current target
	var target = get_targeted_monster();
  var Woodro = get_player("Woodro")
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
			character.x + ((Woodro.x - character.x) + 0),
			character.y + ((Woodro.y - character.y) - 15)
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
	else if (can_attack(target)) {
    set_message("Attacking");
		attack(target);
	}
}

var cycleTime = (1000/4);
setInterval(combatScript, cycleTime);
