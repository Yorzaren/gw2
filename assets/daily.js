$(function() {
	getDailyFractials(true);
	getDailyFractials(false);
	// Default Hide Dailies
	$('#dailies-container').hide();
	
	// Make Tomorrow Active
	$('#tomorrow-container').addClass('active');
	$('#tomorrow-label').addClass('active');
	$('#today-container').hide();
});

function ToggleDailies() {
	if($('#toggle-dailies').hasClass('active')) { // Disable
		$('#toggle-dailies').removeClass('active');
		$('#dailies-container').hide();
		$('#toggle-dailies').text('Show Dailies');
	} else { // Enable
		$('#toggle-dailies').addClass('active');
		$('#dailies-container').show();
		$('#toggle-dailies').text('Hide Dailies');
	}
}

function ToggleDay() {
	if ($('#tomorrow-container').hasClass('active')) { // Swap to Today
		$('#tomorrow-container').hide().removeClass('active');
		$('#tomorrow-label').removeClass('active');
		$('#today-container').show().addClass('active');
		$('#today-label').addClass('active');
	} else { // Swap to Tomorrow
		$('#today-container').hide().removeClass('active');
		$('#today-label').removeClass('active');
		$('#tomorrow-container').show().addClass('active');
		$('#tomorrow-label').addClass('active');
	}
}

async function getDailyFractials(getTmr) {
	var target_url = 'https://api.guildwars2.com/v2/achievements/daily';
	var target_prefix = 'today';
	if (getTmr == true) {
		target_url = 'https://api.guildwars2.com/v2/achievements/daily/tomorrow';
		target_prefix = 'tomorrow';
	}
	var daily_response = await fetch(target_url);
	var daily_data = await daily_response.json();

	//console.log(daily_data.fractals);
	var frac_ids = '';
	for (i in daily_data.fractals) {
		//console.log(daily_data.fractals[i].id);
		if (i == 0) { //First one
			frac_ids = frac_ids.concat(daily_data.fractals[i].id);
		} else {
			frac_ids = frac_ids.concat(',', daily_data.fractals[i].id);
		}
	}
	var pve_ids = '';
	for (i in daily_data.pve) {
		if (daily_data.pve[i].level.max == 80) { // Filiter out the dailies, I can't do.
			if (i == 0) { //First one
				pve_ids = pve_ids.concat(daily_data.pve[i].id);
			} else {
				pve_ids = pve_ids.concat(',', daily_data.pve[i].id);
			}	
		}
	}
	var pvp_ids = '';
	for (i in daily_data.pvp) {
		if (i == 0) { //First one
			pvp_ids = pvp_ids.concat(daily_data.pvp[i].id);
		} else {
			pvp_ids = pvp_ids.concat(',', daily_data.pvp[i].id);
		}
	}
	var wvw_ids = '';
	for (i in daily_data.wvw) {
		if (i == 0) { //First one
			wvw_ids = wvw_ids.concat(daily_data.wvw[i].id);
		} else {
			wvw_ids = wvw_ids.concat(',', daily_data.wvw[i].id);
		}
	}

	//console.log(frac_ids);
	//console.log(pve_ids);
	//console.log(pvp_ids);
	//console.log(wvw_ids);

	var frac_info = await fetch('https://api.guildwars2.com/v2/achievements?ids=' + frac_ids);
	var frac_data = await frac_info.json();
	var pve_info = await fetch('https://api.guildwars2.com/v2/achievements?ids=' + pve_ids);
	var pve_data = await pve_info.json();
	var pvp_info = await fetch('https://api.guildwars2.com/v2/achievements?ids=' + pvp_ids);
	var pvp_data = await pvp_info.json();
	var wvw_info = await fetch('https://api.guildwars2.com/v2/achievements?ids=' + wvw_ids);
	var wvw_data = await wvw_info.json();

	//console.log(frac_data);

	var name_daily_fracs = [];
	var rec_num = [];

	for (i in frac_data) {
		//console.log(frac_data[i].name);
		if (frac_data[i].name.indexOf('Tier 4') >= 0) {
			name_daily_fracs.push(frac_data[i].name.split('Tier 4 ')[1]);
		} else if (frac_data[i].name.indexOf('Recommended Fractal—Scale ') >= 0) {
			rec_num.push(frac_data[i].name.split('Recommended Fractal—Scale ')[1]);
		}
	}
	rec_num = rec_num.sort(function(a, b) {
		return a - b;
	});
	//console.log(name_daily_fracs);
	//console.log(rec_num);

	for (i in name_daily_fracs) {
		$('#' + target_prefix + '-fracs').append('<li>' + name_daily_fracs[i] + '</li>');
		//console.log(name_daily_fracs[i]);
	}
	for (i in rec_num) {
		$('#' + target_prefix + '-fracs').append('<li>' + rec_num[i] + ' ('+fractalRecLookup(rec_num[i])+')'+ '</li>');
		//console.log(rec_num[i]);
	}
	
	//console.log(pve_data)
	
	for (i in pve_data) {
		$('#' + target_prefix + '-pve').append('<li>' + pve_data[i].name + '</li>');
	}
	
	for (i in pvp_data) {
		$('#' + target_prefix + '-pvp').append('<li>' + pvp_data[i].name + '</li>');
	}
	
	for (i in wvw_data) {
		$('#' + target_prefix + '-wvw').append('<li>' + wvw_data[i].name + '</li>');
	}
}

function fractalRecLookup(frac_id) {
	frac_id = parseInt(frac_id);
	switch (frac_id) {
		case 2:
		case 36:
		case 62:
			return 'Uncategorized';
		case 14:
		case 65:
			return 'Aetherblade';
		case 12:
		case 37:
		case 54:
			return 'Siren\'s Reef';
		case 25:
		case 75:
			return 'Sunqua Peak';
		case 8:
		case 53:
			return 'Underground Facility';
		case 61:
			return 'Aquatic Ruins';
		case 6:
		case 69:
			return 'Cliffside';
		case 48:
			return 'Nightmare';
		case 5:
		case 32:
			return 'Swampland';
		case 19:
			return 'Volcanic';
		case 10:
		case 40:
			return 'Molten Boss';
		case 18:
		case 42:
			return 'Captain Mai Trin';
		case 15:
		case 34:
		case 64:
			return 'Thaumanova Reactor';
		case 4:
		case 31:
		case 66:
			return 'Urban Battleground';
		case 16:
		case 41:
		case 59:
			return 'Twilight Oasis';
		case 35:
		case 60:
			return 'Solid Ocean';
		case 24:
			return 'Shattered Observatory';
		case 30:
			return 'Chaos';
		case 11:
		case 67:
			return 'Deepstone';
		case 39:
		case 58:
			return 'Molten Furnace';
		case 27:
		case 68:
			return 'Snowblind';
		default:
			return 'Error... Bad ID';
	}
}