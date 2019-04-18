//change these to determine your sitting spot in town you want these to match whats in your cmstuff.js
var standx = -240
var standy = -50.0000001

setInterval(function () {
  items = character.items
  if (!smart.moving && (items[36]) != null){
    stop(move)
    smart_move({map:"main", x:standx, y:standy})
  }
}, 1000 *30)

setInterval(function(){
    if(!character.moving && character.map == "main"){
        parent.socket.emit("merchant", {num:41});
    }
}, 1000 *10);

setInterval(function(){
    if(character.moving){
        parent.socket.emit("merchant", {close:41});
        //searches everyone nearby
      	for(id in parent.entities)
      	{
      		var current = parent.entities[id];

      		//makes sure its a player
      		if(current && current.type == "character" && !current.npc && current.ctype != "merchant")
      		{
      			//determines if they already have a mluck boost
      			if(current.s.mluck)
      			{
      				//checks to see if the boost is from you
      				if(current.s.mluck.f && current.s.mluck.f != character.name)
      				{
      					//boosts them if they are in range
      					if(Math.sqrt((character.real_x-current.real_x)*
      								 (character.real_x-current.real_x)+
      								 (character.real_y-current.real_y)*
      								 (character.real_y-current.real_y)) < 320)
      					{
      						luck(current);
      					}
      				}
      			}
      			else
      			{
      				//if they dont already have a boost then boost them
      				if(Math.sqrt((character.real_x-current.real_x)*
      								 (character.real_x-current.real_x)+
      								 (character.real_y-current.real_y)*
      								 (character.real_y-current.real_y)) < 320)
      				{
      					luck(current);
      				}
      			}
      		}
      	}
    }
}, 1000);

setInterval(function ()
{
  if (distance_to_point(standx, standy) < 20) {
	let unwanted_items = ["hpamulet", "hpbelt", "firestaff", "fireblade", "ringsj", "wgloves", "wattire", "wcap", "vitearring", "gloves", "coat", "helmet", "pants", "shield", "shoes"];
	let items = parent.character.items
	for(let i = 3; i < 42; i++) {
		if ((items[i]) != null) {
    		if(unwanted_items.indexOf(items[i].name) > -1) {
				sell(i, 1)
      }
		}
	}
	}
}, 1000 *10);

//Potions And Looting
setInterval(function () {
    //Heal With Potions if we're below 75% hp.
    if (character.hp / character.max_hp < 0.75 || character.mp / character.max_mp < 0.75) {
        use_hp_or_mp();
    }
}, 500 );//Execute 2 times per second

var upgradeMaxLevel = 8; //Max level it will stop upgrading items at if enabled
var upgradeWhitelist =
	{
		//ItemName, Max Level
		pyjamas: upgradeMaxLevel,
		bunnyears: upgradeMaxLevel,
		carrotsword: upgradeMaxLevel,
		sshield: 7,
		shield: 7,
		gloves1: 7,
		coat1: 7,
		helmet1: 7,
		pants1: 7,
		shoes1: 7,
		harbringer: 5,
		oozingterror: 5,
		bataxe: 6,
		spear: 7,
		ornamentstaff: 7,
		candycanesword: 7,
		warmscarf: 7,
		t2bow: 7,
		pmace: 7,
		basher: 7,
		harmor: 5,
		hgloves: 5,
		wingedboots: 7,
		eslippers: 7,
		eears: 7,
		ecape: 7,
		epyjamas: 7,
		quiver: 7,
	};

var combineWhitelist =
	{
		//ItemName, Max Level
		wbook0: 3,
		lostearring: 2,
		strearring: 3,
		intearring: 3,
		dexearring: 3,
		strring: 3,
		intring: 3,
		dexring: 3,
		dexamulet: 3,
		intamulet: 3,
		stramulet: 3,
		dexbelt: 3,
		intbelt: 3,
		strbelt: 3
	}


setInterval(function() {
  if (distance_to_point(standx, standy) < 20) {
	   if(parent != null && parent.socket != null) {
		   upgrade();
		   compound_items();
	   }
  }
}, 250);

setInterval(function() {
  move_item_to_empty_slot(36);
}, 1000 *30);
function move_item_to_empty_slot(item) {
  let items = parent.character.items
	for(let i = 4; i < 41; i++) {
    if ((items[i]) == null) {
      swap(item, i)
    }
  }
}

function upgrade() {
	for (let i = 0; i < character.items.length; i++)
	{
		let c = character.items[i];

		if (c) {
			var level = upgradeWhitelist[c.name];
			if(level && c.level < level)
			{
				let grades = get_grade(c);
				let scrollname;
				if (c.level < grades[0])
					scrollname = 'scroll0';
				else if (c.level < grades[1])
					scrollname = 'scroll1';
				else
					scrollname = 'scroll2';

				let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
				if (!scroll) {
					parent.buy(scrollname);
          game_log("buying " + scrollname)
				return;
			  }
        game_log("upgrading " + c.name + " " + c.level)
			  parent.socket.emit('upgrade', {
				item_num: i,
				scroll_num: scroll_slot,
				offering_num: null,
				clevel: c.level
			  });
			  return;
			}
    	}
  	}
}

function compound_items() {
  let to_compound = character.items.reduce((collection, item, index) => {
    if (item && combineWhitelist[item.name] != null && item.level < combineWhitelist[item.name]) {
      let key = item.name + item.level;
      !collection.has(key) ? collection.set(key, [item.level, item_grade(item), index]) : collection.get(key).push(index);
    }
    return collection;
  }, new Map());

  for (var c of to_compound.values()) {
    let scroll_name = "cscroll" + c[1];

    for (let i = 2; i + 2 < c.length; i += 3) {
      let [scroll, _] = find_item(i => i.name == scroll_name);
      if (scroll == -1) {
        parent.buy(scroll_name);
        game_log("buying " + scroll_name)
        return;
      }
      parent.socket.emit('compound', {
        items: [c[i], c[i + 1], c[i + 2]],
        scroll_num: scroll,
        offering_num: null,
        clevel: c[0]
      });
	  return;
    }
  }
}

function get_grade(item) {
  return parent.G.items[item.name].grades;
}

// Returns the item slot and the item given the slot to start from and a filter.
function find_item(filter) {
  for (let i = 0; i < character.items.length; i++) {
    let item = character.items[i];

    if (item && filter(item))
      return [i, character.items[i]];
  }

  return [-1, null];
}


//Draws a circle of range around merchant where his range is
setInterval(function(){
	clear_drawings()
	draw_circle(character.real_x, character.real_y, 320)
}, 100);

var lastluck = new Date(0);
function luck(target){
	// Luck only if not on cd (cd is .1sec).
	if((new Date() - lastluck > 100)){
		parent.socket.emit("skill", {name: "mluck", id: target.id});
		set_message(target.name);
		lastluck = new Date();
	}

}

function distance_to_point(x, y) {
    return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));
}
