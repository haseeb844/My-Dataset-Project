const leagueData = [
	{
		name: 'Premier League',
		country: 'England',
		revenue: 7.2,
		revenueLabel: '$7.2B',
		sport: 'Football',
		leagueType: 'Professional',
		founded: 1992,
		clubs: 20,
		detailPage: 'premier-league.html'
	},
	{
		name: 'NFL',
		country: 'USA',
		revenue: 20,
		revenueLabel: '$20B',
		sport: 'American Football',
		leagueType: 'Professional',
		founded: 1920,
		clubs: 32,
		detailPage: 'nfl.html'
	}
];

function parseRevenue(value) {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'string') {
		const numericValue = Number(value.replace(/[^0-9.]/g, ''));
		return Number.isFinite(numericValue) ? numericValue : 0;
	}

	return 0;
}

function normalizeText(value) {
	return String(value ?? '').trim().toLowerCase();
}

function getVisibleLeagues(query = '', sortBy = 'Revenue') {
	const normalizedQuery = normalizeText(query);
	const filteredLeagues = leagueData.filter((league) => {
		const haystack = [league.name, league.country, league.revenueLabel, league.sport, league.leagueType, league.founded, league.clubs].join(' ').toLowerCase();
		return haystack.includes(normalizedQuery);
	});

	const sortedLeagues = [...filteredLeagues].sort((firstLeague, secondLeague) => {
		if (sortBy === 'Highest Revenue') {
			return parseRevenue(secondLeague.revenueLabel) - parseRevenue(firstLeague.revenueLabel);
		}

		if (sortBy === 'Lowest Revenue') {
			return parseRevenue(firstLeague.revenueLabel) - parseRevenue(secondLeague.revenueLabel);
		}

		if (sortBy === 'League Name') {
			return firstLeague.name.localeCompare(secondLeague.name);
		}

		if (sortBy === 'Founded') {
			return firstLeague.founded - secondLeague.founded;
		}

		if (sortBy === 'Clubs') {
			return firstLeague.clubs - secondLeague.clubs;
		}

		return parseRevenue(secondLeague.revenueLabel) - parseRevenue(firstLeague.revenueLabel);
	});

	return sortedLeagues;
}

function createLeagueRow(league, documentRef = document) {
	const row = documentRef.createElement('tr');

	const nameCell = documentRef.createElement('td');
	const link = documentRef.createElement('a');
	link.className = 'table-link';
	link.href = league.detailPage;
	link.textContent = `${league.name} details`;
	nameCell.appendChild(link);
	row.appendChild(nameCell);

	const countryCell = documentRef.createElement('td');
	countryCell.textContent = league.country;
	row.appendChild(countryCell);

	const revenueCell = documentRef.createElement('td');
	revenueCell.textContent = league.revenueLabel;
	row.appendChild(revenueCell);

	const sportCell = documentRef.createElement('td');
	sportCell.textContent = league.sport;
	row.appendChild(sportCell);

	const leagueTypeCell = documentRef.createElement('td');
	leagueTypeCell.textContent = league.leagueType;
	row.appendChild(leagueTypeCell);

	const foundedCell = documentRef.createElement('td');
	foundedCell.textContent = league.founded;
	row.appendChild(foundedCell);

	const clubsCell = documentRef.createElement('td');
	clubsCell.textContent = league.clubs;
	row.appendChild(clubsCell);

	return row;
}

function renderLeagueTable(options = {}) {
	const searchInput = document.querySelector('#league-search');
	const sortSelect = document.querySelector('#sort-select');
	const tableBody = document.querySelector('#league-rows');
	const resultCount = document.querySelector('#result-count');
	const totalLeagues = document.querySelector('#total-leagues');
	const currentSort = document.querySelector('#current-sort');

	if (!tableBody) {
		return null;
	}

	const query = options.query ?? searchInput?.value ?? '';
	const sortBy = options.sortBy ?? sortSelect?.value ?? 'Revenue';
	const visibleLeagues = getVisibleLeagues(query, sortBy);

	tableBody.innerHTML = '';
	visibleLeagues.forEach((league) => {
		tableBody.appendChild(createLeagueRow(league));
	});

	if (resultCount) {
		resultCount.textContent = visibleLeagues.length;
	}

	if (totalLeagues) {
		totalLeagues.textContent = leagueData.length;
	}

	if (currentSort) {
		currentSort.textContent = sortBy;
	}

	return visibleLeagues;
}

function initializeLeagueTable() {
	const searchInput = document.querySelector('#league-search');
	const sortSelect = document.querySelector('#sort-select');

	if (searchInput && sortSelect) {
		const updateTable = () => renderLeagueTable();
		searchInput.addEventListener('input', updateTable);
		sortSelect.addEventListener('change', updateTable);
	}

	renderLeagueTable();
}

if (typeof window !== 'undefined') {
	window.addEventListener('DOMContentLoaded', initializeLeagueTable);
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		leagueData,
		parseRevenue,
		getVisibleLeagues,
		createLeagueRow,
		renderLeagueTable,
		initializeLeagueTable
	};
}
