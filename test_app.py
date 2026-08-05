import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SportsLeagueAppTests(unittest.TestCase):
    def read(self, relative_path: str) -> str:
        return (ROOT / relative_path).read_text(encoding='utf-8')

    def test_homepage_contains_search_controls_and_all_required_columns(self) -> None:
        html = self.read('index.html')

        self.assertIn('id="league-search"', html)
        self.assertIn('id="sort-select"', html)
        self.assertIn('id="league-rows"', html)
        self.assertIn('id="result-count"', html)
        self.assertIn('id="total-leagues"', html)
        self.assertIn('id="current-sort"', html)
        self.assertIn('const leagueData = [', html)
        self.assertIn('Premier League', html)
        self.assertIn('NFL', html)
        self.assertIn('initializeLeagueTable', html)

        for header in ['League', 'Country', 'Revenue', 'Sport', 'League Type', 'Founded', 'Clubs']:
            self.assertIn(f'<th>{header}</th>', html)

    def test_all_local_links_point_to_existing_files(self) -> None:
        for html_file in ['index.html', 'premier-league.html', 'nfl.html']:
            html = self.read(html_file)
            hrefs = re.findall(r'href=["\']([^"\']+)["\']', html)
            for href in hrefs:
                if href.startswith('#') or href.startswith('http') or href.startswith('mailto:'):
                    continue
                target = (ROOT / href).resolve()
                self.assertTrue(target.exists(), f'{html_file} points to a missing file: {href}')

    def test_detail_pages_include_expected_facts_and_navigation(self) -> None:
        premier = self.read('premier-league.html')
        nfl = self.read('nfl.html')

        self.assertIn('Premier League', premier)
        self.assertIn('England', premier)
        self.assertIn('Football', premier)
        self.assertIn('Professional', premier)
        self.assertIn('Founded', premier)
        self.assertIn('Clubs', premier)
        self.assertIn('href="index.html"', premier)

        self.assertIn('National Football League', nfl)
        self.assertIn('United States', nfl)
        self.assertIn('American Football', nfl)
        self.assertIn('Professional', nfl)
        self.assertIn('Founded', nfl)
        self.assertIn('Clubs', nfl)
        self.assertIn('href="premier-league.html"', nfl)

    def test_script_contains_structured_league_data_and_query_logic(self) -> None:
        script = self.read('script.py')

        self.assertIn("'name': 'Premier League'", script)
        self.assertIn("'name': 'NFL'", script)
        self.assertIn("'revenueLabel': '$7.2B'", script)
        self.assertIn("'revenueLabel': '$20B'", script)
        self.assertIn("'founded': 1992", script)
        self.assertIn("'founded': 1920", script)
        self.assertIn("'clubs': 20", script)
        self.assertIn("'clubs': 32", script)
        self.assertIn('def get_visible_leagues', script)
        self.assertIn('def render_league_table', script)
        self.assertIn('def initialize_league_table', script)
        self.assertIn('normalized_query in', script)
        self.assertIn("sort_by == 'Highest Revenue'", script)
        self.assertIn("sort_by == 'Lowest Revenue'", script)
        self.assertIn("sort_by == 'League Name'", script)

    def test_query_behavior_matches_the_expected_league_data(self) -> None:
        league_data = [
            {
                'name': 'Premier League',
                'country': 'England',
                'revenueLabel': '$7.2B',
                'sport': 'Football',
                'leagueType': 'Professional',
                'founded': 1992,
                'clubs': 20,
            },
            {
                'name': 'NFL',
                'country': 'USA',
                'revenueLabel': '$20B',
                'sport': 'American Football',
                'leagueType': 'Professional',
                'founded': 1920,
                'clubs': 32,
            },
        ]

        def parse_revenue(value: str) -> float:
            return float(re.sub(r'[^0-9.]', '', value))

        def get_visible_leagues(query: str = '', sort_by: str = 'Revenue') -> list[dict]:
            normalized_query = query.strip().lower()
            filtered = [league for league in league_data if normalized_query in ' '.join([
                league['name'],
                league['country'],
                league['revenueLabel'],
                league['sport'],
                league['leagueType'],
                str(league['founded']),
                str(league['clubs']),
            ]).lower()]
            if not normalized_query:
                filtered = list(league_data)
            if sort_by == 'Highest Revenue':
                return sorted(filtered, key=lambda league: parse_revenue(league['revenueLabel']), reverse=True)
            if sort_by == 'Lowest Revenue':
                return sorted(filtered, key=lambda league: parse_revenue(league['revenueLabel']))
            if sort_by == 'League Name':
                return sorted(filtered, key=lambda league: league['name'])
            if sort_by == 'Founded':
                return sorted(filtered, key=lambda league: league['founded'])
            if sort_by == 'Clubs':
                return sorted(filtered, key=lambda league: league['clubs'])
            return sorted(filtered, key=lambda league: parse_revenue(league['revenueLabel']), reverse=True)

        premier_matches = get_visible_leagues('premier')
        self.assertEqual([league['name'] for league in premier_matches], ['Premier League'])

        football_matches = get_visible_leagues('football')
        self.assertEqual([league['name'] for league in football_matches], ['Premier League'])

        all_matches = get_visible_leagues('')
        self.assertEqual([league['name'] for league in all_matches], ['NFL', 'Premier League'])

        founded_order = get_visible_leagues('', 'Founded')
        self.assertEqual([league['name'] for league in founded_order], ['Premier League', 'NFL'])

        clubs_order = get_visible_leagues('', 'Clubs')
        self.assertEqual([league['name'] for league in clubs_order], ['Premier League', 'NFL'])


if __name__ == '__main__':
    unittest.main()
