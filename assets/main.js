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
	// Activate copy buttons
	new ClipboardJS('.btn');
});

function ToggleCommonIDs() {
	if($('#common-ids').hasClass('active')) { // Disable
		$('#common-ids, #toggle-common').removeClass('active');
		$('#common-ids').hide();
		$('#toggle-common').text('Show Common IDs');
	} else { // Enable
		$('#common-ids, #toggle-common').addClass('active');
		$('#common-ids').show();
		$('#toggle-common').text('Hide Common IDs');
	}
}
function ToggleAA() {
	if($('#aa-prices').hasClass('active')) { // Disable
		$('#aa-prices, #toggle-aa').removeClass('active');
		$('#aa-prices').hide();
		$('#toggle-aa').text('Show AA Prices');
	} else { // Enable
		$('#aa-prices, #toggle-aa').addClass('active');
		$('#aa-prices').show();
		$('#toggle-aa').text('Hide AA Prices');
	}
}

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
	const desiredCurrencyIds = [1, 63, 2, 23, 3, 4, 7, 24, 69, 32, 45, 15, 29];
	
	// Fetch currency data for specific IDs
	$.getJSON(`https://api.guildwars2.com/v2/currencies?ids=${desiredCurrencyIds.join(',')}`, function(currencyData) {
		const currencyMappings = {};
		// Create a mapping of currency IDs to names and icons
		for (const currency of currencyData) {
			currencyMappings[currency.id] = {
				name: currency.name,
				icon: currency.icon
			};
		}
		
		// Fetch wallet data
		$.getJSON(`https://api.guildwars2.com/v2/account/wallet?access_token=${API_KEY}`, function(data) {
			const currencyTable = $('<table id="user_currency">');
			const currencyBody = $('<tbody>');
			// Loop through desired currency IDs in order
			for (const currencyId of desiredCurrencyIds) {
				const currencyInfo = currencyMappings[currencyId];
				const entry = data.find(entry => entry.id === currencyId);
				if (currencyInfo && entry && entry.value > 0) {
					const currencyRow = `
						<tr id="currency-${currencyId}">
						  <td>${currencyInfo.name}</td>
						  <td>${currencyId === 1 ? formatGold(entry.value) : entry.value.toLocaleString()}</td>
						  <td><img class="currency-icon" src="${currencyInfo.icon}"></td>
						</tr>
					`;
					currencyBody.append(currencyRow);
				}
			}
			currencyTable.append(`<thead><tr><th>Currency</th><th colspan="2">Amount</th></tr></thead>`);
			currencyTable.append(currencyBody);
			$(`#${API_KEY} .wallet-container`).append(currencyTable);
		}).fail(function() {
			statusUpdate('Wallet Fetch Fail... GW2 API might be down.', 'error');
		});
	}).fail(function() {
		statusUpdate('Currency Data Fetch Fail... GW2 API might be down.', 'error');
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