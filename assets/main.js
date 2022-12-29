// Dont remove this.
 $.ajaxSetup({
	async: false
 });

// On Document Ready
$(function() {
	// Technically a magic url, but allows for people to load in multiple accounts. 
	// API is just view only, so the most someone could so is see whats in the account.
	if (window.location.search.split('accounts=')[1]!=undefined) {
		var accounts = (window.location.search.split('accounts=')[1].split(','));
		for ( account in accounts ) {
			generateAccountDiv(accounts[account]);
		}
	} 
});

function statusUpdate(text_message, type) {
	$('#status-message').text(text_message);
	if (type=="" || type == null) { // Default: Basic Message, dont include a status.
		$('#status-type').empty();
	} else if (type == "error") {
		$('#status-type').css('color','red').text('Error: ');
	} else if (type == "success") {
		$('#status-type').css('color','#66FF99').text('Success: ');
	} else if (type == "running") {
		$('#status-type').css('color','#FFFF00').text('Running: ');
	} else {
		alert('ELSE REACHED')
	}
	// Shake it
	$('#status-containter').effect('shake');
}

function formatGold(amount) {
	var g = Math.floor(amount/10000);
	var s	= Math.floor((amount%10000)/100);
	var c = amount%100;

	return (((g>0) ? g.toLocaleString()+"g " : "")+((s>0) ? s+"s " : "")+((c>0) ? c+"c " : ""));
}

function generateAccountDiv(API_KEY) {
	if (API_KEY != "") { // Not null and doesnt already exist.
		if (!document.getElementById(API_KEY)) {
			statusUpdate('Adding API KEY: ' + API_KEY);
			$.getJSON('https://api.guildwars2.com/v2/account?access_token='+API_KEY, function(data) {
				$('#account-container').append('<div class="account" id="'+API_KEY+'"><h3>Account: '+data.name+'</h3><div class="wallet-container"></div><hr><div class="item-search"><h4>Search</h4></div><hr><div class="login-rewards-container"><h4>Login Rewards <button class="btn btn-secondary login-rewards-button" type="button">Fetch</button></h4><b>MC: </b><span class="mc-holder"></span><br><b>Tomes: </b><span class="tomes-holder"></span><br><b>Laurels: </b><span class="laurels-holder"></span><br><b>Loyalty Chests: </b><span class="loyalty-chests-holder"></span></div></div>');
				$('#'+API_KEY+' .item-search').append('<div class="input-group mb-3"><input class="form-control mat-search-id" type="text" class="form-control" placeholder="Item ID"><button class="btn btn-secondary mat-search-button" type="button"><i class="bi bi-search"></i> Mat Storage</button></div><div class="mat-search-result"></div>');
				$('#'+API_KEY+' .item-search').append('<div class="input-group mb-3"><input class="form-control bank-search-id" type="text" class="form-control" placeholder="Item ID"><button class="btn btn-secondary bank-search-button" type="button"><i class="bi bi-search"></i> Bank </button></div><div class="bank-search-result"></div>');
				$('#'+API_KEY+' .item-search').append('<div class="input-group mb-3"><input class="form-control char-search-id" type="text" class="form-control" placeholder="Item ID"><button class="btn btn-secondary char-search-button" type="button"><i class="bi bi-search"></i> Characters </button></div><div class="char-search-result"><div class="overall-result"></div><ul class="char-list"></ul></div>');
				$('#'+API_KEY+' .mat-search-button').click(function(){ search_storage(API_KEY, $('#'+API_KEY+' .mat-search-id').val()); });
				$('#'+API_KEY+' .bank-search-button').click(function(){ search_bank(API_KEY, $('#'+API_KEY+' .bank-search-id').val()); });
				$('#'+API_KEY+' .char-search-button').click(function(){ search_allcharacters(API_KEY, $('#'+API_KEY+' .char-search-id').val()); });
				$('#'+API_KEY+' .login-rewards-button').click(function(){ search_login_rewards(API_KEY); });
				getWallet(API_KEY);
				statusUpdate(' Added: ' + data.name, 'success');
			}).fail(function() {
				statusUpdate('Key could not be added. Check spelling or GW2 API might be down.', 'error');
			});
		} else {
			statusUpdate('Account was already added.', 'error');
		}
	} else {
		statusUpdate('API input is left blank.', 'error');
	}
}

function getWallet(API_KEY) {
	$.getJSON('https://api.guildwars2.com/v2/account/wallet?access_token='+API_KEY, function(data) {
		//console.log(data);
		
		var gold_value, karma_value, ss_value, laurel_value, gem_value, relic_value, prelic_value, dungeon_value, um_value, vm_value, honor_value;
		
		// Cycle through and assign the values
		for (x in data) {			
			switch(data[x].id) {
				case 1:
					gold_value = data[x].value;
				break;
				case 2:
					karma_value = data[x].value;
				break;
				case 23:
					ss_value = data[x].value;
				break;
				case 3:
					laurel_value = data[x].value;
				break;
				case 4:
					gem_value = data[x].value;
				break;
				case 7:
					relic_value = data[x].value;
				break;
				case 24:
					prelic_value = data[x].value;
				break;
				case 69:
					dungeon_value = data[x].value;
				break;
				case 32:
					um_value = data[x].value;
				break;
				case 45:
					vm_value = data[x].value;
				break;
				case 15:
					honor_value = data[x].value;
				break;
			}
		}
		
		// Cant compare gold. 
		var gold_html='', karma_html='', ss_html='', laurel_html='', gem_html='', relic_html='', prelic_html='', dungeon_html='', um_html='', vm_html='', honor_html=''
		
		if(gold_value != undefined && gold_value > 0){gold_html=`<tr id="currency-1"><td>Gold</td><td>${formatGold(gold_value)}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/98457F504BA2FAC8457F532C4B30EDC23929ACF9/619316.png"></td></tr>`}
		if(karma_value != undefined && karma_value > 0){karma_html=`<tr id="currency-2"><td>Karma</td><td>${karma_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/94953FA23D3E0D23559624015DFEA4CFAA07F0E5/155026.png"></td></tr>`}
		if(ss_value != undefined && ss_value > 0){ss_html=`<tr id="currency-23"><td>Spirit Shards</td><td>${ss_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/0AD608DE7FDEE0B909905C0AF9401321CF65CD94/1010701.png"></td></tr>`}
		if(laurel_value != undefined && laurel_value > 0){laurel_html=`<tr id="currency-3"><td>Laurel</td><td>${laurel_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/A1BD345AD9192C3A585BE2F6CB0617C5A797A1E2/619317.png"></td></tr>`}
		if(gem_value != undefined && gem_value > 0){gem_html=`<tr id="currency-4"><td>Gem</td><td>${gem_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/220061640ECA41C0577758030357221B4ECCE62C/502065.png"></td></tr>`}
		if(relic_value != undefined && relic_value > 0){relic_html=`<tr id="currency-7"><td>Fractal Relic</td><td>${relic_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/0204DAD0D40674035F9F5F5270043C3207EEA7E8/619320.png"></td></tr>`}
		if(prelic_value != undefined && prelic_value > 0){prelic_html=`<tr id="currency-24"><td>Pristine Fractal Relic</td><td>${prelic_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/77B0F842ED036D71E46B80570D6CFE25CB4C0677/619321.png"></td></tr>`}
		if(dungeon_value != undefined && dungeon_value > 0){dungeon_html=`<tr id="currency-69"><td>Tales of Dunegon Delving</td><td>${dungeon_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/37CCE672250A3170B71760949C4C9C9B186517B1/619327.png"></td></tr>`}
		if(um_value != undefined && um_value > 0){um_html=`<tr id="currency-32"><td>Unbound Magic</td><td>${um_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/55CBF5154BC749F0BE7B01F9C75C04F2CD4BC561/1465799.png"></td></tr>`}
		if(vm_value != undefined && vm_value > 0){vm_html=`<tr id="currency-45"><td>Volatile Magic</td><td>${vm_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/57F51A1F62E3FBB7B5E02CBD7C9717371D1CC8F2/1894697.png"></td></tr>`}
		if(honor_value != undefined && honor_value > 0){honor_html=`<tr id="currency-15"><td>Badge of Honor</td><td>${honor_value.toLocaleString()}</td><td><img class="currency-icon" src="https://render.guildwars2.com/file/AC3178E7BD066BC597F9D4247848E6033A047EDE/699004.png"></td></tr>`}
		
		$('#'+API_KEY+' .wallet-container').append(`
		<table id="user_currency">
			<thead><tr><th>Currency</th><th colspan="2">Amount</th></tr></thead>
			<tbody>
				${gold_html}
				${karma_html}
				${ss_html}
				${laurel_html}
				${gem_html}
				${relic_html}
				${prelic_html}
				${dungeon_html}
				${um_html}
				${vm_html}
				${honor_html}
				</tbody>
		</table>
		`);
	}).fail(function() {
		statusUpdate('Wallet Fetch Fail... GW2 API might be down.', 'error');
	});
}

function search_storage(API_KEY, item_ID) {
	console.log("Running Material Storage Search");
	statusUpdate('Material Storage Search', 'running');
	if (item_ID != "") {
		var matchFound = false;
		// Search the material storage
		$.getJSON('https://api.guildwars2.com/v2/account/materials?access_token='+API_KEY, function(data) {
			//console.log(data);
			// Cycle through all the slots until the id matches.
			for (var i=0; i<data.length;i++){
				if (matchFound == true) {
					break;
				}
				//console.log(data[i].id);
				if(item_ID==data[i].id) { // Does it match my query?
					// Matches so tell me the name of the item.
					//console.log('Match');
					$.getJSON('https://api.guildwars2.com/v2/items/'+item_ID, function(info) {
						//console.log(info.name);
						//console.log(data[i].count);
						console.log(info.name, data[i].count);
						$('#'+API_KEY+' .mat-search-result').text(info.name+' = '+data[i].count).effect('shake', {'direction': 'up'});
						statusUpdate('Finished Searching');
						// You found it so you can break the loop, as nothing past here will match.
						matchFound = true;
					});
				}
			}
			// It has finished the loop, display message if nothing was found.
			if (matchFound == false) {
				//console.log('No Match');
				$('#'+API_KEY+' .mat-search-result').text('No Match').effect('shake', {'direction': 'up'});;
				statusUpdate('Finished Searching');
			}
		}).fail(function() {
			statusUpdate('Mat Storage Fetch Fail... GW2 API might be down.', 'error');
		});
	} else {
		console.log('Search Failed: ItemID is null...');
		statusUpdate('Search Failed: ItemID is null...', 'error');
	}
}

function search_bank(API_KEY, item_ID) {
	console.log("Running Bank Search");
	if (item_ID != "") {
		$.getJSON('https://api.guildwars2.com/v2/account/bank?access_token='+API_KEY, function(data) {
			var bankCount = 0;
			//console.log(data);
			for (var i=0; i<data.length;i++){
				if(data[i]!=null) { // If the bank spot isnt empty, print.
					// Print the item id in the current slot.
					//console.log(data[i].id);
					if(item_ID==data[i].id) { // Does it match my query?
						//console.log('Match');
						//console.log(data[i].count);
						bankCount += data[i].count;
					}
				}
			}
			// Get the item name
			$.getJSON('https://api.guildwars2.com/v2/items/'+item_ID, function(info) {
				//console.log(info.name, bankCount);
				$('#'+API_KEY+' .bank-search-result').text(info.name+' = '+bankCount).effect('shake', {'direction': 'up'});
				statusUpdate('Finished Searching');
			});
		}).fail(function() {
			statusUpdate('Bank Fetch Fail... GW2 API might be down.', 'error');
		});
	} else {
		console.log('Search Failed: ItemID is null...');
		statusUpdate('Search Failed: ItemID is null...', 'error');
	}
}

function search_allcharacters(API_KEY, item_ID) {
	console.log('Running All Characters Search');
	statusUpdate('All Characters Search', 'running');
	if (item_ID != '') {
		var runningTotal = 0;
		
		$('#'+API_KEY+' .char-search-result .overall-result').empty();
		$('#'+API_KEY+' .char-search-result .char-list').empty();
		$.getJSON('https://api.guildwars2.com/v2/characters?access_token='+API_KEY, function(data) {
			for (var i=0; i<data.length;i++){
				charName = data[i];
				$.getJSON('https://api.guildwars2.com/v2/characters/'+charName+'?access_token='+API_KEY, function(data) {
					var whoami = data.name;
					var itemsMatchingOnChar = 0;
					console.log("Character_Name: "+whoami);
					//console.log(data.bags);
					for(var i=0;i<data.bags.length;i++){
						//console.log("Is the bag slot not empty?: "+(data.bags[i]!=null));
						if(data.bags[i]!=null){ // Check that the character has the bag equiped.
							var thisBagInv = data.bags[i].inventory;
							//console.log(thisBagInv);
							for(var j=0; j<thisBagInv.length;j++){
								if(thisBagInv[j]!=null){//If the bag inv slot is not empty.
									// Print the item id in the current slot.
									//console.log(data.bags[i].inventory[j].id);
									if(item_ID==data.bags[i].inventory[j].id) {
										//console.log('Match');
										//console.log(data.bags[i].inventory[j].count);
										itemsMatchingOnChar+=data.bags[i].inventory[j].count;
									}
								}
							}
						}
					}
					if(itemsMatchingOnChar>0) {
						runningTotal += itemsMatchingOnChar;
						console.log(whoami+" : "+itemsMatchingOnChar);
						$('#'+API_KEY+' .char-search-result .char-list').append('<li>'+whoami+' : '+itemsMatchingOnChar+'</li>');
					}
				});
			}
			// Get the item name
			$.getJSON('https://api.guildwars2.com/v2/items/'+item_ID, function(info) {
				//console.log('Search for '+info.name+' ended: ' + runningTotal);
				$('#'+API_KEY+' .char-search-result .overall-result').empty().append('<b>Search for '+info.name+' ended: ' + runningTotal + '</b>');
				$('#'+API_KEY+' .char-search-result').effect('shake', {'direction': 'up'});
				statusUpdate('Finished Searching');
			});
		});
	} else {
		console.log('Search Failed: ItemID is null...');
		statusUpdate('Search Failed: ItemID is null...', 'error');
	}
}

function search_login_rewards(API_KEY) {
	console.log("Running Login Rewards Search");
	$.getJSON('https://api.guildwars2.com/v2/characters?access_token='+API_KEY, function(data) {
		statusUpdate('Login Rewards Search', 'running');

		var tomes = 0;
		var unopenedLaurels = 0;
		var mc = 0;
		var loyaltyChests = 0;
		
		for (var i=0; i<data.length;i++){
			charName = data[i];
			$.getJSON('https://api.guildwars2.com/v2/characters/'+charName+'?access_token='+API_KEY, function(data) {
				var whoami = data.name;
				var itemsMatchingOnChar = 0;
				console.log("Character_Name: "+whoami);
				//statusUpdate("Checking: "+whoami);
				//console.log(data.bags);
				for(var i=0;i<data.bags.length;i++){
					//console.log("Is the bag slot not empty?: "+(data.bags[i]!=null));
					if(data.bags[i]!=null){ // Check that the character has the bag equiped.
						var thisBagInv = data.bags[i].inventory;
						//console.log(thisBagInv);
						for(var j=0; j<thisBagInv.length;j++){
							if(thisBagInv[j]!=null){//If the bag inv slot is not empty.
								// Print the item id in the current slot.
								//console.log(data.bags[i].inventory[j].id);
								var currentItem = data.bags[i].inventory[j];
								switch(currentItem.id) {
									case 68332: // Day 1 - Bag of 2 MC
										//console.log(currentItem.count + ' * 2 mystic coin');
										mc += (currentItem.count * 2);
									break;
									case 68329: // Day 6 - 1 Tome of Knowledge 
										//console.log(currentItem.count + ' * 1 Tome');
										tomes += (currentItem.count);
									break;
									case 68318: // Day 8 - Bag of 4 MC
										//console.log(currentItem.count + ' * 4 mystic coin');
										mc += (currentItem.count * 4);
									break;
									case 68330: // Day 15 - Bag of 6 MC
										//console.log(currentItem.count + ' * 6 mystic coin');
										mc += (currentItem.count * 6);
									break;
									case 68333: // Day 22 - Bag of 8 MC
										//console.log(currentItem.count + ' * 8 mystic coin');
										mc += (currentItem.count * 8);
									break;
									case 68314: // Day 2 - 1 Laural
										//console.log(currentItem.count + ' * 1 Laural');
										unopenedLaurels += (currentItem.count);
									break;
									case 68328: // Day 7 - 10 Laural
										//console.log(currentItem.count + ' * 10 Laural');
										unopenedLaurels += (currentItem.count * 10);
									break;
									case 68339: // Day 9 - 2 Laural
										//console.log(currentItem.count + ' * 2 Laural');
										unopenedLaurels += (currentItem.count * 2);
									break;
									case 68317: // Day 13 - 2 Tomes of Knowledge
										//console.log(currentItem.count + ' * 2 Tomes');
										tomes += (currentItem.count * 2);
									break;
									case 68327: // Day 16 - 3 Laural
										//console.log(currentItem.count + ' * 3 Laural');
										unopenedLaurels += (currentItem.count * 3);
									break;
									case 68338: // Day 20 - 3 Tomes of Knowledge
										//console.log(currentItem.count + ' * 3 Tomes');
										tomes += (currentItem.count * 3);
									break;
									case 68334: // Day 21 - 15 Laural
										//console.log(currentItem.count + ' * 15 Laural');
										unopenedLaurels += (currentItem.count * 15);
									break;
									case 68336: // Day 23 - 4 Laural
										//console.log(currentItem.count + ' * 4 Laural');
										unopenedLaurels += (currentItem.count * 4);
									break;
									case 68316: // Day 27 - 4 Tomes of Knowledge
										//console.log(currentItem.count + ' * 4 Tomes');
										tomes += (currentItem.count * 4);
									break;
									case 68326: // Day 28 - Loyalty Chest
										//console.log(currentItem.count + ' * Loyalty Chest');
										loyaltyChests += (currentItem.count);
									break;
									case 43766: // Tome of Knowledge in Inventory
										//console.log(currentItem.count + ' * Tome of Knowledge');
										tomes += (currentItem.count);
									break;
									case 19976: // Mystic Coins in Inventory
										//console.log(currentItem.count + ' * MC');
										mc += (currentItem.count);
									break;
								}
							}
						}
					}
				}
			});
		}
		$('#'+API_KEY+' .login-rewards-container .mc-holder').text(mc);
		$('#'+API_KEY+' .login-rewards-container .tomes-holder').text(tomes);
		$('#'+API_KEY+' .login-rewards-container .laurels-holder').text(unopenedLaurels);
		$('#'+API_KEY+' .login-rewards-container .loyalty-chests-holder').text(loyaltyChests);
		$('#'+API_KEY+' .login-rewards-container').effect('shake', {'direction': 'up'});
		statusUpdate('Finished Search');
	});
}