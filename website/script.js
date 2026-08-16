const leagueData = Array.isArray(window.importedLeagueData) && window.importedLeagueData.length
	? window.importedLeagueData
	: [
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

function getLeagueById(leagueId) {
	return leagueData.find((league) => league.leagueId === leagueId) || null;
}

function getVisibleLeagues(query = '', sortBy = 'Revenue') {
	const normalizedQuery = normalizeText(query);
	const filteredLeagues = leagueData.filter((league) => {
		const haystack = [league.name, league.country, league.revenueLabel, league.sport, league.leagueType, league.founded, league.clubs].join(' ').toLowerCase();
		return haystack.includes(normalizedQuery);
	});

	const sortedLeagues = [...filteredLeagues].sort((firstLeague, secondLeague) => {
		if (sortBy === 'Highest Revenue') {
			return parseRevenue(secondLeague.revenue) - parseRevenue(firstLeague.revenue);
		}

		if (sortBy === 'Lowest Revenue') {
			return parseRevenue(firstLeague.revenue) - parseRevenue(secondLeague.revenue);
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

function renderLeagueDetail() {
	const detailContainer = document.querySelector('#league-detail');
	if (!detailContainer) {
		return null;
	}

	const params = new URLSearchParams(window.location.search);
	const leagueId = params.get('league');
	const league = getLeagueById(leagueId);
	if (!league) {
		detailContainer.innerHTML = '<p class="detail-empty">No league found for that record.</p>';
		return null;
	}

	detailContainer.innerHTML = `
		<header class="detail-hero">
			<p class="eyebrow">${league.sport} | ${league.country}</p>
			<h1>${league.name}</h1>
			<p>${league.name} is part of the imported dataset from your downloaded HTML export.</p>
		</header>

		<main class="detail-layout">
			<section class="detail-content">
				<h2>League overview</h2>
				<p>${league.name} is a ${league.leagueType.toLowerCase()} league in ${league.country}, with ${league.clubs} teams and a reported revenue of ${league.revenueLabel}.</p>
				<div class="detail-stats">
					<div class="card"><h3>Estimated revenue</h3><p>${league.revenueLabel}</p></div>
					<div class="card"><h3>Founded</h3><p>${league.founded || 'N/A'}</p></div>
					<div class="card"><h3>Clubs</h3><p>${league.clubs}</p></div>
				</div>
			</section>
			<aside class="details">
				<h2>Quick facts</h2>
				<dl class="facts">
					<div><dt>League ID</dt><dd>${league.leagueId}</dd></div>
					<div><dt>Country</dt><dd>${league.country}</dd></div>
					<div><dt>Sport</dt><dd>${league.sport}</dd></div>
					<div><dt>League type</dt><dd>${league.leagueType}</dd></div>
					<div><dt>Top team</dt><dd>${league.topTeam}</dd></div>
					<div><dt>Average salary</dt><dd>${league.averageSalary ? '$' + league.averageSalary.toLocaleString() : 'N/A'}</dd></div>
					<div><dt>Viewership</dt><dd>${league.viewership || 'N/A'}</dd></div>
				</dl>
			</aside>
		</main>
	`;

	return league;
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
	if (document.querySelector('#league-rows')) {
		window.addEventListener('DOMContentLoaded', initializeLeagueTable);
	} else if (document.querySelector('#league-detail')) {
		window.addEventListener('DOMContentLoaded', renderLeagueDetail);
	}
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		leagueData,
		parseRevenue,
		getLeagueById,
		getVisibleLeagues,
		createLeagueRow,
		renderLeagueTable,
		initializeLeagueTable,
		renderLeagueDetail
	};
}
