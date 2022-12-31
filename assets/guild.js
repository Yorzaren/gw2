function viewGuild(GUILD_ID) {
	// Hide them when swapping
	$('.nav-tabs, .tab-content').hide();
	// Show the selected guild
	$('#tab-'+GUILD_ID).show();
	$('#tab-content-'+GUILD_ID).show();
}

async function getAccountDetails(API_KEY) {
	var account_info = await fetch('https://api.guildwars2.com/v2/account?access_token='+API_KEY);
	var account_data = await account_info.json();
	//console.log(account_data);
		
	// Change the navbar to the account name
	$('#account-name').html('Welcome, <b style="color:#FFF;">' + account_data.name + '</b>');
	
	// Check that the account can use the tool.
	if(account_data.guild_leader.length > 0) {
		$('#guild-selector').empty()
		$('#guild-chooser').show();
		for (i in account_data.guild_leader) {
			addGuild(API_KEY, account_data.guild_leader[i]);
		}
	} else {
		alert('You do not have guild leadership in least 1 guild. You must have the guild permissions to use this tool.');
	}
}

async function addGuild(API_KEY, GUILD_ID) {
	var guild_info = await fetch('https://api.guildwars2.com/v2/guild/'+GUILD_ID+'?access_token='+API_KEY);
	var guild_data = await guild_info.json();
	
	//console.log(guild_data.name + ' [' + guild_data.tag + ']');
	
	$('#guild-selector').append('<option value="'+GUILD_ID+'">'+guild_data.name + ' [' + guild_data.tag + ']'+'</option>');
	
	// Generate the tabs to hold the data...
	// Have them hidden by default
	// Show when the user swaps.
	
	// Guild Log and Stash Log are linked in the same json pull, but are split into different tabs to read easier. So disable the buttons for both when one action gets called.
	$('#guild-holder-container').append(
		`
		<ul class="nav nav-tabs" id="tab-${GUILD_ID}"role="tablist" style="display:none;">
			<li class="nav-item" role="presentation"><button class="nav-link active" id="guild-history-tab-${GUILD_ID}" data-bs-toggle="tab" data-bs-target="#guild-history-content-${GUILD_ID}" type="button" role="tab">Guild History</button></li>
			<li class="nav-item" role="presentation"><button class="nav-link" id="guild-members-tab-${GUILD_ID}" data-bs-toggle="tab" data-bs-target="#guild-members-content-${GUILD_ID}" type="button" role="tab">Guild Members</button></li>
			<li class="nav-item" role="presentation"><button class="nav-link" id="guild-stash-tab-${GUILD_ID}" data-bs-toggle="tab" data-bs-target="#guild-stash-content-${GUILD_ID}" type="button" role="tab">Guild Bank</button></li>
			<li class="nav-item" role="presentation"><button class="nav-link" id="guild-stash-log-tab-${GUILD_ID}" data-bs-toggle="tab" data-bs-target="#guild-stash-log-content-${GUILD_ID}" type="button" role="tab">Guild Bank Log</button></li>
		</ul>
		<div class="tab-content" id="tab-content-${GUILD_ID}" style="display:none;">
			<div class="tab-pane fade show active" id="guild-history-content-${GUILD_ID}" role="tabpanel">
				<button class="btn btn-secondary guild-log-${GUILD_ID}" type="button" onClick="$('.guild-log-'+${GUILD_ID}).hide();getGuildLog($('#api-key').val(), '${GUILD_ID}');">Pull Guild Log for ${guild_data.name} [${guild_data.tag}]</button>
				<table class="table table-dark table-striped table-hover" id="guild-action-log-${GUILD_ID}">
					<thead><tr><th scope="col" style="width:20%!important">Timestamp</th><th scope="col" style="width:20%!important">Account</th><th scope="col" style="width:20%!important">Action</th><th scope="col" style="width:40%!important">Log</th></tr></thead>
					<tbody></tbody>
				</table>
			</div>
			<div class="tab-pane fade" id="guild-members-content-${GUILD_ID}" role="tabpanel">
				<button class="btn btn-secondary" type="button" onclick="$(this).hide();getGuildMembers($('#api-key').val(), '${GUILD_ID}');">Pull Member Info for ${guild_data.name} [${guild_data.tag}]</button>
				<table class="table table-dark table-striped table-hover" id="guild-member-list-${GUILD_ID}">
					<thead>
						<tr>
							<th scope="col" style="width:20%!important">Account</th>
							<th scope="col" style="width:20%!important">Rank</th>
							<th scope="col" style="width:20%!important">Joined On</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
			<div class="tab-pane fade" id="guild-stash-content-${GUILD_ID}" role="tabpanel">
				<button class="btn btn-secondary" type="button" onClick="$(this).hide();getGuildStash($('#api-key').val(), '${GUILD_ID}');">Pull Bank Inventory for ${guild_data.name} [${guild_data.tag}]</button>
			</div>
			<div class="tab-pane fade" id="guild-stash-log-content-${GUILD_ID}" role="tabpanel">
				<button class="btn btn-secondary guild-log-${GUILD_ID}" type="button" onClick="$('.guild-log-${GUILD_ID}').hide();getGuildLog($('#api-key').val(), '${GUILD_ID}');">Pull Bank Log for ${guild_data.name} [${guild_data.tag}]</button>
				<table class="table table-dark table-striped table-hover" id="guild-stash-log-${GUILD_ID}">
					<thead><tr><th scope="col" style="width:20%!important">Timestamp</th><th scope="col" style="width:20%!important">Account</th><th scope="col" style="width:20%!important">Action</th><th scope="col" style="width:40%!important">Log</th></tr></thead>
					<tbody></tbody>
				</table>
			</div>
		</div>
		`
	);
	generationBankHTML('#guild-stash-content-'+GUILD_ID, GUILD_ID, 'Guild Stash', 5);
	generationBankHTML('#guild-stash-content-'+GUILD_ID, GUILD_ID, 'Treasure Trove', 10);
	generationBankHTML('#guild-stash-content-'+GUILD_ID, GUILD_ID, 'Deep Cave', 10);
}

async function getGuildLog(API_KEY, GUILD_ID) {
	console.log('---GETTING GUILD LOG---');

	var guild_info = await fetch('https://api.guildwars2.com/v2/guild/'+GUILD_ID+'/log?access_token='+API_KEY);
	var guild_data = await guild_info.json();

	for (i in guild_data) {
		if (guild_data[i].type == "stash") {
			console.log(guild_data[i]);
			if (guild_data[i].coins != 0) {
				$('#guild-stash-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>'+guild_data[i].user+'</td><td>'+guild_data[i].operation+'</td><td>'+formatGold(guild_data[i].coins)+'</td></tr>');
			} else {
				//console.log(guild_data[i].user + ' ' + guild_data[i].operation + ' x ' + itemLookup(guild_data[i].item_id));
				$('#guild-stash-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>'+guild_data[i].user+'</td><td>'+guild_data[i].operation+'</td><td>'+guild_data[i].count+' x <span class="item-lookup" id="'+guild_data[i].item_id+'">'+itemLookup(guild_data[i].item_id)+'</td></tr>');
			}
		} else if (guild_data[i].type != "influence") {
			switch (guild_data[i].type) {
				case 'motd':
					$('#guild-action-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>'+guild_data[i].user+'</td><td>Changed the Message of the Day</td><td>'+guild_data[i].motd+'</td></tr>');
				break;
				case 'joined':
					$('#guild-action-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>'+guild_data[i].user+'</td><td>Join</td><td><b>'+guild_data[i].user+'</b> has joined the guild.</td></tr>');
				break;
				case 'invited':
					$('#guild-action-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>...</td><td>New Invite</td><td><b>'+guild_data[i].invited_by +'</b> has invited <b>'+guild_data[i].user+'</b> the guild.</td></tr>');
				break;
				case 'kick':
					if (guild_data[i].kicked_by == guild_data[i].user) {
						$('#guild-action-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>...</td><td>Leave</td><td><b>'+guild_data[i].user +'</b> has left the guild.</td></tr>');
					} else {
						$('#guild-action-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>...</td><td>Kick</td><td><b>'+guild_data[i].user +'</b> has been kicked from guild by <b>'+guild_data[i].kicked_by+'</b>.</td></tr>');
					}
				break;
			}
			//$('#guild-action-log-'+GUILD_ID).append('<tr><td>'+new Date(guild_data[i].time).toLocaleString()+'<span style="cursor:help" title="UTC: '+guild_data[i].time+'">*</span></td><td>'+guild_data[i].user+'</td><td>'+guild_data[i].operation+'</td><td>'+formatGold(guild_data[i].coins)+'</td></tr>');
		}
	}

	console.log('----FINISHED----')
}

async function getGuildMembers(API_KEY, GUILD_ID) {
	console.log('---GETTING GUILD MEMBERS---');
	var members_info = await fetch('https://api.guildwars2.com/v2/guild/'+GUILD_ID+'/members?access_token='+API_KEY);
	var members_data = await members_info.json();
	
	//console.log(members_data);
	
	for (i in members_data) {
		console.log(members_data[i]);
		$('#guild-member-list-'+GUILD_ID).append('<tr><td>'+members_data[i].name+'</td><td>'+members_data[i].rank+'</td><td>'+new Date(members_data[i].joined).toLocaleString()+'<span style="cursor:help" title="UTC: '+members_data[i].joined+'">*</span></td></tr>');
	}
	console.log('----FINISHED----')
}

async function getGuildStash(API_KEY, GUILD_ID) {
	console.log('---GETTING GUILD STASH---');
	var stash_info = await fetch('https://api.guildwars2.com/v2/guild/'+GUILD_ID+'/stash?access_token='+API_KEY);
	var stash_data = await stash_info.json();
	
	console.log(stash_data);
	
	for (stash_id in stash_data) {
		var stash_target='NULL';
		
		// Set and show if the guild has the tabs unlocked.
		if (stash_id == 0) {
			stash_target = 'guild-stash';
			$('#guild-stash-content-' + GUILD_ID + ' .guild-stash-container').show();
		} else if (stash_id == 1) {
			stash_target = 'treasure-trove';
			$('#guild-stash-content-' + GUILD_ID + ' .treasure-trove-container').show();
		} else if (stash_id == 2) {
			stash_target = 'deep-cave';
			$('#guild-stash-content-' + GUILD_ID + ' .deep-cave-container').show();
		}
		$('#guild-stash-content-'+GUILD_ID+' .'+stash_target+'-gold').html(formatGold(stash_data[stash_id].coins));
		$('#guild-stash-content-'+GUILD_ID+' .note-'+stash_target).html(stash_data[stash_id].note);
		console.log(stash_data[stash_id].inventory);
		
		for (item in stash_data[stash_id].inventory) {
			if (stash_data[stash_id].inventory[item]!=null) {
				var item_entry = stash_data[stash_id].inventory[item];
				var item_info = returnItemAndIcon(item_entry.id);
				var item_count = item_entry.count;
				console.log(item_entry);
				$('#guild-stash-content-'+GUILD_ID+' .inventory-'+stash_target+' td').eq(item).html('<img title="'+item_info[0]+'" src="'+item_info[1]+'"><span title="'+item_info[0]+'" class="item-count">'+item_count+'</span>');	
			}
		}
	}
	
	console.log('----FINISHED----')
}

function itemLookup(ITEM_ID){
	var value= $.ajax({
		url: 'https://api.guildwars2.com/v2/items/'+ITEM_ID, 
		async: false
	}).responseText;
	var parse = JSON.parse(value);
	return parse.name;
}

function formatGold(amount) {
	var g = Math.floor(amount/10000);
	var s	= Math.floor((amount%10000)/100);
	var c = amount%100;

	return (((g>0) ? g.toLocaleString()+"g " : "")+((s>0) ? s+"s " : "")+((c>0) ? c+"c " : ""));
}

function returnItemAndIcon(ITEM_ID){
	var value= $.ajax({
		url: 'https://api.guildwars2.com/v2/items/'+ITEM_ID, 
		async: false
	}).responseText;
	var parse = JSON.parse(value);
	return [parse.name, parse.icon];
}


function generationBankHTML(append_to_id, GUILD_ID, bank_name, num_rows) {
	var html_row = '<tr><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td><td class="item-container"></td></tr>';

	var id_converted = bank_name.toLowerCase().replaceAll(' ', '-');

	$(append_to_id).append(`
	<div class="${id_converted}-container" style="display:none;">
		<h2>${bank_name}</h2>
		<p style="cursor:help;" title="Guild Bank Message/Note" class="note-${id_converted}"></p>
		<table class="inventory-${id_converted}"><tbody></tbody></table>
		<br><b>Gold: </b><span class="${id_converted}-gold"></span><br><br>
	</div>
	`);
	
	for (var i = 0; i < num_rows; i++) {
		$(append_to_id+' .inventory-'+id_converted).append(html_row); // Dont forget the append_to_id or it will attach it to every instance of 
	}
	
}