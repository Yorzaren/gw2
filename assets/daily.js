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
	if ($('#toggle-dailies').hasClass('active')) { // Disable
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
		$('#' + target_prefix + '-fracs').append('<li>' + rec_num[i] + ' (' + getFractalName(rec_num[i]) + ')' + '</li>');
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

function getFractalName(frac_id) {
	frac_id = parseInt(frac_id);
	switch (frac_id) {
		case 0:
			return "Mistlock Observatory";
		case 14:
		case 45:
		case 65:
		case 70:
		case 96:
			return "Aetherblade";
		case 7:
		case 26:
		case 61:
		case 76:
			return "Aquatic Ruins";
		case 18:
		case 42:
		case 71:
		case 95:
			return "Captain Mai Trin Boss";
		case 13:
		case 30:
		case 38:
		case 63:
		case 88:
			return "Chaos";
		case 6:
		case 21:
		case 46:
		case 68:
		case 94:
			return "Cliffside";
		case 11:
		case 33:
		case 67:
		case 84:
			return "Deepstone";
		case 10:
		case 40:
		case 69:
		case 90:
			return "Molten Boss";
		case 9:
		case 17:
		case 39:
		case 58:
		case 83:
			return "Molten Furnace";
		case 22:
		case 47:
		case 72:
		case 97:
			return "Nightmare";
		case 23:
		case 48:
		case 73:
		case 98:
			return "Shattered Observatory";
		case 25:
		case 50:
		case 75:
		case 100:
			return "Silent Surf";
		case 12:
		case 37:
		case 54:
		case 78:
			return "Siren's Reef";
		case 3:
		case 27:
		case 51:
		case 86:
		case 93:
			return "Snowblind";
		case 24:
		case 49:
		case 74:
		case 99:
			return "Sunqua Peak";
		case 20:
		case 35:
		case 44:
		case 60:
		case 80:
			return "Solid Ocean";
		case 5:
		case 32:
		case 56:
		case 77:
		case 89:
			return "Swampland";
		case 15:
		case 34:
		case 43:
		case 55:
		case 64:
		case 82:
			return "Thaumanova Reactor";
		case 16:
		case 41:
		case 59:
		case 87:
			return "Twilight Oasis";
		case 2:
		case 36:
		case 62:
		case 79:
		case 91:
			return "Uncategorized";
		case 8:
		case 29:
		case 53:
		case 81:
			return "Underground Facility";
		case 4:
		case 31:
		case 57:
		case 66:
		case 85:
			return "Urban Battleground";
		case 1:
		case 19:
		case 28:
		case 52:
		case 92:
			return "Volcanic";
		default:
			return "Unknown Scale";
	}
}