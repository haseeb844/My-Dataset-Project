import re
from typing import Any, Dict, List, Optional

league_data: List[Dict[str, Any]] = [
    {
        "name": "Premier League",
        "country": "England",
        "revenue": 7.2,
        "revenueLabel": "$7.2B",
        "sport": "Football",
        "leagueType": "Professional",
        "founded": 1992,
        "clubs": 20,
        "detailPage": "premier-league.html",
    },
    {
        "name": "NFL",
        "country": "USA",
        "revenue": 20,
        "revenueLabel": "$20B",
        "sport": "American Football",
        "leagueType": "Professional",
        "founded": 1920,
        "clubs": 32,
        "detailPage": "nfl.html",
    },
]


def parse_revenue(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        numeric_value = re.sub(r"[^0-9.]", "", value)
        return float(numeric_value) if numeric_value else 0.0

    return 0.0


def normalize_text(value: Any) -> str:
    return str(value or "").strip().lower()


def get_visible_leagues(query: str = "", sort_by: str = "Revenue") -> List[Dict[str, Any]]:
    normalized_query = normalize_text(query)
    filtered_leagues = []

    for league in league_data:
        haystack = " ".join([
            league["name"],
            league["country"],
            league["revenueLabel"],
            league["sport"],
            league["leagueType"],
            str(league["founded"]),
            str(league["clubs"]),
        ]).lower()

        if not normalized_query or normalized_query in haystack:
            filtered_leagues.append(league)

    if sort_by == "Highest Revenue":
        filtered_leagues.sort(key=lambda league: parse_revenue(league["revenueLabel"]), reverse=True)
    elif sort_by == "Lowest Revenue":
        filtered_leagues.sort(key=lambda league: parse_revenue(league["revenueLabel"]))
    elif sort_by == "League Name":
        filtered_leagues.sort(key=lambda league: league["name"])
    elif sort_by == "Founded":
        filtered_leagues.sort(key=lambda league: league["founded"])
    elif sort_by == "Clubs":
        filtered_leagues.sort(key=lambda league: league["clubs"])
    else:
        filtered_leagues.sort(key=lambda league: parse_revenue(league["revenueLabel"]), reverse=True)

    return filtered_leagues


def create_league_row(league: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": league["name"],
        "country": league["country"],
        "revenue": league["revenueLabel"],
        "sport": league["sport"],
        "leagueType": league["leagueType"],
        "founded": league["founded"],
        "clubs": league["clubs"],
        "detailPage": league["detailPage"],
        "display_name": f"{league['name']} details",
    }


def render_league_table(query: str = "", sort_by: str = "Revenue") -> Dict[str, Any]:
    visible_leagues = get_visible_leagues(query, sort_by)
    rows = [create_league_row(league) for league in visible_leagues]

    return {
        "rows": rows,
        "result_count": len(rows),
        "total_leagues": len(league_data),
        "current_sort": sort_by,
    }


def initialize_league_table(search_query: str = "", sort_by: str = "Revenue") -> Dict[str, Any]:
    return render_league_table(search_query, sort_by)


if __name__ == "__main__":
    result = render_league_table()
    print(result)
